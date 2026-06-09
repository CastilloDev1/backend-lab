import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum FileProcessingJobStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity('file_processing_job')
export class FileProcessingJobEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'status', type: 'varchar'})
    status: FileProcessingJobStatus;

    @Column({ name: 'total_rows', type: 'integer', nullable: true })
    totalRows: number | null;

    @Column({ name: 'processed_rows', type: 'integer', default: 0 })
    processedRows: number;

    @Column({ name: 'failed_rows', type: 'integer', default: 0 })
    failedRows: number;

    @Column({ name: 'last_error', type: 'text', nullable: true })
    lastError: string | null;

    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt: Date | null;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt: Date | null;

    @Column({ name: 'duration_ms', type: 'bigint', nullable: true })
    durationMs: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}