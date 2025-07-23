const { createChannelWithRetry } = require('./rabbitmq');
const { createMermaidDiagram } = require('./diagrammer');

async function start() {
  const inQueue = process.env.IN_QUEUE || 'architecture.planned';
  const outQueue = process.env.OUT_QUEUE || 'diagram.generated';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (!msg) return;

    try {
      const architecture = JSON.parse(msg.content.toString());
      const mermaidCode = createMermaidDiagram(architecture);

      const output = {
        architecture,
        mermaid: mermaidCode,
        generatedAt: new Date().toISOString()
      };

      await ch.assertQueue(outQueue, { durable: true });
      ch.sendToQueue(outQueue, Buffer.from(JSON.stringify(output)), { persistent: true });

      console.log('✅ Diagram code generated and sent to', outQueue);
      ch.ack(msg);

    } catch (err) {
      console.error('❌ Error generating diagram:', err.message);
      ch.nack(msg, false, false); // Optionally send to dead-letter queue
    }
  });

  console.log(`📥 Listening on "${inQueue}"`);
  console.log(`📤 Publishing diagram code to "${outQueue}"`);
}

start();
