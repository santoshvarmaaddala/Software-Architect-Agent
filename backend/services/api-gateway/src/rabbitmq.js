const amqp = require('amqplib');

async function createChannelWithRetry(queue, attempts = 10, delay = 3000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL);
      const ch = await conn.createChannel();
      await ch.assertQueue(queue, { durable: true });
      return ch;
    } catch (err) {
      console.log(`Waiting for RabbitMQ... retry (${i + 1}/${attempts})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unable to connect to RabbitMQ.');
}

module.exports = { createChannelWithRetry };
