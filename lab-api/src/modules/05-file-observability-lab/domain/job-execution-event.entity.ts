import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FileProcessingJobEntity } from "./file-processing-job.entity";

export enum JobExecutionEventType {
    JOB_STARTED = 'JOB_STARTED',
    JOB_COMPLETED = 'JOB_COMPLETED',
    JOB_FAILED = 'JOB_FAILED',
}

@Entity('job_execution_event')
export class JobExecutionEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_type', type: 'varchar' })
    eventType: JobExecutionEventType;

    @Column({ name: 'message', type: 'varchar' })
    message: string;

    @ManyToOne(() => FileProcessingJobEntity)
    @JoinColumn({ name: 'job_id' })
    job: FileProcessingJobEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}