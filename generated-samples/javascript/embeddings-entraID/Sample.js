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

const embedding = await client.embeddings.create({
  model: deployment_name,
  input: "The quick brown fox jumped over the lazy dog",
  encoding_format: "float",
});

console.log(embedding);