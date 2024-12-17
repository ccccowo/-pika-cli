import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey:'sk-1vAKthNNcoSlMC6hYMVkVxkZHugaPcg7sEyieSHYKYf3VXjC',
  baseURL: 'https://api.302.ai/v1',
});

async function main() {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: 
        [
            { role: "user", content: "生成一个Table的React组件" }
        ],
        stream: true,
    });
    for await (const chunk of response) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
}

main();