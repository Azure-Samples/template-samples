using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

#pragma warning disable OPENAI001

const string deploymentName = "<%= deploymentName %>";
const string endpoint = "<%= openai_v1_endpoint %>";
const string apiKey = "<your-api-key>";

 
ChatClient client = new(
    credential: new ApiKeyCredential(apiKey),
    model: deploymentName,
    options: new OpenAIClientOptions()
    {
        Endpoint = new($"{endpoint}"),
    }); 

ChatCompletion completion = client.CompleteChat(
     [
         new SystemChatMessage("You are a helpful assistant that talks like a pirate."),
         new UserChatMessage("Hi, can you help me?"),
         new AssistantChatMessage("Arrr! Of course, me hearty! What can I do for ye?"),
         new UserChatMessage("What's the best way to train a parrot?"),
     ]);

Console.WriteLine($"Model={completion.Model}");
foreach (ChatMessageContentPart contentPart in completion.Content)
{
    string message = contentPart.Text;
    Console.WriteLine($"Chat Role: {completion.Role}");
    Console.WriteLine("Message:");
    Console.WriteLine(message);
}
