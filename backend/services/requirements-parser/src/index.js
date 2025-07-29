const { createChannelWithRetry } = require('./rabbitmq');
const { parseRequirements } = require('./parser');

async function start() {
  const inQueue = process.env.IN_QUEUE || 'requirement.submitted';
  const outQueue = process.env.OUT_QUEUE || 'requirement.analysis.completed';

  const ch = await createChannelWithRetry(inQueue);

  ch.consume(inQueue, async (msg) => {
    if (!msg) return;

    try {
      // Parse incoming message JSON to extract prompt and metadata
      const msgObj = JSON.parse(msg.content.toString());

      // Extract required fields:
      // Adapt 'prompt' depending on your input schema. Could also be 'text' or similar.
      const text = msgObj.prompt || msgObj.text || "";
      const jobId = msgObj.jobId;
      const sessionId = msgObj.sessionId; // Optional - forward if needed

      // Parse the requirements using your parser function
      const parsed = await parseRequirements(text);

      // Construct the outgoing message, including jobId and sessionId for tracking
      const messageOut = {
        requirements: {
          ...parsed
        },
        jobId,
        sessionId
      };


      // Ensure the output queue exists
      await ch.assertQueue(outQueue, { durable: true });

      // Send the message downstream with jobId preserved
      ch.sendToQueue(outQueue, Buffer.from(JSON.stringify(messageOut)), { persistent: true });


      // Acknowledge message consumption
      ch.ack(msg);

    } catch (err) {
      console.error("❌ Parser error:", err.message);
      // Optionally: ch.nack(msg, false, false); // Send to dead-letter queue if configured
    }
  });

  console.log(`📥 Listening on queue "${inQueue}" and publishing to "${outQueue}"`);
}

start();
