import { BadRequestException, Injectable } from '@nestjs/common';

import { DuplicateExecutionResult } from '../../domain/duplicate-execution.types';
import { IdempotenciaKeyRepository } from '../../infrastructure/postgres/idempotencia-key.repository';
import { AccountRepository } from '../../infrastructure/postgres/account.repository';
import { PaymentRepository } from '../../infrastructure/postgres/payment.repository';

/**
 * Idempotencia persistente: insertar clave PROCESSING (or ignore), reintentos leen estado,
 * primer camino exitoso descuenta balance, crea payment y marca COMPLETED con la respuesta en JSON.
 */
@Injectable()
export class PayIdempotenteStage {
  constructor(
    private readonly idempotenciaKeyRepository: IdempotenciaKeyRepository,
    private readonly accountRepository: AccountRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(
    accountId: number,
    amount: number,
    idempotenciaKey: string,
  ): Promise<DuplicateExecutionResult> {
    const insertRows = await this.idempotenciaKeyRepository.save(
      idempotenciaKey,
      'PROCESSING',
    );
    const isFirstRequest = insertRows.length > 0;

    if (!isFirstRequest) {
      const existingRows =
        await this.idempotenciaKeyRepository.getByIdempotenciaKey(
          idempotenciaKey,
        );
      const existing = existingRows[0];

      if (!existing) {
        throw new Error('Estado de idempotencia inconsistente');
      }

      if (existing.status === 'FAILED') {
        throw new Error(
          existing.error_message ??
            'La solicitud falló. Por favor, inténtelo de nuevo.',
        );
      }

      const now = Date.now();
      const createdAt = existing.created_at.getTime();
      const ageInSeconds = (now - createdAt) / 1000;

      if (existing.status === 'PROCESSING' && ageInSeconds > 60) {
        await this.idempotenciaKeyRepository.setOutcome(idempotenciaKey, {
          status: 'FAILED',
          errorMessage: 'PROCESSING_TIMEOUT',
        });
        throw new Error(
          'El tiempo de espera de la solicitud ha expirado. Por favor, inténtelo de nuevo.',
        );
      }

      if (existing.status === 'PROCESSING') {
        throw new BadRequestException('El pago ya está en proceso.');
      }

      if (existing.status === 'COMPLETED') {
        const parsed = existing.response as DuplicateExecutionResult;
        return {
          ...parsed,
          stage: parsed.stage ?? 'idempotency',
        };
      }
    }

    try {
      const account = await this.accountRepository.discountBalance(
        accountId,
        amount,
      );

      if (!account) {
        throw new Error('Insufficient funds');
      }

      await this.paymentRepository.createPayment(accountId, amount, 'COMPLETED');

      const response: DuplicateExecutionResult = {
        stage: 'idempotency',
        result: {
          status: 'payment_completed',
          account,
        },
      };

      await this.idempotenciaKeyRepository.setOutcome(idempotenciaKey, {
        status: 'COMPLETED',
        response,
      });

      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      await this.idempotenciaKeyRepository.setOutcome(idempotenciaKey, {
        status: 'FAILED',
        errorMessage: message,
      });
      throw error;
    }
  }
}
