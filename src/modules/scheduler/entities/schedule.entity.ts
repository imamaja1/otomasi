import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'cron_expression' })
  cronExpression: string;

  @Column({ type: 'varchar', length: 50, name: 'job_type' })
  jobType: string;

  @Column({ type: 'json', nullable: true, name: 'job_data' })
  jobData: Record<string, unknown>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'last_run_at' })
  lastRunAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
