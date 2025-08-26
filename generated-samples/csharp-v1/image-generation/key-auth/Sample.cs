using Azure; 
using OpenAI.Images;
using System;
using System.IO;

const string endpoint = "<%= openai_v1_endpoint %>";
const string apiKey = "{your-api-key}";;
 
ImageClient client = new(
    new ApiKeyCredential(apiKey),
    new OpenAIClientOptions()
    {
        Endpoint = new($"{endpoint}/openai/v1/"),
        TokenProvider = new DefaultAzureCredential(),
    }
);

ImageGenerationOptions options = new()
{
    Quality = GeneratedImageQuality.High,
    Size = GeneratedImageSize.W1792xH1024,
    Style = GeneratedImageStyle.Vivid,
    ResponseFormat = GeneratedImageFormat.Bytes
};

GeneratedImage image = client.GenerateImage(prompt, options);
BinaryData bytes = image.ImageBytes;

using FileStream stream = File.OpenWrite($"{Guid.NewGuid()}.png");
bytes.ToStream().CopyTo(stream);