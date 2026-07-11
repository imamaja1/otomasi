import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_requests')
export class AiRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'application_id' })
  applicationId: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'json' })
  input: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  output: Record<string, unknown>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
