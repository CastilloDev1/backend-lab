// src/modules/05-file-processing-observability-lab/core/job-operational.logger.ts

import { Injectable, Logger } from '@nestjs/common';
import { FileProcessingJobEntity } from '../domain/file-processing-job.entity';
import { JobExecutionEventType } from '../domain/job-execution-event.entity';

@Injectable()
export class JobOperationalLogger {

  private readonly logger = new Logger(JobOperationalLogger.name);

  jobStarted(job: FileProcessingJobEntity): void {
    this.logger.log({
        eventType: JobExecutionEventType.JOB_STARTED,
        jobId: job.id,
        fileName: job.fileName,
        status: job.status,
        message: 'Job execution started'
    });
  }

  jobCompleted(job: FileProcessingJobEntity): void {
    this.logger.log({
        eventType: JobExecutionEventType.JOB_COMPLETED,
        jobId: job.id,
        fileName: job.fileName,
        status: job.status,
        durationMs: job.durationMs,
        message: 'Job execution completed'
    });
  }

  jobFailed(job: FileProcessingJobEntity): void {
    this.logger.error({
        eventType: JobExecutionEventType.JOB_FAILED,
        jobId: job.id,
        fileName: job.fileName,
        status: job.status,
        durationMs: job.durationMs,
        error: job.lastError,
        message: 'Job execution failed'
    });
  }
}