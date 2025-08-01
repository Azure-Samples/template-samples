using Azure.AI.OpenAI;
using Azure.Identity;
using OpenAI.Audio;

const string endpoint = "<%= endpoint %>";;
const string deploymentName = "<some-deployment-name>";;

AzureOpenAIClient client = new(new(endpoint), new DefaultAzureCredential());
AudioClient chatClient = client.GetAudioClient(deploymentName);

AudioTranscriptionOptions transcriptionOptions = new AudioTranscriptionOptions
{
   Language = "en", // Specify the language if needed
   ResponseFormat = AudioTranscriptionFormat.Simple, // Specify the response format
   Temperature = 0.1f // Set temperature for transcription
};

string fileName = "batman.wav";
string audioFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", fileName);
var transcriptionResult = await chatClient.TranscribeAudioAsync(audioFilePath, transcriptionOptions);
Console.WriteLine(transcriptionResult.Value.Text.ToString());