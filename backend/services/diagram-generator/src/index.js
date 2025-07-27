const { createChannelWithRetry } = require('./rabbitmq');
const { createMermaidDiagram } = require('./diagrammer');
const { createClient } = require("redis")

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379"});

redisClient.connect();

async function start() {
  const inQueue = process.env.IN_QUEUE || 'architecture.planned';
  const outQueue = process.env.OUT_QUEUE || 'diagram.generated';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (!msg) return;

    try {
      const { architecture, jobId } = JSON.parse(msg.content.toString());
      const mermaid = createMermaidDiagram(architecture);

      // Save result to Redis with expiration (e.g., 1 day)
      await redisClient.setEx(jobId, 86400, JSON.stringify({ mermaid, architecture, status: 'done' }));

      ch.ack(msg);
      console.log('✅ Diagram code saved to Redis for', jobId);
    } catch (err) {
      console.error('❌ Diagram generation failed:', err.message);
      ch.nack(msg, false, false);

    }
  });

  console.log(`📥 Listening on "${inQueue}"`);
  console.log(`📤 Publishing diagram code to "${outQueue}"`);
}

start();
