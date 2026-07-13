import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { WhatsAppAccount } from './whatsapp-account.entity';

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'application_id' })
  applicationId: number;

  @Column({ type: 'int', nullable: true, name: 'account_id' })
  accountId: number;

  @Column({ type: 'varchar', length: 30, name: 'to_number' })
  toNumber: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'from_number' })
  fromNumber: string;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'sent_at' })
  sentAt: Date;

  @ManyToOne(() => WhatsAppAccount, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'account_id' })
  account: WhatsAppAccount;
}
