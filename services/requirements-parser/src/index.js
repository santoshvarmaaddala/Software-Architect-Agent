const { createChannelWithRetry } = require('./rabbitmq');
const { parseRequirements } = require('./parser');

async function start() {
  const inQueue = process.env.IN_QUEUE || 'requirement.submitted';
  const outQueue = process.env.OUT_QUEUE || 'requirement.analysis.completed';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (!msg) return;

    try {
      const text = msg.content.toString();
      const parsed = await parseRequirements(text);

      await ch.assertQueue(outQueue, { durable: true });
      ch.sendToQueue(outQueue, Buffer.from(JSON.stringify(parsed)), { persistent: true });

      console.log("✅ Published parsed requirements to", outQueue);
      ch.ack(msg);

    } catch (err) {
      console.error("❌ Parser error:", err.message);
    }
  });

  console.log(`📥 Listening to ${inQueue} and publishing to ${outQueue}`);
}

start();
