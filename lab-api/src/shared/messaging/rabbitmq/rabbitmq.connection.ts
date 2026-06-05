import amqp, { Channel, ChannelModel } from 'amqplib';
import { RABBITMQ_URL } from './rabbitmq.constants';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

function resetRabbitConnection() {
  connection = null;
  channel = null;
  console.log('RabbitMQ connection/channel reset');
}

export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);

  connection.on('close', () => {
    console.log('RabbitMQ connection closed');
    resetRabbitConnection();
  });

  connection.on('error', (error) => {
    console.error('RabbitMQ connection error', error.message);
    resetRabbitConnection();
  });

  channel = await connection.createChannel();

  channel.on('close', () => {
    console.log('RabbitMQ channel closed');
    resetRabbitConnection();
  });

  channel.on('error', (error) => {
    console.error('RabbitMQ channel error', error.message);
    resetRabbitConnection();
  });

  console.log('RabbitMQ connection established');

  return channel;
}