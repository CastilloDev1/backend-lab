import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductCommand, ProductResult } from '../../domain/product.types';
import { ProductRepository } from '../../infrastructure/postgres/product.repository';

@Injectable()
export class AtomicUpdateScenarioService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: ProductCommand): Promise<ProductResult> {
    if (command.quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    // Mantiene la ventana de concurrencia, pero sin read-modify-write en memoria.
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const stock = await this.productRepository.decrementStockAtomic(
      command.id,
      command.quantity,
    );

    if (stock === null) {
      throw new BadRequestException('Producto no encontrado o stock insuficiente');
    }

    console.log('Stock actualizado atómicamente:', stock);

    return { scenario: 'atomic-update', stock };
  }
}
