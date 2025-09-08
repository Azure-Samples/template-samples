# @azure-foundry/sample-library

Pipeline-validated Azure SDK code samples library for programmatic discovery and retrieval. Maintained by the Azure DevX team with guaranteed compilation and execution validation.

## Installation

```bash
npm install @azure-foundry/sample-library
```

## Usage

```typescript
import { SdkSamples } from '@azure-foundry/sample-library';

// Discover available options using focused filters
const sdks = SdkSamples.getAvailableSDKs();
const apis = SdkSamples.getAvailableApis({ sdk: 'openai' });
const scenarios = SdkSamples.getAvailableScenarios({ 
  sdk: 'openai', 
  api: 'completions' 
});

// Find languages that support chat completion
const languages = SdkSamples.getAvailableLanguages({
  scenario: 'chat-completion',
  sdk: 'openai',
  api: 'completions'
});

// Find and retrieve samples
const samples = SdkSamples.getSamplesByQuery({
  sdk: 'openai',
  api: 'completions',
  scenario: 'chat-completion',
  language: 'csharp',
  authType: 'entra'
});

console.log('Sample code:', samples[0]?.sourceCode);
console.log('Dependencies:', samples[0]?.metadata.dependencies);
```

## Key Features

- **Filter-Based Discovery**: Use focused filter objects for intuitive sample discovery
- **Type-Safe**: Full TypeScript support with method-specific filter interfaces
- **Extensible**: Easy to add new filter dimensions without breaking existing code
- **Self-Documenting**: Named parameters make code clear and readable

## Advanced Usage

```typescript
// Build a dynamic sample selector
function buildSampleSelector() {
  // Step 1: Show available SDKs
  const sdks = SdkSamples.getAvailableSDKs();
  
  // Step 2: When SDK selected, show APIs
  const apis = SdkSamples.getAvailableApis({ sdk: 'openai' });
  
  // Step 3: When API selected, show scenarios
  const scenarios = SdkSamples.getAvailableScenarios({ 
    sdk: 'openai', 
    api: 'completions' 
  });
  
  // Step 4: Show languages for the combination
  const languages = SdkSamples.getAvailableLanguages({
    scenario: 'chat-completion',
    sdk: 'openai',
    api: 'completions'
  });
}

// Find samples with specific capabilities
const streamingSamples = SdkSamples.findSamples({
  modelCapabilities: ['streaming']
});

// Find async samples for a specific language
const asyncPythonSamples = SdkSamples.findSamples({
  language: 'python',
  apiStyle: 'async'
});
```

## API Reference

See the [API Proposal](../../npm-package-api-proposal.md) for complete documentation.

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run dev

# Run tests
npm run test
```
