using Azure.Identity; 
using OpenAI;
using OpenAI.Embeddings;
using System.ClientModel;

const string endpoint = "<%= openai_v1_endpoint %>";
const string deploymentName = "<%= deploymentName %>";

BearerTokenPolicy tokenPolicy = new(
    new DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default");
OpenAIClient client = new(
    authenticationPolicy: tokenPolicy,
    options: new OpenAIClientOptions()
    {
        Endpoint = new Uri(endpoint),
        TokenProvider = new DefaultAzureCredential(),
    });
EmbeddingClient embeddingClient = client.GetEmbeddingClient(deploymentName);

ClientResult<OpenAIEmbedding> embeddingResult = embeddingClient.GenerateEmbedding("The quick brown fox jumped over the lazy dog");

if (embeddingResult?.Value != null)
{
    float[] embedding = embeddingResult.Value.ToFloats().ToArray();

    Console.WriteLine($"Embedding Length: {embedding.Length}");
    Console.WriteLine("Embedding Values:");
    foreach (float value in embedding)
    {
        Console.Write($"{value}, ");
    }
}
else
{
    Console.WriteLine("Failed to generate embedding or received null value.");
}
