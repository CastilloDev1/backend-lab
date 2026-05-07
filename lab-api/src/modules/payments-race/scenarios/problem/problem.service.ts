import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentCommand, PaymentResult } from '../../domain/payment.types';
import { UserRepository } from '../../infrastructure/postgres/user.repository';

@Injectable()
export class ProblemScenarioService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: PaymentCommand): Promise<PaymentResult> {
    const user = await this.userRepository.findByUserId(command.userId);

    if (!user || Number(user.balance) < command.amount) {
      throw new BadRequestException('No hay fondos');
    }

    await new Promise((res) => setTimeout(res, 1000)); // Simulación de carga

    user.balance = Number(user.balance) - command.amount;
    await this.userRepository.save(user);

    return { scenario: 'problem', balance: user.balance };
  }
}
