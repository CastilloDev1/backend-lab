import { Body, Controller, Post, Query } from "@nestjs/common";
import type { ProductCommand, ProductScenario } from "../domain/product.types";
import { ScenarioRouterService } from "./scenario-router.service";

@Controller('products')
export class ProductsController {

    constructor(
        private readonly scenarioRouterService: ScenarioRouterService,
    ) {}

    @Post()
    discountProduct(
        @Body() body: ProductCommand,
        @Query('scenario') scenario: ProductScenario = 'problem',
    ){
        return this.scenarioRouterService.execute(scenario, body);
    }
}