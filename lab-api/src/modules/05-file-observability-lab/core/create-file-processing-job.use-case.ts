import { InjectRepository } from "@nestjs/typeorm";
import { FileProcessingJobEntity, FileProcessingJobStatus } from "../domain/file-processing-job.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

type CreateFileProcessingJobInput = {
    fileName: string;
}

@Injectable()
export class CreateFileProcessingJobUseCase {

    constructor(
        @InjectRepository(FileProcessingJobEntity)
        private readonly fileProcessingJobRepository: Repository<FileProcessingJobEntity>
    ){}

    async execute(input: CreateFileProcessingJobInput){
        const job = this.fileProcessingJobRepository.create({
            fileName: input.fileName,
            status: FileProcessingJobStatus.PENDING,
            totalRows: null,
            processedRows: 0,
            failedRows: 0,
            lastError: null
        });

        return this.fileProcessingJobRepository.save(job);
    }
}