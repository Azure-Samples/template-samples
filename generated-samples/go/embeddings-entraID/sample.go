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
	const endpoint = "<%= endpoint %>"
	const deploymentName = "<some-deployment-name>"

	token_credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		fmt.Println("Error creating credential:", err)
		os.Exit(1)
	}
	client := openai.NewClient(
		option.WithBaseURL(endpoint),
		azure.WithTokenCredential(token_credential),
	)

	inputText := "The quick brown fox jumped over the lazy dog"

	// Make the embedding request synchronously
	resp, err := client.Embeddings.New(context.Background(), openai.EmbeddingNewParams{
		Model: openai.EmbeddingModel(deploymentName),
		Input: openai.EmbeddingNewParamsInputUnion{
			OfArrayOfStrings: []string{inputText},
		},
	})
	if err != nil {
		log.Fatalf("Failed to get embedding: %v", err)
	}

	if len(resp.Data) == 0 {
		fmt.Println("No embedding data returned.")
		return
	}

	embedding := resp.Data[0].Embedding
	fmt.Printf("Embedding Length: %d\n", len(embedding))
	fmt.Println("Embedding Values:")
	for _, value := range embedding {
		fmt.Printf("%f, ", value)
	}
	fmt.Println()
}
