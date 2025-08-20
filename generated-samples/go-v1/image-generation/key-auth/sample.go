package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/azure"
	"github.com/openai/openai-go/v2/option"
)

func main() {
	const endpoint = "<%= openai_v1_endpoint %>"
	const apiKey = "{your-api-key}"
	const deploymentName = "<%= deploymentName %>"

		client := openai.NewClient(
		option.WithBaseURL(endpoint),
		option.WithAPIKey(apiKey),
		)
	
	// Image URL
	image, err := client.Images.Generate(ctx, openai.ImageGenerateParams{
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
