import amqp, { Channel, ChannelModel } from 'amqplib';
import { RABBITMQ_URL } from './rabbitmq.constants';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);

  channel = await connection.createChannel();

  console.log('RabbitMQ connection established');

  return channel;
}