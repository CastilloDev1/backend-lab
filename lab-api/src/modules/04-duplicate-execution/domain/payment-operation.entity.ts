import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_operation')
export class PaymentOperation {
  @PrimaryColumn({ name: 'operation_key', type: 'varchar' })
  operationKey: string;

  @Column({ type: 'varchar', length: 32 })
  state: string;

  @Column({ name: 'account_id', type: 'integer' })
  accountId: number;

  @Column({ type: 'integer' })
  amount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
