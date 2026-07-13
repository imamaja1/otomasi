import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Application } from '../../auth/entities/application.entity';
import { WhatsAppMessage } from './whatsapp-message.entity';

@Entity('whatsapp_accounts')
export class WhatsAppAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'application_id', unique: true })
  applicationId: number;

  @Column({ type: 'varchar', length: 30, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, name: 'session_path' })
  sessionPath: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @OneToMany(() => WhatsAppMessage, (msg) => msg.account)
  messages: WhatsAppMessage[];
}
