import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { DuplicateExecutionModule } from './modules/04-duplicate-execution/duplicate-execution.module';
import { LostUpdateModule } from './modules/01-lost-update/lost-update.module';
import { ToctouModule } from './modules/02-toctou/toctou.module';
import { DoubleSpendingModule } from './modules/03-double-spending/double-spending.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    LostUpdateModule,
    ToctouModule,
    DoubleSpendingModule,
    DuplicateExecutionModule,
  ],
})
export class AppModule {}
