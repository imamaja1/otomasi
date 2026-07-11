import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { AiRequest } from './entities/ai-request.entity';
import { queueManager, QueueName } from '../queue/queue.manager';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

interface AiResponse {
  type: string;
  content: string;
  model?: string;
}

export class AiService {
  private aiRepo: Repository<AiRequest>;
  private baseUrl: string;

  constructor() {
    this.aiRepo = AppDataSource.getRepository(AiRequest);
    this.baseUrl = env.AI_SERVICE_URL || 'http://localhost:5000';
  }

  async chat(userMessage: string, context?: string, applicationId?: number): Promise<AiResponse> {
    const result = await this.sendToAiService('chat', {
      message: userMessage,
      context: context || '',
    });

    await this.aiRepo.save(
      this.aiRepo.create({
        applicationId,
        type: 'chat',
        input: { message: userMessage, context },
        output: { content: result.content },
        model: result.model || 'default',
      }),
    );

    return result;
  }

  async summarizeText(text: string, maxLength?: number, applicationId?: number): Promise<AiResponse> {
    const result = await this.sendToAiService('summarize', {
      text,
      maxLength: maxLength || 200,
    });

    await this.aiRepo.save(
      this.aiRepo.create({
        applicationId,
        type: 'summarization',
        input: { text, maxLength },
        output: { content: result.content },
        model: result.model || 'default',
      }),
    );

    return result;
  }

  async classifyText(text: string, categories: string[], applicationId?: number): Promise<AiResponse> {
    const result = await this.sendToAiService('classify', {
      text,
      categories,
    });

    await this.aiRepo.save(
      this.aiRepo.create({
        applicationId,
        type: 'classification',
        input: { text, categories },
        output: { content: result.content },
        model: result.model || 'default',
      }),
    );

    return result;
  }

  async processText(text: string, operation: string, applicationId?: number): Promise<AiResponse> {
    const result = await this.sendToAiService(operation, { text });

    await this.aiRepo.save(
      this.aiRepo.create({
        applicationId,
        type: operation,
        input: { text },
        output: { content: result.content },
        model: result.model || 'default',
      }),
    );

    return result;
  }

  private async sendToAiService(type: string, data: Record<string, unknown>): Promise<AiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      const result = await response.json();
      return result as AiResponse;
    } catch (err: any) {
      logger.error(err, 'AI service request failed - using fallback');

      return {
        type,
        content: JSON.stringify({
          message: 'AI service is not available. This is a fallback response.',
          original_type: type,
        }),
        model: 'fallback',
      };
    }
  }
}
