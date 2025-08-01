import com.azure.identity.AuthenticationUtil;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.credential.BearerTokenCredential;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

public class Main {
    public static void main(String[] args) {

        String endpoint = "<%= endpoint %>";
        String deploymentName = "<some-deployment-name>";      

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .baseUrl(endpoint)
                // Set the Azure Entra ID
                .credential(BearerTokenCredential.create(AuthenticationUtil.getBearerTokenSupplier(
                        new DefaultAzureCredentialBuilder().build(), "https://cognitiveservices.azure.com/.default")))
                .build();

        ChatCompletionCreateParams createParams = ChatCompletionCreateParams.builder()
                .model(ChatModel.of(deploymentName))
                .addSystemMessage("You are a helpful assistant. You will talk like a pirate.")
                .addUserMessage("Can you help me?")
                .addUserMessage("What's the best way to train a parrot?")
                .build();
                
        client.chat().completions().create(createParams).choices().stream()
            .flatMap(choice -> choice.message().content().stream())
            .forEach(System.out::println);
    }
}