const { createChannelWithRetry } = require('./rabbitmq');
const { generateArchitecture } = require('./planner');

async function start() {
  const inQueue = process.env.IN_QUEUE || 'requirement.analysis.completed';
  const outQueue = process.env.OUT_QUEUE || 'architecture.planned';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (msg) {
      try {
        const { requirements, jobId } = JSON.parse(msg.content.toString());
        const archSpec = await generateArchitecture(requirements);

        // Add jobId to output
        const messageOut = { ...archSpec, jobId };

        await ch.assertQueue(outQueue, { durable: true });
        ch.sendToQueue(outQueue, Buffer.from(JSON.stringify(messageOut)), { persistent: true });

        console.log("✅ Published architecture spec:", messageOut);
        ch.ack(msg);
      } catch (err) {
        console.error("❌ Error processing message:", err.message);
        // Optionally: ch.nack(msg, false, false);
      }
    }
  });

  console.log(`📥 Listening for parsed requirements on "${inQueue}"`);
  console.log(`📤 Publishing architecture specs to "${outQueue}"`);
}

start();
