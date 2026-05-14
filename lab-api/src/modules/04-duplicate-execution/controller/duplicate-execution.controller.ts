import { Body, Controller, Post } from '@nestjs/common';

import type {
  PayBrokenBody,
  PayStatesBody,
  PayWithIdempotencyBody,
} from '../domain/duplicate-execution.types';
import { PayNoIdempotencyStage } from '../stages/01-broken/pay-no-idempotency.stage';
import { PayIdempotenteStage } from '../stages/02-idempotency/pay-idempotente.stage';
import { PayIdempotentCrashStage } from '../stages/03-broken2-pasarela-crash/pay-idempotent-crash.stage';

@Controller('duplicate-execution')
export class DuplicateExecutionController {
  constructor(
    private readonly payNoIdempotency: PayNoIdempotencyStage,
    private readonly payIdempotent: PayIdempotenteStage,
    private readonly payIdempotentCrash: PayIdempotentCrashStage,
  ) {}

  @Post('broken/pay')
  payBroken(@Body() body: PayBrokenBody) {
    return this.payNoIdempotency.execute(body.accountId, body.amount);
  }

  @Post('idempotency/pay')
  payIdempotentRoute(@Body() body: PayWithIdempotencyBody) {
    return this.payIdempotent.execute(
      body.accountId,
      body.amount,
      body.idempotenciaKey,
    );
  }

  @Post('crash/pay')
  payIdempotentCrashRoute(@Body() body: PayWithIdempotencyBody) {
    return this.payIdempotentCrash.execute(
      body.accountId,
      body.amount,
      body.idempotenciaKey,
    );
  }
}
