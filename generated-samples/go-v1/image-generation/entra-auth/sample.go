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
	
	// Image URL
	image, err := client.Images.Generate(context.Background(), openai.ImageGenerateParams{
		Prompt:         "A cute baby polar bear",
		Model:          deploymentName,
		ResponseFormat: openai.ImageGenerateParamsResponseFormatURL,
		N:              openai.Int(1),
	})
	if err != nil {
		panic(err)
	}
	println("Image URL:")
	println(image.Data[0].URL)
	println()
}
