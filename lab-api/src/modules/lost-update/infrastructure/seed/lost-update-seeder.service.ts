import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../../domain/product.entity';

@Injectable()
export class LostUpdateSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const seededProducts: Array<Pick<Product, 'id' | 'name' | 'stock'>> = [
      { id: 1, name: 'Producto 1', stock: 10 },
    ];

    await this.productRepo.upsert(seededProducts, ['id']);

    console.log(
      `DATABASE READY: ${seededProducts.length} productos seed con stock inicial de 10`,
    );
  }
}
