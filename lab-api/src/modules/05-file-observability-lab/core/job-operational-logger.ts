// src/modules/05-file-processing-observability-lab/core/job-operational.logger.ts

import { Injectable, Logger } from '@nestjs/common';
import { FileProcessingJobEntity } from '../domain/file-processing-job.entity';
import { JobExecutionEventType } from '../domain/job-execution-event.entity';
import { JobLogIndexerService } from './job-log-indexer.service';

@Injectable()
export class JobOperationalLogger {

  private readonly logger = new Logger(JobOperationalLogger.name);

  constructor(
    private readonly jobLogIndexerService: JobLogIndexerService,
  ) {}

  async jobStarted(job: FileProcessingJobEntity): Promise<void> {
    const log = {
      eventType: JobExecutionEventType.JOB_STARTED,
      jobId: job.id,
      fileName: job.fileName,
      status: job.status,
      message: 'Job execution started',
      timestamp: new Date().toISOString(),
    };

    this.logger.log(log);
    await this.jobLogIndexerService.index(log);
  }

  async jobCompleted(job: FileProcessingJobEntity): Promise<void> {
    const log = {
      eventType: JobExecutionEventType.JOB_COMPLETED,
      jobId: job.id,
      fileName: job.fileName,
      status: job.status,
      durationMs: job.durationMs,
      message: 'Job execution completed',
      timestamp: new Date().toISOString(),
    };

    this.logger.log(log);
    await this.jobLogIndexerService.index(log);
  }

  async jobFailed(job: FileProcessingJobEntity): Promise<void> {
    const log = {
      eventType: JobExecutionEventType.JOB_FAILED,
      jobId: job.id,
      fileName: job.fileName,
      status: job.status,
      durationMs: job.durationMs,
      error: job.lastError,
      message: 'Job execution failed',
      timestamp: new Date().toISOString(),
    };

    this.logger.error(log);
    await this.jobLogIndexerService.index(log);
  }
}