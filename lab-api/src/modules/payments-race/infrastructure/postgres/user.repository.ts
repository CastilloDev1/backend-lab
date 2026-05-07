import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findByUserId(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { userId } });
  }

  save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}
