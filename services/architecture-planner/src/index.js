const { createChannelWithRetry } = require('./rabbitmq');
const { generateArchitecture } = require('./planner');

async function start() {
  const inQueue = process.env.IN_QUEUE || 'requirement.analysis.completed';
  const outQueue = process.env.OUT_QUEUE || 'architecture.planned';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (msg) {
      try {
        const requirements = JSON.parse(msg.content.toString());
        const archSpec = await generateArchitecture(requirements);

        // (Optional) Validate output here
        // publish downstream
        await ch.assertQueue(outQueue, { durable: true });
        ch.sendToQueue(outQueue, Buffer.from(JSON.stringify(archSpec)), { persistent: true });

        console.log("✅ Published architecture spec:", archSpec);
        ch.ack(msg);
      } catch (err) {
        console.error("❌ Error processing message:", err.message);
        // Optionally: ch.nack(msg, false, false); // Dead-letter
      }
    }
  });

  console.log(`📥 Listening for parsed requirements on "${inQueue}"`);
  console.log(`📤 Publishing architecture specs to "${outQueue}"`);
}

start();
