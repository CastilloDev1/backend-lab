import { BadRequestException, Injectable } from '@nestjs/common';

import { ProductDiscountBody, ProductDiscountResult } from '../../domain/product.types';
import { ProductRepository } from '../../infrastructure/postgres/product.repository';

@Injectable()
export class DiscountReadModifyWriteStage {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ProductDiscountBody): Promise<ProductDiscountResult> {

    // 1. Leer el producto
    const product = await this.productRepository.findProductById(command.id);

    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }

    console.log('Stock leído:', product.stock);

    // 2. Esperar 5 segundos para simular una operación concurrente
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Restar la cantidad del stock
    product.stock = product.stock - command.quantity;

    // 4. Guardar el producto
    await this.productRepository.save(product);

    console.log('Stock guardado:', product.stock);

    return { stage: 'broken', stock: product.stock };
  }
}
