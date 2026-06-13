import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileProcessingJobEntity } from "./domain/file-processing-job.entity";
import { FileProcessingController } from "./http/file-processing.controller";
import { CreateFileProcessingJobUseCase } from "./core/create-file-processing-job.use-case";
import { ProcessFileProcessingJobUseCase } from "./core/process-file-processing-job.use-case";
import { CreateJobExecutionEventUseCase } from "./core/create-job-execution-event.use-case";
import { JobExecutionEventEntity } from "./domain/job-execution-event.entity";
import { JobOperationalLogger } from "./core/job-operational-logger";
import { JobLogIndexerService } from "./core/job-log-indexer.service";
import { OpenSearchClientProvider } from "./core/opensearch.client";
import { HttpRequestLogIndexerService } from "./core/http-request-log-indexer.service";
import { HttpRequestLoggingInterceptor } from "./core/http-request-logging.interceptor";

@Module({
    imports: [TypeOrmModule.forFeature([FileProcessingJobEntity, JobExecutionEventEntity])],
    controllers: [FileProcessingController],
    providers: [
        CreateFileProcessingJobUseCase,
        ProcessFileProcessingJobUseCase,
        CreateJobExecutionEventUseCase,
        JobOperationalLogger,
        JobLogIndexerService,
        OpenSearchClientProvider,
        HttpRequestLogIndexerService,
        HttpRequestLoggingInterceptor,
    ],
})
export class FileProcessingObservalityLabModule {}