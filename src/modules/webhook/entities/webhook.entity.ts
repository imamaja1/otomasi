import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'application_id' })
  applicationId: number;

  @Column({ type: 'varchar', length: 100 })
  event: string;

  @Column({ type: 'varchar', length: 100 })
  source: string;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Index()
  @Column({ type: 'varchar', length: 30, default: 'received' })
  status: string;

  @Column({ type: 'datetime', nullable: true, name: 'processed_at' })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
