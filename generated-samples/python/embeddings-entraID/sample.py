from openai import OpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

endpoint = "<%= endpoint %>"
deployment_name = "<some-deployment-name>"
token_provider = get_bearer_token_provider(DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default")

client = OpenAI(
    base_url = endpoint,
    api_key_provider = token_provider,
)

response = client.embeddings.create(
    input = "How do I use Python in VS Code?",
    model = deployment_name
)
print(response.data[0].embedding)