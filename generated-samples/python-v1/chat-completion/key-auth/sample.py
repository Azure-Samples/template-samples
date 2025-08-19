from openai import OpenAI

endpoint = "<%= openai_v1_endpoint %>"
deployment_name = "<%= deploymentName %>"
api_key = "<your-api-key>"

client = OpenAI(
    base_url=f"https://{endpoint}/openai/v1",
    api_key=api_key
)

completion = client.chat.completions.create(
    model=deployment_name,
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?",
        }
    ],
)

print(completion.choices[0].message)