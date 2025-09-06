using Azure.Identity; 
using OpenAI.Images;
using System;
using System.IO;

const string endpoint = "<%= openai_v1_endpoint %>";

BearerTokenPolicy tokenPolicy = new(
    new DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default");
ImageClient client = new(
    authenticationPolicy: tokenPolicy,
    options: new OpenAIClientOptions()
    {
        Endpoint = new($"{endpoint}/openai/v1/"),
    });

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