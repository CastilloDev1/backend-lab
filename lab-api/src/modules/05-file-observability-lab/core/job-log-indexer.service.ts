import { Inject, Injectable } from "@nestjs/common";
import { OPENSEARCH_CLIENT } from "./opensearch.client";
import { Client } from "@opensearch-project/opensearch";

type jobLogDocument = {
    eventType: string;
    jobId: string;
    fileName: string;
    status: string;
    message: string;
    durationMs?: number | null;
    error?: string | null;
    timestamp: string;
}

@Injectable()
export class JobLogIndexerService {

    private readonly indexName = 'file-processing-job-logs';

    constructor(
        @Inject(OPENSEARCH_CLIENT)
        private readonly client: Client,
    ) {}

    async index(document: jobLogDocument): Promise<void> {
        await this.client.index({
            index: this.indexName,
            body: document,
        })
    };

}