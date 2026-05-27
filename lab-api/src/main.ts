import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import { publishMessageToQueue, startConsumer } from './modules/04-payment-lab/stages/09-rabbimq-introduction/rabbitmq-test';

async function bootstrap() {

  // Crear 10 outbox events
  // for (let i = 0; i < 10; i++) {
  //   await publishMessageToQueue();
  // }
  // Iniciar el consumer
  // await startConsumer();

  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();