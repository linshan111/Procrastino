export async function generateStudyPlan(messages, currentDate) {
    const apiKey = process.env.MEGALLM_API_KEY;
    const baseUrl = process.env.MEGALLM_API_URL || "https://ai.megallm.io/v1/chat/completions";
    const model = process.env.MEGALLM_MODEL || "openai-gpt-oss-20b";

    if (!apiKey) {
        throw new Error("MegaLLM API key not configured");
    }

    const systemPrompt = `You are a helpful and intelligent planning assistant. You chat with the user to help them break down ANY large goal (studying, coding, personal projects, chores, fitness, etc.) into actionable tasks. 
Current date: ${currentDate}

CRITICAL: Provide a COMPREHENSIVE plan. Break the goal down into as many tasks as needed to cover everything (e.g., one task per chapter). However, keep the descriptions and micro-tasks inside each task BRIEF so your response doesn't get cut off.

When you have enough information and are ready to propose an actionable plan, you MUST format the plan as a literal JSON object enclosed EXACTLY in \`\`\`json and \`\`\` markdown tags. DO NOT use markdown formatting inside the JSON values.
You can converse freely before and after the block.

The JSON should have EXACTLY this structure:
{
  "summary": "Brief overview of the plan",
  "tasks": [
    {
      "title": "Task title (e.g., Chapter 1: Mechanics)",
      "description": "Task description...",
      "focusDuration": 60,
      "microTasks": [{"text": "Step 1"}, {"text": "Step 2"}]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 8000,
            }),
            signal: AbortSignal.timeout(45000), // 45 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MegaLLM Error details:', errorText);
            throw new Error(`MegaLLM API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        console.error('Plan generation failed:', error);
        throw error;
    }
}
