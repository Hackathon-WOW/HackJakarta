import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('🐇 Connected to RabbitMQ');
  }
  return channel;
};

export const publishEvent = async (queue: string, message: any) => {
  const ch = await connectRabbitMQ();
  await ch.assertQueue(queue, { durable: true });
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`[x] Sent event to ${queue}`);
};

export const consumeEvent = async (queue: string, callback: (msg: any) => void) => {
  const ch = await connectRabbitMQ();
  await ch.assertQueue(queue, { durable: true });
  console.log(`[*] Waiting for messages in ${queue}.`);
  ch.consume(queue, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      callback(data);
      ch.ack(msg);
    }
  });
};
