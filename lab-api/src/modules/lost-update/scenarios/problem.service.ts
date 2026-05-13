import { BadRequestException, Injectable } from "@nestjs/common";
import { ProductRepository } from "../infrastructure/postgres/product.repository";
import { ProductCommand, ProductResult } from "../domain/product.types";

@Injectable()
export class ProblemScenarioService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ProductCommand): Promise<ProductResult> {
    // 1. READ
    const product = await this.productRepository.findProductById(command.id);

    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }

    console.log('Stock leído:', product.stock);

    // Delay artificial
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 2. MODIFY
    product.stock = product.stock - command.quantity;

    // 3. WRITE
    await this.productRepository.save(product);

    console.log('Stock guardado:', product.stock);

    return { scenario: 'problem', stock: product.stock };
  }
}
