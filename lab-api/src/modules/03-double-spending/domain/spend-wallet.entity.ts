import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('spend_wallet')
export class SpendWallet {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer' })
  balance: number;
}
