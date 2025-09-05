import OpenAI from "openai";

const endpoint = "<%= openai_v1_endpoint %>";
const deployment_name = "<%= deploymentName %>";
const api_key = "<%= apiKey %>";

const client = new OpenAI({
    baseURL: endpoint,
    apiKey: api_key
});

const embedding = await client.embeddings.create({
  model: deployment_name,
  input: "The quick brown fox jumped over the lazy dog",
  encoding_format: "float",
});

console.log(embedding);