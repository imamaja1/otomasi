import { type Repository } from 'typeorm';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../../database/datasource';
import { EmailMessage } from './entities/email-message.entity';
import { Template } from './entities/template.entity';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class EmailService {
  private emailRepo: Repository<EmailMessage>;
  private templateRepo: Repository<Template>;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.emailRepo = AppDataSource.getRepository(EmailMessage);
    this.templateRepo = AppDataSource.getRepository(Template);
    this.initTransporter();
  }

  private initTransporter() {
    if (!env.SMTP_HOST) {
      logger.warn('SMTP not configured');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: parseInt(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string, applicationId?: number): Promise<EmailMessage> {
    const msg = this.emailRepo.create({
      to,
      subject,
      body,
      applicationId,
      status: 'pending',
    });
    const saved = await this.emailRepo.save(msg);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_USER || 'noreply@automation.server',
          to,
          subject,
          html: body,
        });
        saved.status = 'sent';
        saved.sentAt = new Date();
        logger.info(`Email sent to ${to}`);
      } catch (err: any) {
        saved.status = 'failed';
        saved.error = err.message;
        logger.error(err, `Failed to send email to ${to}`);
      }
      await this.emailRepo.save(saved);
    } else {
      saved.status = 'queued';
      await this.emailRepo.save(saved);
      logger.info(`Email queued for ${to} (SMTP not configured)`);
    }

    return saved;
  }

  async renderTemplate(templateName: string, variables: Record<string, string>): Promise<{ subject: string; body: string }> {
    const template = await this.templateRepo.findOne({ where: { name: templateName } });
    if (!template) throw new Error(`Template ${templateName} not found`);

    let body = template.body;
    let subject = template.subject || '';

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, value);
      subject = subject.replace(regex, value);
    }

    return { subject, body };
  }

  async createTemplate(name: string, type: string, body: string, subject?: string): Promise<Template> {
    const template = this.templateRepo.create({ name, type, body, subject });
    return this.templateRepo.save(template);
  }

  async updateEmailStatus(messageId: number, status: string, error?: string): Promise<void> {
    const update: Partial<EmailMessage> = { status };
    if (status === 'sent') update.sentAt = new Date();
    if (error) update.error = error;
    await this.emailRepo.update(messageId, update);
  }
}
