using Azure.AI.OpenAI;
using Azure.Identity;
using OpenAI.Audio;

const string endpoint = "<%= endpoint %>";;
const string deploymentName = "<some-deployment-name>";;

AzureOpenAIClient client = new(new(endpoint), new DefaultAzureCredential());
AudioClient chatClient = client.GetAudioClient(deploymentName);

string fileName = "batman.wav";
string audioFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", fileName);
var transcriptionResult = chatClient.TranscribeAudio(audioFilePath);

Console.WriteLine(transcriptionResult.Value.Text.ToString());