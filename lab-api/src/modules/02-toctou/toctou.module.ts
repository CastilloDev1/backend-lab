import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ToctouCredit } from './domain/toctou-credit.entity';
import { ToctouController } from './controller/toctou.controller';
import { ToctouCreditRepository } from './infrastructure/postgres/toctou-credit.repository';
import { ToctouSeederService } from './infrastructure/seed/toctou-seeder.service';
import { ToctouBrokenConsumeStage } from './stages/broken/toctou-broken-consume.stage';
import { ToctouConditionalConsumeStage } from './stages/conditional-update/toctou-conditional-consume.stage';

@Module({
  imports: [TypeOrmModule.forFeature([ToctouCredit])],
  controllers: [ToctouController],
  providers: [
    ToctouCreditRepository,
    ToctouBrokenConsumeStage,
    ToctouConditionalConsumeStage,
    ToctouSeederService,
  ],
})
export class ToctouModule {}
