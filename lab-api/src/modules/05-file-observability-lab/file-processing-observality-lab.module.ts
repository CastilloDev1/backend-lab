import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileProcessingJobEntity } from "./domain/file-processing-job.entity";
import { FileProcessingController } from "./http/file-processing.controller";
import { CreateFileProcessingJobUseCase } from "./core/create-file-processing-job.use-case";
import { ProcessFileProcessingJobUseCase } from "./core/process-file-processing-job.use-case";
import { CreateJobExecutionEventUseCase } from "./core/create-job-execution-event.use-case";
import { JobExecutionEventEntity } from "./domain/job-execution-event.entity";
import { JobOperationalLogger } from "./core/job-operational-logger";

@Module({
    imports: [TypeOrmModule.forFeature([FileProcessingJobEntity, JobExecutionEventEntity])],
    controllers: [FileProcessingController],
    providers: [CreateFileProcessingJobUseCase, ProcessFileProcessingJobUseCase, CreateJobExecutionEventUseCase, JobOperationalLogger],
})
export class FileProcessingObservalityLabModule {}