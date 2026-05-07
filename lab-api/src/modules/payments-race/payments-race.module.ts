import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsRaceController } from './controller/payments-race.controller';
import { ScenarioRouterService } from './controller/scenario-router.service';
import { User } from './domain/user.entity';
import { UserRepository } from './infrastructure/postgres/user.repository';
import { IdemStoreRedis } from './infrastructure/redis/idem-store.redis';
import { LockManagerRedis } from './infrastructure/redis/lock-manager.redis';
import { ProblemScenarioService } from './scenarios/problem/problem.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PaymentsRaceController],
  providers: [
    ScenarioRouterService,
    ProblemScenarioService,
    UserRepository,
    IdemStoreRedis,
    LockManagerRedis,
  ],
})
export class PaymentsRaceModule {}
