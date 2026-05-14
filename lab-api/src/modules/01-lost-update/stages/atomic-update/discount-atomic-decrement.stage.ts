import { BadRequestException, Injectable } from '@nestjs/common';

import { ProductDiscountBody, ProductDiscountResult } from '../../domain/product.types';
import { ProductRepository } from '../../infrastructure/postgres/product.repository';

@Injectable()
export class DiscountAtomicDecrementStage {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ProductDiscountBody): Promise<ProductDiscountResult> {
    if (command.quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const stock = await this.productRepository.decrementStockAtomic(
      command.id,
      command.quantity,
    );

    if (stock === null) {
      throw new BadRequestException('Producto no encontrado o stock insuficiente');
    }

    console.log('Stock actualizado atómicamente:', stock);

    return { stage: 'atomic-update', stock };
  }
}
