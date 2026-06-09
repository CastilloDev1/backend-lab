import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FileProcessingJobEntity, FileProcessingJobStatus } from "../domain/file-processing-job.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateJobExecutionEventUseCase } from "./create-job-execution-event.use-case";
import { JobExecutionEventType } from "../domain/job-execution-event.entity";
import { JobOperationalLogger } from "./job-operational-logger";

export class ProcessFileProcessingJobUseCase {

    constructor(
        @InjectRepository(FileProcessingJobEntity)
        private readonly fileprocessingJobRepository: Repository<FileProcessingJobEntity>,
        private readonly createJobExecutionEventUseCase: CreateJobExecutionEventUseCase,
        private readonly jobOperationalLogger: JobOperationalLogger
    ){}

    async execute(jobId: string){
        const job = await this.fileprocessingJobRepository.findOne({
            where: { id: jobId}
        });

        if(!job){
            throw new NotFoundException('Job not found');
        }
        await this.createJobExecutionEventUseCase.execute(job, JobExecutionEventType.JOB_STARTED, 'Job execution started');

        if (job.status !== FileProcessingJobStatus.PENDING){
            throw new BadRequestException(
                `Job status must be PENDING. Current status is ${job.status}`
            );
        }

        job.status = FileProcessingJobStatus.PROCESSING;
        job.startedAt = new Date();

        this.jobOperationalLogger.jobStarted(job);
        await this.fileprocessingJobRepository.save(job);

        try {
            await this.simulateProcessing();
            const completedAt = new Date();
            job.status = FileProcessingJobStatus.COMPLETED;
            job.completedAt = completedAt;
            job.durationMs = completedAt.getTime() - job.startedAt.getTime();

            await this.createJobExecutionEventUseCase.execute(
                job,
                JobExecutionEventType.JOB_COMPLETED,
                'Job execution completed'
            );

            this.jobOperationalLogger.jobCompleted(job);
        } catch (error) {
            const completedAt = new Date();
            job.status = FileProcessingJobStatus.FAILED;
            job.completedAt = completedAt;
            job.durationMs = completedAt.getTime() - job.startedAt.getTime();
            job.lastError = 
                error instanceof Error ? error.message : 'Unknown error';
            await this.createJobExecutionEventUseCase.execute(
                job,
                JobExecutionEventType.JOB_FAILED,
                'Job execution failed'
            );
            this.jobOperationalLogger.jobFailed(job);
        } finally {
            return this.fileprocessingJobRepository.save(job);
        }
    }

    private async simulateProcessing(): Promise<void>{
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}