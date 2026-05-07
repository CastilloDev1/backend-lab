import { Module } from '@nestjs/common';
import { PaymentsRaceModule } from './modules/payments-race/payments-race.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    PaymentsRaceModule,
  ],
})
export class AppModule {}