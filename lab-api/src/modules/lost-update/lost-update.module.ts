import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Product } from "./domain/product.entity";
import { ProductsController } from "./controller/products.controller";
import { ScenarioRouterService } from "./controller/scenario-router.service";
import { ProblemScenarioService } from "./scenarios/problem.service";
import { AtomicUpdateScenarioService } from "./scenarios/solutions/atomic-update.service";
import { ProductRepository } from "./infrastructure/postgres/product.repository";
import { LostUpdateSeederService } from "./infrastructure/seed/lost-update-seeder.service";

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    controllers: [ProductsController],
    providers: [
        ScenarioRouterService,
        ProblemScenarioService,
        AtomicUpdateScenarioService,
        ProductRepository,
        LostUpdateSeederService,
    ]
})
export class LostUpdateModule {}