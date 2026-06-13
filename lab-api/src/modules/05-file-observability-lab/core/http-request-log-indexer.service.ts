import { Client } from "@opensearch-project/opensearch";
import { OPENSEARCH_CLIENT } from "./opensearch.client";
import { Inject, Injectable } from "@nestjs/common";

type HttpRequestLogDocument = {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    timestamp: string;
};

@Injectable()
export class HttpRequestLogIndexerService {

    private readonly indexName = 'http-request-logs';
    
    constructor(
        @Inject(OPENSEARCH_CLIENT)
        private readonly client: Client,
    ) {}

    async index(document: HttpRequestLogDocument): Promise<void> {

        await this.client.index({
            index: this.indexName,
            body: document,
        });
    }
}