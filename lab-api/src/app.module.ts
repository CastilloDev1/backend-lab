import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';

import { LostUpdateModule } from './modules/lost-update/lost-update.module';
import { DuplicateExecutionModule } from './modules/duplicate-execution/duplicate-execution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    LostUpdateModule,
    DuplicateExecutionModule,
  ],
})
export class AppModule {}