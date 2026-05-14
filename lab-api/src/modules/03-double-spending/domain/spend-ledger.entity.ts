import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('spend_ledger')
export class SpendLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_id', type: 'integer' })
  walletId: number;

  @Column({ type: 'integer' })
  amount: number;
}
