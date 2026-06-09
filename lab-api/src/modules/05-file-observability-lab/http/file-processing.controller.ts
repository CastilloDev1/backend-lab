import { Body, Controller, Param, Post } from "@nestjs/common";
import { CreateFileProcessingJobUseCase } from "../core/create-file-processing-job.use-case";
import { ProcessFileProcessingJobUseCase } from "../core/process-file-processing-job.use-case";

type createFileProcessingJobRequest = {
    fileName: string;
}

@Controller('file-processing/jobs')
export class FileProcessingController {

    constructor(
        private readonly createFileProcessingJobUseCase: CreateFileProcessingJobUseCase,
        private readonly processFileProcessingJobUseCase: ProcessFileProcessingJobUseCase,
    ){}

    @Post()
    async createJob(@Body() body: createFileProcessingJobRequest) {
        const job = await this.createFileProcessingJobUseCase.execute({
            fileName: body.fileName
        });
        
        return {
            jobId: job.id,
            status: job.status,
            fileName: job.fileName,
            message: 'File processing job created'
        };
    }

    @Post(':jobId/process')
    async processJob(
        @Param('jobId') jobId: string,
    ){
        const job = 
            await this.processFileProcessingJobUseCase.execute(jobId);

        return {
            jobId: job.id,
            status: job.status,
        }
    }
}