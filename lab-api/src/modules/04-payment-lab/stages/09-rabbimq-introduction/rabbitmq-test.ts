import amqp, { Channel, ChannelModel } from 'amqplib';

const RABBITMQ_URL = 'amqp://admin:admin123@localhost:5672';

const TEST_QUEUE = 'lab.hello.queue';

let client: ChannelModel | null = null;
let channel: Channel | null = null;

/** Reutiliza un solo canal (singleton para pruebas locales). */
export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) return channel;

  client = await amqp.connect(RABBITMQ_URL);
  channel = await client.createChannel();

  await channel.assertQueue(TEST_QUEUE, { durable: true });

  console.log('RabbitMQ connection established and channel created');
  
  return channel;
}

export async function publishMessageToQueue(){
    const rabbitChannel = await getRabbitChannel();

    rabbitChannel.sendToQueue(
        TEST_QUEUE, 
        Buffer.from('Hello from Backend Lab'),
        { contentType: 'application/json' }
    );

    console.log('Message published to queue');
}

export async function startConsumer(){
    const rabbitChannel = await getRabbitChannel();

    await rabbitChannel.consume(TEST_QUEUE, (message) => {
        if (!message) return;

        const content = message.content.toString();

        console.log('Message received from queue:', content);

        try {
            
            throw new Error('Test error');

        } catch (error) {
            console.log('Error processing message:', error);
            rabbitChannel.nack(message, false, true);
        }
        
    });

    console.log('Consumer started');
    
}