import OpenAI from "openai";

const endpoint = "<%= openai_v1_endpoint %>";
const deployment_name = "<%= deploymentName %>";
const api_key = "<%= apiKey %>";

const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      { role: "developer", content: "You talk like a pirate." },
      { role: "user", content: "Can you help me?" }
    ],
    model: deployment_name,
  });

  console.log(completion.choices[0]);
}

main();