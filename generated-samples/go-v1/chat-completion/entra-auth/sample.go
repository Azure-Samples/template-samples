package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/azure"
	"github.com/openai/openai-go/v2/option"
)

func main() {
	const endpoint = "<%= openai_v1_endpoint %>"
	const deploymentName = "<%= deploymentName %>"

	token_credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		fmt.Println("Error creating credential:", err)
		os.Exit(1)
	}
	client := openai.NewClient(
		option.WithBaseURL(endpoint),
		azure.WithTokenCredential(token_credential),
	)

	resp, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Model: openai.ChatModel(deploymentName),
		Messages: []openai.ChatCompletionMessageParamUnion{
			{
				OfSystem: &openai.ChatCompletionSystemMessageParam{
					Content: openai.ChatCompletionSystemMessageParamContentUnion{
						OfString: openai.String("You are a helpful assistant. You will talk like a pirate."),
					},
				},
			},
			{
				OfUser: &openai.ChatCompletionUserMessageParam{
					Content: openai.ChatCompletionUserMessageParamContentUnion{
						OfString: openai.String("What's the best way to train a parrot?"),
					},
				},
			},
		},
	})

	if err != nil {
		log.Printf("ERROR: %s", err)
		return
	}

	for _, choice := range resp.Choices {
		if choice.Message.Content != "" {
			fmt.Fprintf(os.Stderr, "Content[%d]: %s\n", choice.Index, choice.Message.Content)
		}
	}
}
