import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.images.ImageGenerateParams;
import com.openai.models.images.ImageModel;
import java.io.IOException;

import com.openai.azure.credential.AzureApiKeyCredential; 


public class Sample {
    public static void main(String[] args) {

    String endpoint = "<%= openai_v1_endpoint %>";
    String apiKey = "{your-api-key}";
    String deploymentName = "<%= deploymentName %>";

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .baseUrl(endpoint)
                .credential(AzureApiKeyCredential.create("{your-api-key}"))
                .build();

        ImageGenerateParams imageGenerateParams = ImageGenerateParams.builder()
                .responseFormat(ImageGenerateParams.ResponseFormat.URL)
                .prompt("A cute baby polar bear")
                .model(deploymentName)
                .size(ImageGenerateParams.Size._512X512)
                .n(1)
                .build();

        client.images().generate(imageGenerateParams).data().orElseThrow().stream()
                .flatMap(image -> image.url().stream())
                .forEach(System.out::println);
    }
}