import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ToctouCredit } from '../../domain/toctou-credit.entity';

@Injectable()
export class ToctouSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ToctouCredit)
    private readonly repo: Repository<ToctouCredit>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.repo.upsert([{ id: 1, credits: 2 }], ['id']);
    console.log('TOCTOU READY: recurso id=1 con credits=2');
  }
}
