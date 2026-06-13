import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { HttpRequestLogIndexerService } from "./http-request-log-indexer.service";
import { Observable, tap } from "rxjs";

@Injectable()
export class HttpRequestLoggingInterceptor implements NestInterceptor {
    constructor(
        private readonly httpRequestLogIndexerService: HttpRequestLogIndexerService
    ) {}
    
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const startedAt = Date.now();

        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        return next.handle().pipe(
            tap(async () => {
                const completedAt = Date.now();

                await this.httpRequestLogIndexerService.index({
                    method: request.method,
                    path: request.url,
                    statusCode: response.status,
                    durationMs: completedAt - startedAt,
                    timestamp: new Date().toISOString(),
                });

            }),
        )

    }
}