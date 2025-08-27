package main

import (
	"context"
	"fmt"
	"log"

	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/option"
)

func main() {
	const endpoint = "<%= endpoint %>"
	const apiKey = "<%= apiKey %>"
	const deploymentName = "<some-deployment-name>"

	client := openai.NewClient(
		option.WithBaseURL(endpoint),
		option.WithAPIKey(apiKey),
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
