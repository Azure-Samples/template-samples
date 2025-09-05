import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;

import com.azure.identity.AuthenticationUtil;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.openai.credential.BearerTokenCredential; 
import com.openai.models.embeddings.EmbeddingCreateParams;
import com.openai.models.embeddings.EmbeddingModel;

public class Sample {
    public static void main(String[] args) {
        String endpoint = "<%= endpoint %>";
        String deploymentName = "<some-deployment-name>";
        
        OpenAIOkHttpClient.Builder clientBuilder = OpenAIOkHttpClient.builder();
        clientBuilder
                .baseUrl(endpoint)
                .credential(BearerTokenCredential.create(AuthenticationUtil.getBearerTokenSupplier(
                        new DefaultAzureCredentialBuilder().build(), "https://cognitiveservices.azure.com/.default")));
        OpenAIClient client = clientBuilder.build();

        EmbeddingCreateParams createParams = EmbeddingCreateParams.builder()
                .input("The quick brown fox jumped over the lazy dog")
                .model(EmbeddingModel.of(deploymentName))
                .build();

        System.out.println(client.embeddings().create(createParams));
    }
}