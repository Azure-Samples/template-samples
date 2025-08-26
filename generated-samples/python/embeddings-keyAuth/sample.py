from openai import OpenAI

endpoint = "<%= endpoint %>"
deployment_name = "<some-deployment-name>"
api_key = "<%= apiKey %>"

client = OpenAI(
    base_url = endpoint,
    api_key = api_key,
)

response = client.embeddings.create(
    input = "How do I use Python in VS Code?",
    model = deployment_name
)
print(response.data[0].embedding)