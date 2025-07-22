const axios = require('axios');

/**
 * Parse lines grouped under a title (like Components, Flows, Patterns).
 * */
function extractSection(content, sectionTitle) {
  const sectionRegex = new RegExp(`${sectionTitle}[^\n]*\\n([\\s\\S]+?)(\\n\\S|\\n*$)`);
  const match = content.match(sectionRegex);
  if (!match) return null;

  const block = match[1]
    .trim()
    .split('\n')
    .map(line => line.trim().replace(/^[-•*]\s*/, ''));

  return block;
}

/**
 * Try parsing architecture list blocks and building structured output.
 */
function manualParseArchitecture(rawText) {
  const componentsRaw = extractSection(rawText, 'Components');
  const patternsRaw = extractSection(rawText, 'Patterns');
  const flowsRaw = extractSection(rawText, 'Flows');
  const techStackRaw = extractSection(rawText, 'Tech Stack');

  const toParsedArray = (rawList) => (rawList || []).map(item => {
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return {
    components: toParsedArray(componentsRaw),
    patterns: (patternsRaw || []).map(p => p.replace(/^"|"$/g, '')),
    flows: toParsedArray(flowsRaw),
    tech_stack: (techStackRaw || []).map(p => p.replace(/^"|"$/g, ''))
  };
}

/**
 * Prompt Perplexity for architecture -- allow markdown blocks.
 */
async function generateArchitecture(requirements) {
  const prompt = `
You're an expert software architect.

Given the following functional, non-functional requirements, entities, and constraints:
${JSON.stringify(requirements, null, 2)}

Return structured software architecture plan divided into sections:

Components:
- { "name": "User Service", "type": "microservice" }

Patterns:
- "Event-Driven"
- "CQRS"

Flows:
- { "from": "User", "to": "API Gateway", "via": "HTTPS" }

Tech Stack:
- "Node.js"
- "RabbitMQ"
- "PostgreSQL"

Please structure each section clearly with dashes, and only include one JSON object per line where applicable.
`;

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-reasoning-pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content from AI.');
    }

    console.log("📩 Raw response (markdown style):\n", content.slice(0, 500));
    const parsed = manualParseArchitecture(content);

    // Basic check
    if (!parsed.components || !parsed.patterns) {
      throw new Error('Parsed architecture is incomplete');
    }

    return parsed;

  } catch (error) {
    console.error("❌ Fallback parsing failed:", error.message);
    throw error;
  }
}

module.exports = { generateArchitecture };
