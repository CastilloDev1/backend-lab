import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './modules/payments-race/domain/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seed reproducible para laboratorio de concurrencia.
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(User);
  const seededUsers: Array<Pick<User, 'userId' | 'balance'>> = [
    { userId: '11111111-1111-1111-1111-111111111111', balance: 1000 },
  ];

  await userRepo.clear();
  await userRepo.save(seededUsers);

  console.log(`🚀 DATABASE READY: ${seededUsers.length} usuarios seed con saldo inicial de $1000`);

  await app.listen(3000);
}
bootstrap();