import { BadRequestException, Injectable } from "@nestjs/common";
import { IdempotenciaKeyRepository } from "../../infrastructure/postgres/idempotencia-key.repository";
import { AccountRepository } from "../../infrastructure/postgres/account.repository";
import { PaymentRepository } from "../../infrastructure/postgres/payment.repository";
import { DuplicateExecutionResult } from "../../domain/duplicate-execution.types";

@Injectable()
export class IdempotentExecutionScenarioService {
    constructor(
        private readonly idempotenciaKeyRepository: IdempotenciaKeyRepository,
        private readonly accountRepository: AccountRepository,
        private readonly paymentRepository: PaymentRepository,
    ) {}

    async execute(accountId: number, amount: number, idempotenciaKey: string): Promise<DuplicateExecutionResult> {

        // Idempotencia: Guardar el identificador de la solicitud.
        const idempotenciaKeyResponse = await this.idempotenciaKeyRepository.save(idempotenciaKey, 'PROCESSING');

        // Verificar si la solicitud es la primera.
        const isFirstRequest = idempotenciaKeyResponse.length > 0;

        // Si no es la primera solicitud, verificar el estado de la solicitud.
        if (!isFirstRequest) {
            const existingRows = await this.idempotenciaKeyRepository.getByIdempotenciaKey(idempotenciaKey);
            const existing = existingRows[0];
          
            if (existing.status === 'FAILED') {
              throw new Error(existing.error_message ?? 'La solicitud falló. Por favor, inténtelo de nuevo.');
            }
            
            // Validar el tiempo de espera de la solicitud
            const now = Date.now();
            const createdAt = existing.created_at.getTime();

            // Si la solicitud está en proceso por más de 60 segundos, lanzar un error.
            const ageInSeconds = (now - createdAt) / 1000;
            if( existing.status === 'PROCESSING' && ageInSeconds > 60) {
              await this.idempotenciaKeyRepository.setOutcome(idempotenciaKey, {
                status: 'FAILED',
                errorMessage: 'PROCESSING_TIMEOUT',
              });
              throw new Error('El tiempo de espera de la solicitud ha expirado. Por favor, inténtelo de nuevo.');
            }

            if (existing.status === 'PROCESSING') {
              throw new BadRequestException('El pago ya está en proceso.');
            }

            if (existing.status === 'COMPLETED') {
              return existing.response as DuplicateExecutionResult;
            }
        }


        throw new Error(' --------------------------> Backend crashed antes de pagar.');
        try {

          // Ejecución del caso exitoso.
          const account = await this.accountRepository.discountBalance(accountId, amount);
        
          if (!account) {
            throw new Error('Insufficient funds');
          }
        
          // Crear el pago en la base de datos
          await this.paymentRepository.createPayment(accountId, amount, 'COMPLETED');
  
          // Actualizar la clave de idempotencia en la base de datos
          const response: DuplicateExecutionResult = {
            scenario: 'idempotent-execution',
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