import OpenAI from "openai";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = "<%= openai_v1_endpoint %>";
const deployment_name = "<%= deploymentName %>";

const tokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://cognitiveservices.azure.com/.default');
const client = new OpenAI({
    baseURL: endpoint,
    tokenProvider: async () => { return { token: await tokenProvider(), } }
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