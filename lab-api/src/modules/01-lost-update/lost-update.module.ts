import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './domain/product.entity';
import { LostUpdateController } from './controller/lost-update.controller';
import { DiscountReadModifyWriteStage } from './stages/broken/discount-read-modify-write.stage';
import { DiscountAtomicDecrementStage } from './stages/atomic-update/discount-atomic-decrement.stage';
import { ProductRepository } from './infrastructure/postgres/product.repository';
import { LostUpdateSeederService } from './infrastructure/seed/lost-update-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [LostUpdateController],
  providers: [
    DiscountReadModifyWriteStage,
    DiscountAtomicDecrementStage,
    ProductRepository,
    LostUpdateSeederService,
  ],
})
export class LostUpdateModule {}
