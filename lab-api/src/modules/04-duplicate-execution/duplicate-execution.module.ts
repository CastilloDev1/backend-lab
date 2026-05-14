import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DuplicateExecutionController } from './controller/duplicate-execution.controller';
import { Account } from './domain/account.entity';
import { Payment } from './domain/payment.entity';
import { IdempotenciaKey } from './domain/idempotencia-key.entity';
import { PaymentOperation } from './domain/payment-operation.entity';
import { AccountRepository } from './infrastructure/postgres/account.repository';
import { PaymentRepository } from './infrastructure/postgres/payment.repository';
import { IdempotenciaKeyRepository } from './infrastructure/postgres/idempotencia-key.repository';
import { PaymentOperationRepository } from './infrastructure/postgres/payment-operation.repository';
import { DuplicateExecutionSeederService } from './infrastructure/seed/duplicate-execution-seeder.service';
import { PayNoIdempotencyStage } from './stages/01-broken/pay-no-idempotency.stage';
import { PayIdempotenteStage } from './stages/02-idempotency/pay-idempotente.stage';
import { PayIdempotentCrashStage } from './stages/03-broken2-pasarela-crash/pay-idempotent-crash.stage';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Payment, IdempotenciaKey, PaymentOperation]),
  ],
  controllers: [DuplicateExecutionController],
  providers: [
    PayNoIdempotencyStage,
    PayIdempotenteStage,
    PayIdempotentCrashStage,
    IdempotenciaKeyRepository,
    PaymentOperationRepository,
    AccountRepository,
    PaymentRepository,
    DuplicateExecutionSeederService,
  ],
})
export class DuplicateExecutionModule {}
