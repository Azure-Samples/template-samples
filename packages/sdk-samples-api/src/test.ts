import { SdkSamples } from './sdk-samples';

// Test the API implementation
console.log('Testing SdkSamples API...\n');

// Test discovery methods
console.log('Available SDKs:', SdkSamples.getAvailableSDKs());
console.log('Available APIs for OpenAI:', SdkSamples.getAvailableApis({ sdk: 'openai' }));
console.log('Available languages for completions:', SdkSamples.getAvailableLanguages({ sdk: 'openai', api: 'completions' }));
console.log('Available auth types:', SdkSamples.getAvailableAuthTypes());
console.log('Available capabilities:', SdkSamples.getAvailableCapabilities({ sdk: 'openai', api: 'completions' }));

console.log('\n--- Query Examples ---\n');

// Test finding samples
console.log('Finding Go completions samples:');
const goSamples = SdkSamples.findSamples({
  language: 'go',
  sdk: 'openai',
  api: 'completions'
});
goSamples.forEach(sample => {
  console.log(`- ${sample.id}: ${sample.description}`);
});

console.log('\nFinding streaming samples:');
const streamingSamples = SdkSamples.findSamples({
  modelCapabilities: ['streaming']
});
streamingSamples.forEach(sample => {
  console.log(`- ${sample.id}: ${sample.description}`);
});

console.log('\nFinding responses API samples:');
const responsesSamples = SdkSamples.findSamples({
  api: 'responses'
});
responsesSamples.forEach(sample => {
  console.log(`- ${sample.id}: ${sample.description}`);
});

// Test getting full sample content
console.log('\n--- Sample Content ---\n');
const sampleContent = SdkSamples.getSample('go-chat-completion-openai-completions-key-sync');
if (sampleContent) {
  console.log('Sample ID:', sampleContent.metadata.id);
  console.log('Description:', sampleContent.metadata.description);
  console.log('Dependencies:', sampleContent.metadata.dependencies.map(d => `${d.name}@${d.version}`));
  console.log('Source code preview:', sampleContent.sourceCode.substring(0, 100) + '...');
}

// Test query with multiple samples
console.log('\n--- Multiple Sample Query ---\n');
const pythonSamples = SdkSamples.getSamplesByQuery({
  language: 'csharp',
  authType: 'entra'
});
console.log(`Found ${pythonSamples.length} C# samples with Entra auth:`);
pythonSamples.forEach(sample => {
  console.log(`- ${sample.metadata.api} API (${sample.metadata.language})`);
});

console.log('\n--- Model Capabilities API ---\n');

// Test model discovery
console.log('Available models:', SdkSamples.getAvailableModels());
console.log('OpenAI completions models:', SdkSamples.getAvailableModels({ sdk: 'openai', api: 'completions' }));
console.log('Models with vision capability:', SdkSamples.getModelsWithCapability('vision'));
console.log('Models with reasoning capability:', SdkSamples.getModelsWithCapability('reasoning', { sdk: 'openai' }));

// Test getting specific model capabilities
const gpt4Capabilities = SdkSamples.getModelCapabilities('gpt-4');
if (gpt4Capabilities) {
  console.log('\nGPT-4 model details:');
  console.log('- Description:', gpt4Capabilities.description);
  console.log('- Supported APIs:', gpt4Capabilities.supportedApis);
  console.log('- Capabilities:', gpt4Capabilities.capabilities);
  console.log('- Context Window:', gpt4Capabilities.contextWindow);
}

const o1Capabilities = SdkSamples.getModelCapabilities('o1-mini');
if (o1Capabilities) {
  console.log('\nO1-Mini model details:');
  console.log('- Description:', o1Capabilities.description);
  console.log('- Supported APIs:', o1Capabilities.supportedApis);
  console.log('- Capabilities:', o1Capabilities.capabilities);
}

console.log('\nAPI test completed!');
