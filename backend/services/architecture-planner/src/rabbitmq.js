const amqp = require('amqplib');

async function createChannelWithRetry(queue, attempts = 10, delay = 3000) {
    for (let i = 0; i < 10; i++) {
        try {
            const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
            const ch = await conn.createChannel();
            await ch.assertQueue(queue, {durable : true});
            return ch;
        } catch {
            console.log(`Waiting for RabbitMQ... retry (${i+1}/${attempts})`);
            
            await new Promise(res => setTimeout(res, delay));
        } 
    }
    throw new Error('RabbitMQ connect failed.');
}

module.exports = { createChannelWithRetry };