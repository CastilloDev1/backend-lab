import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private dataSource: DataSource;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.dataSource = new DataSource({
            type: "postgres",
            host: this.configService.getOrThrow<string>('database.host'),
            port: Number(this.configService.getOrThrow<string>('database.port')),
            username: this.configService.getOrThrow<string>('database.username'),
            password: this.configService.getOrThrow<string>('database.password'),
            database: this.configService.getOrThrow<string>('database.database'),
        });
    }

    async onModuleInit() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
    }
    
    async onModuleDestroy() {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }

    getDataSource(): DataSource {
        return this.dataSource;
    }
}