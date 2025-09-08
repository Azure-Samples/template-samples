import { SdkSamples } from './sdk-samples';

/**
 * Example usage demonstrating the partner team's proposed usage pattern
 */

// Original proposed usage:
// const capabilities = chatCodeSample.getCapabilities(modelName);
// const codeSampleFile = chatCodeSample.getCodeFile(modelName, sdk, apiType, authType, language, capabilities[0]);
// const requirements = chatCodeSample.getRequirements(modelName, sdk, language, apiType, authType, capabilities[0]);

// New API equivalent:
console.log('=== Consumer Usage Example ===\n');

// Step 1: Get available capabilities for chat completion
const capabilities = SdkSamples.getAvailableCapabilities({ scenario: 'chat-completion', sdk: 'openai', api: 'completions' });
console.log('Available capabilities for chat completion:', capabilities);

// Step 2: Get code sample with the specified criteria
const samples = SdkSamples.getSamplesByQuery({
  scenario: 'chat-completion',
  sdk: 'openai',
  api: 'completions', 
  authType: 'entra',
  language: 'csharp',
  apiStyle: 'sync',
  modelCapabilities: capabilities.length > 0 ? [capabilities[0]] : []
});

console.log(`\nFound ${samples.length} matching samples:`);

if (samples.length > 0) {
  const firstSample = samples[0];
  
  // Equivalent to codeSampleFile
  const codeSampleFile = firstSample.sourceCode;
  console.log('\nCode Sample Preview:');
  console.log(codeSampleFile.substring(0, 200) + '...');
  
  // Equivalent to requirements  
  const requirements = firstSample.metadata.dependencies;
  console.log('\nRequirements:');
  requirements.forEach(dep => {
    console.log(`- ${dep.name}: ${dep.version} (${dep.type})`);
  });
  
  console.log('\nSample Metadata:');
  console.log(`- ID: ${firstSample.metadata.id}`);
  console.log(`- Description: ${firstSample.metadata.description}`);
  console.log(`- Language: ${firstSample.metadata.language}`);
  console.log(`- SDK: ${firstSample.metadata.sdk}`);
  console.log(`- API: ${firstSample.metadata.api}`);
  console.log(`- Auth Type: ${firstSample.metadata.authType}`);
  console.log(`- API Style: ${firstSample.metadata.apiStyle}`);
  console.log(`- Capabilities: ${firstSample.metadata.modelCapabilities.join(', ') || 'None'}`);
}

console.log('\n=== Additional Discovery Examples ===\n');

// Explore what's available
console.log('All available SDKs:', SdkSamples.getAvailableSDKs());
console.log('APIs for OpenAI SDK:', SdkSamples.getAvailableApis({ sdk: 'openai' }));
console.log('Scenarios for Responses API:', SdkSamples.getAvailableScenarios({ sdk: 'openai', api: 'responses' }));
console.log('Languages supporting Go:', SdkSamples.getAvailableLanguages({ sdk: 'openai' }));
console.log('Available auth types:', SdkSamples.getAvailableAuthTypes());

console.log('\n=== Advanced Query Examples ===\n');

// Find all async samples
const asyncSamples = SdkSamples.findSamples({ apiStyle: 'async' });
console.log(`Found ${asyncSamples.length} async samples:`);
asyncSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.scenario} (${sample.api})`);
});

// Find all streaming samples
const streamingSamples = SdkSamples.findSamples({ modelCapabilities: ['streaming'] });
console.log(`\nFound ${streamingSamples.length} streaming samples:`);
streamingSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.scenario}`);
});

// Find responses API samples
const responsesSamples = SdkSamples.findSamples({ api: 'responses' });
console.log(`\nFound ${responsesSamples.length} responses API samples:`);
responsesSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.scenario}`);
});

console.log('\nUsage example completed!');
