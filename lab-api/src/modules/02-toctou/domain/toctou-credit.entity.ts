import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('toctou_credit')
export class ToctouCredit {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer' })
  credits: number;
}
