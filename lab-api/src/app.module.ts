import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';

//Modulos de Problemas concurrentes
import { LostUpdateModule } from './modules/01-lost-update/lost-update.module';
import { ToctouModule } from './modules/02-toctou/toctou.module';
import { DoubleSpendingModule } from './modules/03-double-spending/double-spending.module';

//Modulos de Escenarios evolutivos
import { PaymentLabModule } from './modules/04-payment-lab/payment-lab.module';

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
    PaymentLabModule,
  ],
})
export class AppModule {}
