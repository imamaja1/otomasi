import QRCode from 'qrcode';
import { logger } from '../../config/logger';

export class WhatsAppInstance {
  readonly accountId: number;
  readonly phoneNumber: string;
  readonly sessionPath: string;
  readonly applicationId: number;
  private client: any = null;
  private _state: string = 'idle';
  private _qrCode: string | null = null;
  private _qrGeneratedAt: Date | null = null;
  private _lastError: string | null = null;

  constructor(data: { accountId: number; applicationId: number; phoneNumber: string; sessionPath: string }) {
    this.accountId = data.accountId;
    this.applicationId = data.applicationId;
    this.phoneNumber = data.phoneNumber;
    this.sessionPath = data.sessionPath;
  }

  get state() { return this._state; }
  get isReady() { return this._state === 'ready'; }

  async initialize(): Promise<void> {
    this._state = 'initializing';
    try {
      const wa = await import('whatsapp-web.js');
      const Client = wa.default.Client || wa.Client;
      let authStrategy;

      try {
        const LocalAuth = wa.default.LocalAuth || wa.LocalAuth;
        authStrategy = new LocalAuth({ dataPath: this.sessionPath });
      } catch {
        const NoAuth = wa.default.NoAuth || wa.NoAuth;
        authStrategy = new NoAuth();
        logger.warn(`Account ${this.accountId}: Using NoAuth`);
      }

      this.client = new Client({
        authStrategy,
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: this.findChromePath(),
        },
      });

      this.client.on('qr', (qr: string) => {
        this._qrCode = qr;
        this._qrGeneratedAt = new Date();
        this._state = 'awaiting_scan';
        logger.info(`Account ${this.accountId} (${this.phoneNumber}): QR ready`);
      });

      this.client.on('ready', () => {
        this._state = 'ready';
        logger.info(`Account ${this.accountId} (${this.phoneNumber}): Ready`);
      });

      this.client.on('disconnected', (reason: string) => {
        this._state = 'disconnected';
        logger.warn(`Account ${this.accountId}: Disconnected — ${reason}`);
      });

      await this.client.initialize();
    } catch (err: any) {
      this._state = 'error';
      this._lastError = err.message;
      logger.error(`Account ${this.accountId}: Init failed — ${err.message}`);
    }
  }

  async sendMessage(to: string, message: string): Promise<{ status: string }> {
    if (!this.isReady || !this.client) {
      return { status: 'pending' };
    }
    const formatted = to.includes('@c.us') ? to : `${to}@c.us`;
    await this.client.sendMessage(formatted, message);
    return { status: 'sent' };
  }

  async logout(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this._state = 'logged_out';
    }
  }

  getQr(): { qr: string | null; state: string; lastError: string | null; generatedAt: Date | null } {
    return {
      qr: this._qrCode,
      state: this._state,
      lastError: this._lastError,
      generatedAt: this._qrGeneratedAt,
    };
  }

  async getQrImage(): Promise<Buffer | null> {
    if (!this._qrCode) return null;
    return QRCode.toBuffer(this._qrCode, { type: 'png', width: 400, margin: 2 });
  }

  getStatus(): { accountId: number; phoneNumber: string; state: string; isReady: boolean; lastError: string | null } {
    return {
      accountId: this.accountId,
      phoneNumber: this.phoneNumber,
      state: this._state,
      isReady: this.isReady,
      lastError: this._lastError,
    };
  }

  private findChromePath(): string | undefined {
    const paths = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/snap/bin/chromium'];
    for (const p of paths) {
      try { require('fs').accessSync(p, require('fs').constants.X_OK); return p; } catch {}
    }
    return undefined;
  }
}
