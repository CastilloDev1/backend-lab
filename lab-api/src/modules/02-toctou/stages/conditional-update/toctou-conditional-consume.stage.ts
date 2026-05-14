import { BadRequestException, Injectable } from '@nestjs/common';

import { ToctouCreditRepository } from '../../infrastructure/postgres/toctou-credit.repository';

@Injectable()
export class ToctouConditionalConsumeStage {
  constructor(private readonly toctouCreditRepository: ToctouCreditRepository) {}

  async execute(resourceId: number, amount: number) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const credits = await this.toctouCreditRepository.conditionalConsume(
      resourceId,
      amount,
    );

    if (credits === null) {
      throw new BadRequestException(
        'No hay créditos suficientes; el UPDATE condicional no aplicó filas.',
      );
    }

    return {
      stage: 'conditional-update',
      resourceId,
      creditsRemaining: credits,
    };
  }
}
