import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function callGemini(prompt, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const result = await model.generateContent(prompt);
        clearTimeout(timer);
        const response = result.response;
        return response.text();
    } catch (error) {
        clearTimeout(timer);
        console.error('Gemini API error:', error.message);
        return null;
    }
}

export async function getInsights(focusHistory) {
    const prompt = `You are a productivity analyst. Analyze this focus session history and provide 3-4 concise insights about procrastination patterns. Be specific about times, days, and behavior patterns.

Focus History:
${JSON.stringify(focusHistory, null, 2)}

Respond in JSON format:
{
  "insights": [
    { "icon": "⏰", "title": "Short title", "description": "Detailed insight" }
  ],
  "summary": "One sentence summary of patterns"
}`;

    const result = await callGemini(prompt);
    if (!result) return null;

    try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

export async function rewriteTask(title, description) {
    const prompt = `You are a productivity expert. Break this vague goal into 3-5 clear, actionable micro-tasks that can each be completed in 2-5 minutes.

Task: ${title}
${description ? `Description: ${description}` : ''}

Respond in JSON format:
{
  "microTasks": [
    { "text": "Clear actionable step", "estimatedMinutes": 3 }
  ]
}`;

    const result = await callGemini(prompt);
    if (!result) return null;

    try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

export async function generateRoast(context) {
    const prompt = `You are a brutally honest productivity coach. Generate a short, funny, motivational roast (1-2 sentences) for someone who just ${context === 'abandon' ? 'abandoned their focus session' : 'kept switching tabs instead of focusing'}. Be witty but not mean. Make it motivating to get back to work.`;

    const result = await callGemini(prompt);
    return result;
}
