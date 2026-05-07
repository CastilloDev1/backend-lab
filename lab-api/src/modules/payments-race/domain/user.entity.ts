import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1000 })
  balance: number;
}