import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findProductById(id: number): Promise<Product | null> {
    return this.productRepo.findOneBy({ id });
  }

  save(product: Product): Promise<Product> {
    return this.productRepo.save(product);
  }

  async decrementStockAtomic(id: number, quantity: number): Promise<number | null> {
    const result = await this.productRepo
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => 'stock - :quantity' })
      .where('id = :id', { id })
      .andWhere('stock >= :quantity')
      .setParameter('quantity', quantity)
      .returning(['stock'])
      .execute();

    const updatedRow = result.raw[0] as { stock?: number } | undefined;
    return updatedRow?.stock ?? null;
  }
}