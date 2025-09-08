import { SdkSamples } from './sdk-samples';

// Test the API implementation
console.log('Testing SdkSamples API...\n');

// Test discovery methods
console.log('Available SDKs:', SdkSamples.getAvailableSDKs());
console.log('Available APIs for OpenAI:', SdkSamples.getAvailableApis({ sdk: 'openai' }));
console.log('Available scenarios for completions:', SdkSamples.getAvailableScenarios({ sdk: 'openai', api: 'completions' }));
console.log('Available languages for chat-completion:', SdkSamples.getAvailableLanguages({ scenario: 'chat-completion', sdk: 'openai', api: 'completions' }));
console.log('Available auth types:', SdkSamples.getAvailableAuthTypes());
console.log('Available capabilities:', SdkSamples.getAvailableCapabilities({ scenario: 'chat-completion', sdk: 'openai', api: 'completions' }));

console.log('\n--- Query Examples ---\n');

// Test finding samples
console.log('Finding Go chat completion samples:');
const goSamples = SdkSamples.findSamples({
  language: 'go',
  scenario: 'chat-completion',
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
  console.log(`- ${sample.metadata.scenario} (${sample.metadata.api})`);
});

console.log('\nAPI test completed!');
