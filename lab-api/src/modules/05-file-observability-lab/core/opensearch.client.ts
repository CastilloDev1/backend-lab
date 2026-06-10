import { Provider } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";

export const OPENSEARCH_CLIENT = Symbol('OPENSEARCH_CLIENT');

export const OpenSearchClientProvider: Provider = {
    provide: OPENSEARCH_CLIENT,
    useFactory: () => {
        return new Client({
            node: 'http://localhost:9200'
        });
    },
};