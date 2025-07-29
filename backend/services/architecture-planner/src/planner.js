const axios = require('axios');

/**
 * Generates an architecture plan given requirements, using the Qwen model on OpenRouter.
 * Returns a fully structured architecture object.
 */
async function generateArchitecture(requirements) {
  if (!requirements) {
    console.error("Error in requirements parameters in planner");
    return;
  }
  const prompt = `
You are an expert software architect.

Given the following software system requirements:
${JSON.stringify(requirements, null, 2)}

Create a software architecture plan in valid JSON format with the structure:
{
  "components": [{ "name": "string", "type": "string" }],
  "patterns": ["string"],
  "flows": [{ "from": "string", "to": "string", "via": "string" }],
  "tech_stack": ["string"]
}

Return only the JSON. Do NOT include explanations or markdown.
`;
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'qwen/qwen3-235b-a22b-07-25:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("requirments: ", requirements, response.data)

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenRouter.');
    }

    // Log for debugging
    console.log('🧠 Raw model output:', content.slice(0, 200) + '...');

    // Qwen is consistent — typically returns clean JSON you can safely parse
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      // If JSON.parse fails, log for diagnosis
      console.error('❌ JSON parse error:', err.message);
      console.error('🔍 Full output:', content);
      throw new Error('Invalid JSON received from Qwen model.');
    }

    // Optional: Validate required sections
    if (
      !parsed.components ||
      !parsed.patterns ||
      !parsed.flows ||
      !parsed.tech_stack
    ) {
      throw new Error('Parsed JSON missing required architecture fields.');
    }

    return parsed;

  } catch (error) {
    console.error('❌ Error in generateArchitecture:', error.message);
    throw error;
  }
}

module.exports = { generateArchitecture };
