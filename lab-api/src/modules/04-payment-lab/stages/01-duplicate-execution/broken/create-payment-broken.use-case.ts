import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

type CreatePaymentBrokenInput = {
    accountId: number;
    amount: number;
    externalReference: string;
}

@Injectable()
export class CreatePaymentBrokenUseCase {

    constructor(
        private readonly dataSource: DataSource
    ) { }

    async execute(
        input: CreatePaymentBrokenInput
    ){
        const account = await this.dataSource.query(
            `
            SELECT id, balance
            FROM account
            WHERE id = $1
            `,
            [input.accountId]
        );

        if ( account.length === 0 ) {
            throw new NotFoundException('Account not found');
        }

        await this.dataSource.query(
            `
            UPDATE account
            SET balance = balance - $1
            WHERE id = $2
            `,
            [input.amount, input.accountId]
        );

        const payment = await this.dataSource.query(
            `
            INSERT INTO payment (
                account_id, 
                amount, 
                external_reference
            )
                VALUES ($1, $2, $3)
                RETURNING id, account_id, amount, external_reference, created_at
            `,
            [input.accountId, input.amount, input.externalReference]
        );

        return {
            message: 'Payment created without duplicate protection',
            paymentId: payment[0],
        }
        
    }
}