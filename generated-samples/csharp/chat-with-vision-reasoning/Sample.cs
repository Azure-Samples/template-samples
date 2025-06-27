using System.ClientModel;
using Azure.AI.OpenAI;
using OpenAI.Chat;

const string endpoint = "<%= endpoint %>";;
const string apiKey = "<some-api-key>";;
const string deploymentName = "<some-deployment-name>";;

AzureOpenAIClient client = new(new Uri(endpoint), new ApiKeyCredential(apiKey));

ChatClient chatClient = client.GetChatClient(deploymentName);

ChatCompletion completion = await chatClient.CompleteChatAsync(
    [
        new UserChatMessage("What is the capital of France?"),
    ],
    new ChatCompletionOptions
    {
      MaxOutputTokenCount = 2000
afasfasfd
    });

Console.WriteLine(completion.Content[0].Text);