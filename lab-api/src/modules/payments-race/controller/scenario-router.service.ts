import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentCommand, PaymentResult, PaymentScenario } from '../domain/payment.types';
import { ProblemScenarioService } from '../scenarios/problem/problem.service';

@Injectable()
export class ScenarioRouterService {
  constructor(private readonly problemScenarioService: ProblemScenarioService) {}

  execute(scenario: PaymentScenario, command: PaymentCommand): Promise<PaymentResult> {
    if (scenario === 'problem') {
      return this.problemScenarioService.execute(command);
    }

    throw new NotFoundException(`Escenario "${scenario}" no implementado aún`);
  }
}
