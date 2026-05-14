import { Body, Controller, Post } from '@nestjs/common';

import type { ProductDiscountBody } from '../domain/product.types';
import { DiscountReadModifyWriteStage } from '../stages/broken/discount-read-modify-write.stage';
import { DiscountAtomicDecrementStage } from '../stages/atomic-update/discount-atomic-decrement.stage';

@Controller('lost-update')
export class LostUpdateController {
  constructor(
    private readonly discountReadModifyWrite: DiscountReadModifyWriteStage,
    private readonly discountAtomicDecrement: DiscountAtomicDecrementStage,
  ) {}

  @Post('broken/discount')
  discountBroken(@Body() body: ProductDiscountBody) {
    return this.discountReadModifyWrite.execute(body);
  }

  @Post('atomic-update/discount')
  discountAtomicUpdate(@Body() body: ProductDiscountBody) {
    return this.discountAtomicDecrement.execute(body);
  }
}
