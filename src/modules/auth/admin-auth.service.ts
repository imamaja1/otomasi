import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { type Repository } from 'typeorm';
import { AppDataSource } from '../../database/datasource';
import { Admin } from './entities/admin.entity';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class AdminAuthService {
  private adminRepo: Repository<Admin>;

  constructor() {
    this.adminRepo = AppDataSource.getRepository(Admin);
  }

  async login(username: string, password: string): Promise<{ token: string; admin: { id: number; username: string; role: string } } | null> {
    const admin = await this.adminRepo.findOne({ where: { username, isActive: true } });
    if (!admin) return null;

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return null;

    await this.adminRepo.update(admin.id, { lastLoginAt: new Date() });

    const payload = { id: admin.id, username: admin.username, role: admin.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });

    logger.info(`Admin ${admin.username} logged in`);
    return { token, admin: { id: admin.id, username: admin.username, role: admin.role } };
  }

  async validateToken(token: string): Promise<{ id: number; username: string; role: string } | null> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number; username: string; role: string };
      const admin = await this.adminRepo.findOne({ where: { id: decoded.id, isActive: true } });
      if (!admin) return null;
      return decoded;
    } catch {
      return null;
    }
  }

  async createAdmin(username: string, password: string, role: string = 'admin'): Promise<Admin> {
    if (!['admin', 'superadmin'].includes(role)) throw new Error('Invalid role');
    const hash = await bcrypt.hash(password, 10);
    const admin = this.adminRepo.create({ username, password: hash, role });
    return this.adminRepo.save(admin);
  }

  async listAdmins(): Promise<Admin[]> {
    return this.adminRepo.find({ select: { id: true, username: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
  }

  async seedDefault(): Promise<void> {
    const count = await this.adminRepo.count();
    if (count === 0) {
      await this.createAdmin('admin', 'changeme123', 'superadmin');
      logger.info('Default admin created: admin / changeme123');
    }
  }
}

export const adminAuthService = new AdminAuthService();
