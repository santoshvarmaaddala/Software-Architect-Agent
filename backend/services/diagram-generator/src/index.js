const { createChannelWithRetry } = require('./rabbitmq');
const { createMermaidDiagram } = require('./diagrammer');
const { createClient } = require("redis");

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
redisClient.connect();

async function start() {
  const inQueue = process.env.IN_QUEUE || 'architecture.planned';
  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (!msg) return;
    try {
      const obj = JSON.parse(msg.content.toString());
      const jobId = obj.jobId;
      const mermaid = createMermaidDiagram(obj);  // Pass whole obj (architecture plan) to diagrammer

      // Save result to Redis (1-day expiration)
      await redisClient.setEx(jobId, 86400, JSON.stringify({ mermaid, architecture: obj, status: 'done' }));
      ch.ack(msg);
      console.log('✅ Diagram code saved to Redis for', jobId);
    } catch (err) {
      console.error('❌ Diagram generation failed:', err.message);
      ch.nack(msg, false, false);
    }
  });

  console.log(`📥 Listening on "${inQueue}"`);
}

start();
