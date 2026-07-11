import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

export class WhatsAppService {
  private messageRepo: Repository<WhatsAppMessage>;
  private client: any = null;
  private isReady: boolean = false;
  private qrCode: string | null = null;
  private qrGeneratedAt: Date | null = null;

  constructor() {
    this.messageRepo = AppDataSource.getRepository(WhatsAppMessage);
  }

  async initialize(): Promise<void> {
    try {
      const wa = await import('whatsapp-web.js');
      const Client = wa.default.Client || wa.Client;
      let authStrategy;

      try {
        const LocalAuth = wa.default.LocalAuth || wa.LocalAuth;
        authStrategy = new LocalAuth({ dataPath: env.WHATSAPP_SESSION_PATH });
      } catch {
        const NoAuth = wa.default.NoAuth || wa.NoAuth;
        authStrategy = new NoAuth();
        logger.warn('Using NoAuth - LocalAuth not available');
      }

      this.client = new Client({
        authStrategy,
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      this.client.on('qr', (qr: string) => {
        this.qrCode = qr;
        this.qrGeneratedAt = new Date();
        logger.info('QR ready — GET /api/v1/whatsapp/qr to retrieve');
        import('qrcode-terminal').then((mod: any) => {
          const qrcode = mod.default || mod;
          qrcode.generate(qr, { small: true });
        }).catch(() => {
          logger.info({ qr }, 'Scan this QR code with WhatsApp');
        });
      });

      this.client.on('ready', () => {
        this.isReady = true;
        logger.info('WhatsApp client is ready');
      });

      this.client.on('message', async (msg: any) => {
        logger.info({ from: msg.from, body: msg.body }, 'WhatsApp message received');
      });

      this.client.on('disconnected', (reason: string) => {
        this.isReady = false;
        logger.warn(`WhatsApp disconnected: ${reason}`);
      });

      await this.client.initialize();
    } catch (err) {
      logger.error(err, 'Failed to initialize WhatsApp client');
    }
  }

  async sendMessage(to: string, message: string): Promise<{ id: number; status: string }> {
    const msg = this.messageRepo.create({
      toNumber: to,
      message,
      status: 'pending',
    });
    const saved = await this.messageRepo.save(msg);

    if (this.isReady && this.client) {
      try {
        const formatted = to.includes('@c.us') ? to : `${to}@c.us`;
        await this.client.sendMessage(formatted, message);
        saved.status = 'sent';
        saved.sentAt = new Date();
        await this.messageRepo.save(saved);
      } catch (err: any) {
        saved.status = 'failed';
        saved.error = err.message;
        await this.messageRepo.save(saved);
        throw err;
      }
    }

    return { id: saved.id, status: saved.status };
  }

  getQr(): { qr: string | null; isReady: boolean; generatedAt: Date | null } {
    return {
      qr: this.qrCode,
      isReady: this.isReady,
      generatedAt: this.qrGeneratedAt,
    };
  }

  async getStatus(): Promise<{ isReady: boolean }> {
    return { isReady: this.isReady };
  }

  async updateMessageStatus(messageId: number, status: string, error?: string): Promise<void> {
    const update: Partial<WhatsAppMessage> = { status };
    if (status === 'sent') update.sentAt = new Date();
    if (error) update.error = error;
    await this.messageRepo.update(messageId, update);
  }

  async logout(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.isReady = false;
      logger.info('WhatsApp logged out');
    }
  }
}
