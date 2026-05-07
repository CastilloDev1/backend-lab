import { Body, Controller, Post, Query } from '@nestjs/common';
import type { PaymentCommand, PaymentScenario } from '../domain/payment.types';
import { ScenarioRouterService } from './scenario-router.service';

@Controller('payments')
export class PaymentsRaceController {
  constructor(private readonly scenarioRouterService: ScenarioRouterService) {}

  @Post()
  pay(
    @Body() body: PaymentCommand,
    @Query('scenario') scenario: PaymentScenario = 'problem',
  ) {
    return this.scenarioRouterService.execute(scenario, body);
  }
}
