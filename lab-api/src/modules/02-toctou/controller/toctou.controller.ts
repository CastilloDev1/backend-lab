import { Body, Controller, Post } from '@nestjs/common';

import { ToctouBrokenConsumeStage } from '../stages/broken/toctou-broken-consume.stage';
import { ToctouConditionalConsumeStage } from '../stages/conditional-update/toctou-conditional-consume.stage';

class ToctouConsumeBody {
  resourceId: number;
  amount: number;
}

@Controller('toctou')
export class ToctouController {
  constructor(
    private readonly brokenConsume: ToctouBrokenConsumeStage,
    private readonly conditionalConsume: ToctouConditionalConsumeStage,
  ) {}

  @Post('broken/consume')
  broken(@Body() body: ToctouConsumeBody) {
    const amount = body.amount ?? 1;
    return this.brokenConsume.execute(body.resourceId ?? 1, amount);
  }

  @Post('conditional-update/consume')
  conditional(@Body() body: ToctouConsumeBody) {
    const amount = body.amount ?? 1;
    return this.conditionalConsume.execute(body.resourceId ?? 1, amount);
  }
}
