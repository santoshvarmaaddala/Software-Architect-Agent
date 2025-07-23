// Import helper to connect to RabbitMQ
const { createChannelWithRetry } = require('./rabbitmq');

// Import the NLP logic from parser.js
const { parseRequirements } = require('./parser');

// Main async function that runs your service
async function start() {
  const inQueue = 'requirement.submitted';     // Queue to listen for messages
  const outQueue = 'requirement.parsed'; ``      // Queue to publish results
  const channel = await createChannelWithRetry(inQueue); // Opens channel and asserts queue exists
  await channel.assertQueue(outQueue, { durable: true });


  // Start consuming messages from input queue
  await channel.consume(inQueue, msg => {
    if (msg !== null) {
      const inputText = msg.content.toString();              // Convert message buffer to string
      const parsed = parseRequirements(inputText);           // Run NLP parsing
      console.log('✅ Parsed Requirements:', parsed);         // Log result

      // Send result to the output queue
      channel.sendToQueue(outQueue, Buffer.from(JSON.stringify(parsed)), { persistent: true });

      channel.ack(msg);   // Acknowledge we successfully processed the message
    }
  }, { noAck: false });   // Require manual acknowledgment to avoid message loss on crash

  console.log(`📦 Requirements Parser is listening on ${inQueue}`);
}

// Entry point
start();
