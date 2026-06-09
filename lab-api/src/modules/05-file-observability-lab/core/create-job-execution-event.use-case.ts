import { InjectRepository } from "@nestjs/typeorm";
import { JobExecutionEventEntity, JobExecutionEventType } from "../domain/job-execution-event.entity";
import { Repository } from "typeorm";
import { FileProcessingJobEntity } from "../domain/file-processing-job.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateJobExecutionEventUseCase {

    constructor(
        @InjectRepository(JobExecutionEventEntity)
        private readonly jobExecutionEventEntityRepository: Repository<JobExecutionEventEntity>
    ){}

    async execute(job: FileProcessingJobEntity, eventType: JobExecutionEventType, message: string): Promise<void> {
        const event = this.jobExecutionEventEntityRepository.create({
            job,
            eventType,
            message,
        });

        await this.jobExecutionEventEntityRepository.save(event);
    }
}