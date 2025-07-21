// rabbitmq.js

const amqp = require('amqplib');

async function createChannelWithRetry(queue, attempts = 10, delay = 3000) {
  for (let i = 0; i < attempts; i++) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      const ch = await conn.createChannel();
      await ch.assertQueue(queue, { durable: true });
      return ch;
    } catch (err) {
      console.log(`RabbitMQ not ready, retrying (${i + 1}/${attempts})...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Could not connect to RabbitMQ after multiple attempts.');
}

module.exports = { createChannelWithRetry };
