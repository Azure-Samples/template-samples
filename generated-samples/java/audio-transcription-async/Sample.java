import com.openai.azure.credential.AzureApiKeyCredential;
import com.openai.credential.BearerTokenCredential;
import com.openai.client.OpenAIClientAsync;
import com.openai.client.okhttp.OpenAIOkHttpClientAsync;
import com.openai.models.audio.AudioModel;
import com.openai.models.audio.transcriptions.Transcription;
import com.openai.models.audio.transcriptions.TranscriptionCreateParams;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.azure.core.credential.TokenCredential;
import com.azure.identity.AuthenticationUtil;
import com.azure.identity.DefaultAzureCredentialBuilder; 

public class Sample {
    public static void main(String[] args) {
        
        String endpoint = "<%= endpoint %>";;
        
        OpenAIOkHttpClientAsync.Builder clientBuilder = OpenAIOkHttpClientAsync.builder();
        clientBuilder
                .baseUrl(endpoint)
                .credential(BearerTokenCredential.create(AuthenticationUtil.getBearerTokenSupplier(
                        new DefaultAzureCredentialBuilder().build(), "https://cognitiveservices.azure.com/.default")));
        
        OpenAIClientAsync client = clientBuilder.build();

        TranscriptionCreateParams createParams = TranscriptionCreateParams.builder()
            .file(Paths.get("batman.wav"))
            .model(AudioModel.of("whisper"))
            .build();

        // Use the async version
        Transcription result = client.audio()
            .transcriptions()
            .create(createParams)
            .thenApplyAsync(response -> response.asTranscription())
            .join();

         System.out.println(result.text());
    }
}