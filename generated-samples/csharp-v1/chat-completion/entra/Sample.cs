using Azure; 
using OpenAI.Chat;

const string endpoint = "<%= endpoint %>";
const string apiKey = "<some-api-key>";;
 
OpenAIClient client = new(
    new ApiKeyCredential(apiKey),
    new OpenAIClientOptions()
    {
        Endpoint = new("https://{your-resource}.openai.azure.com/openai/v1/"),
        TokenProvider = new DefaultAzureCredential(),
    });

ChatCompletion completion = client.CompleteChat(
     [
         new SystemChatMessage("You are a helpful assistant that talks like a pirate."),
         new UserChatMessage("Hi, can you help me?"),
         new AssistantChatMessage("Arrr! Of course, me hearty! What can I do for ye?"),
         new UserChatMessage("What's the best way to train a parrot?"),
     ]);

Console.WriteLine($"Model={completion.Model}");
foreach (var choice in completion.Content)
{
    var message = choice.Text;
    Console.WriteLine($"Chat Role: {completion.Role}");
    Console.WriteLine("Message:");
    Console.WriteLine(message);
} 