const axios = require('axios');

async function generateArchitecture(requirements) {
  const prompt = `
You are an expert software architect.

Given the following requirements:
${JSON.stringify(requirements, null, 2)}

Generate a system architecture as structured JSON:
{
  "components": [],
  "patterns": [],
  "flows": [],
  "tech_stack": []
}
`;

  const response = await axios.post(
    'https://api.perplexity.ai/chat/completions',
    {
      model: 'sonar-reasoning-pro', // ← ✅ Working model
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // Extract the assistant's content
  const content = response.data.choices[0].message.content;

  // Attempt to extract structured JSON from response
  const match = content.match(/{[\s\S]+}/);
  if (!match) throw new Error('No valid JSON found in AI response');

  return JSON.parse(match[0]);
}

module.exports = { generateArchitecture };
