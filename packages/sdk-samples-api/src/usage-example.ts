import { SdkSamples } from './sdk-samples';

/**
 * Example usage demonstrating the partner team's proposed usage pattern
 */

console.log('=== Consumer Usage Example ===\n');

// Step 1: Get available capabilities for completions API
const capabilities = SdkSamples.getAvailableCapabilities({ sdk: 'openai', api: 'completions' });
console.log('Available capabilities for completions API:', capabilities);

// Step 2: Get code sample with the specified criteria
const samples = SdkSamples.getSamplesByQuery({
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
console.log('Languages for Responses API:', SdkSamples.getAvailableLanguages({ sdk: 'openai', api: 'responses' }));
console.log('Languages supporting OpenAI:', SdkSamples.getAvailableLanguages({ sdk: 'openai' }));
console.log('Available auth types:', SdkSamples.getAvailableAuthTypes());

console.log('\n=== Advanced Query Examples ===\n');

// Find all async samples
const asyncSamples = SdkSamples.findSamples({ apiStyle: 'async' });
console.log(`Found ${asyncSamples.length} async samples:`);
asyncSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.api} API (${sample.apiStyle})`);
});

// Find all streaming samples
const streamingSamples = SdkSamples.findSamples({ modelCapabilities: ['streaming'] });
console.log(`\nFound ${streamingSamples.length} streaming samples:`);
streamingSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.api} API (streaming)`);
});

// Find responses API samples
const responsesSamples = SdkSamples.findSamples({ api: 'responses' });
console.log(`\nFound ${responsesSamples.length} responses API samples:`);
responsesSamples.forEach(sample => {
  console.log(`- ${sample.language} ${sample.api} API`);
});

console.log('\nUsage example completed!');
