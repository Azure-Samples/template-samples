# NPM Package API Proposal: DevX Generated Samples

## Overview

This document proposes an API design for an NPM package that provides programmatic access to Azure SDK code samples. The package will be consumed by partner teams who need to dynamically select and retrieve code samples based on various criteria such as SDK type, programming language, scenario, authentication method, and model capabilities.

## Background

Our pipeline generates code samples for various SDK scenarios across multiple programming languages. Partner teams like Foundry require an NPM package that allows them to:

- Discover available samples programmatically
- Filter samples by multiple criteria
- Retrieve sample code and metadata
- Access dependency information for samples
- Support future expansion (new SDKs, scenarios, languages)

## Current Sample Structure

Our samples are organized by:
- **SDKs**: OpenAI (current), Projects (future)
- **APIs**: Completions API (`client.chat.completions`), Responses API (`client.responses`), Embeddings API, etc.
- **Scenarios**: chat-completion, embeddings, image-generation, audio-transcription, responses-basic, etc.
- **Languages**: C#, Python, Java, Go, JavaScript
- **Auth Types**: Entra ID, API Key
- **API Styles**: Synchronous, Asynchronous
- **Model Capabilities**: reasoning, tool-calling, streaming, vision, structured-outputs
- **Model Families**: GPT-4, O1-mini, etc.

## API Design

### Core Interfaces

```typescript
interface SampleQuery {
  scenario?: string;           // 'chat-completion', 'embeddings', 'responses-basic', etc.
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects' (future)
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  modelCapabilities?: string[]; // 'reasoning', 'tool-calling', 'streaming', 'vision'
  modelFamily?: string;       // 'gpt-4', 'o1-mini', etc.
  [key: string]: any;         // Future extensibility
}

interface SampleMetadata {
  id: string;
  scenario: string;
  language: string;
  sdk: string;
  api: string;
  authType: string;
  apiStyle: string;
  modelCapabilities: string[];
  modelFamily?: string;
  dependencies: Dependency[];
  description: string;
  tags: string[];
}

interface Dependency {
  name: string;
  version: string;
  type: 'package' | 'runtime' | 'tool';
}

interface SampleContent {
  metadata: SampleMetadata;
  sourceCode: string;
  projectFile?: string;       // .csproj, requirements.txt, package.json, etc.
  readme?: string;
  examples?: string[];
}
```

### Main API Class

```typescript
export class SdkSamples {
  // Discovery methods - explore what's available
  static getAvailableScenarios(sdk?: string, api?: string): string[];
  static getAvailableLanguages(scenario?: string, sdk?: string, api?: string): string[];
  static getAvailableApis(sdk?: string): string[];
  static getAvailableAuthTypes(scenario?: string, language?: string, sdk?: string, api?: string): string[];
  static getAvailableCapabilities(scenario?: string, sdk?: string, api?: string): string[];
  static getAvailableSDKs(): string[];
  
  // Core query methods - retrieve samples
  static findSamples(query: Partial<SampleQuery>): SampleMetadata[];
  static getSample(id: string): SampleContent | null;
  static getSamplesByQuery(query: Partial<SampleQuery>): SampleContent[];
}
```

## Usage Examples

### Discovery Pattern

```typescript
// What SDKs are available?
const sdks = SdkSamples.getAvailableSDKs();
// ['openai']

// What API types does OpenAI SDK support?
const apiTypes = SdkSamples.getAvailableApis('openai');
// ['completions', 'responses', 'embeddings', 'images', 'audio']

// What scenarios does the Completions API support?
const completionsScenarios = SdkSamples.getAvailableScenarios('openai', 'completions');
// ['chat-completion', 'chat-completion-streaming', 'chat-completion-conversation']

// What scenarios does the Responses API support?
const responsesScenarios = SdkSamples.getAvailableScenarios('openai', 'responses');
// ['responses-basic', 'responses-streaming', 'responses-conversation', 'responses-image-input']

// What model capabilities are available for chat completion?
const capabilities = SdkSamples.getAvailableCapabilities('chat-completion', 'openai', 'completions');
// ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs']

// What languages support the responses API?
const languages = SdkSamples.getAvailableLanguages('responses-basic', 'openai', 'responses');
// ['csharp', 'python', 'java', 'go']
const scenarios = SdkSamples.getAvailableScenarios('openai');
// ['chat-completion', 'embeddings', 'image-generation', 'audio-transcription']

// What model capabilities are available for chat completion?
const capabilities = SdkSamples.getAvailableCapabilities('chat-completion', 'openai');
// ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs']

// What languages support chat completion?
const languages = SdkSamples.getAvailableLanguages('chat-completion', 'openai');
// ['csharp', 'python', 'java', 'go', 'javascript']
```

### Sample Retrieval Pattern

```typescript
// Find Completions API samples with specific capabilities
const completionsSamples = SdkSamples.findSamples({
  sdk: 'openai',
  api: 'completions',
  scenario: 'chat-completion',
  language: 'csharp',
  authType: 'entra',
  modelCapabilities: ['streaming', 'tool-calling']
});

// Find Responses API samples for conversation scenarios
const responsesSamples = SdkSamples.findSamples({
  sdk: 'openai',
  api: 'responses',
  scenario: 'responses-conversation',
  language: 'python',
  apiStyle: 'async'
});

// Get a specific Responses API sample with image input
const sample = SdkSamples.getSamplesByQuery({
  sdk: 'openai',
  api: 'responses',
  scenario: 'responses-image-input',
  language: 'java',
  authType: 'key'
})[0];

if (sample) {
  console.log('Source code:', sample.sourceCode);
  console.log('Dependencies:', sample.metadata.dependencies);
  console.log('Uses Responses API:', sample.metadata.api === 'responses');
}
```

### Partner Team Integration

Based on the original usage example, here's how it maps to our API:

```typescript
// Original proposed usage:
// const capabilities = chatCodeSample.getCapabilities(modelName);
// const codeSampleFile = chatCodeSample.getCodeFile(modelName, sdk, apiType, authType, language, capabilities[0]);
// const requirements = chatCodeSample.getRequirements(modelName, sdk, language, apiType, authType, capabilities[0]);

// New API equivalent:
const capabilities = SdkSamples.getAvailableCapabilities('chat-completion', 'openai', 'completions');
const samples = SdkSamples.getSamplesByQuery({
  scenario: 'chat-completion',
  sdk: 'openai',
  api: 'completions',        // Completions API vs Responses API
  language: 'csharp',
  authType: 'entra',
  apiStyle: 'async',
  modelCapabilities: [capabilities[0]]
});

const codeSampleFile = samples[0]?.sourceCode;
const requirements = samples[0]?.metadata.dependencies;

// For Responses API samples:
const responsesSamples = SdkSamples.getSamplesByQuery({
  scenario: 'responses-basic',
  sdk: 'openai',
  api: 'responses',          // Using Responses API instead
  language: 'python',
  authType: 'key'
});
```

## Understanding APIs

The `api` parameter distinguishes between different API endpoints within the same SDK:

### OpenAI SDK APIs

- **`completions`**: Traditional Chat Completions API (`client.chat.completions.create()`)
  - Scenarios: `chat-completion`, `chat-completion-streaming`, `chat-completion-conversation`
  - Use cases: Standard chat interactions, streaming responses, multi-turn conversations

- **`responses`**: New Responses API (`client.responses.create()`) 
  - Scenarios: `responses-basic`, `responses-streaming`, `responses-conversation`, `responses-image-input`
  - Use cases: Enhanced response handling, better conversation management, multi-modal inputs

- **`embeddings`**: Embeddings API (`client.embeddings.create()`)
  - Scenarios: `embeddings`, `embeddings-async`
  - Use cases: Text similarity, semantic search, vector operations

- **`images`**: Image Generation API (`client.images.generate()`)
  - Scenarios: `image-generation`, `image-generation-async`
  - Use cases: AI-generated images, creative content

- **`audio`**: Audio Processing API (`client.audio.transcriptions.create()`)
  - Scenarios: `audio-transcription`, `audio-transcription-async`
  - Use cases: Speech-to-text, audio analysis

This distinction is crucial because different APIs have different capabilities, parameters, and response formats, even within the same SDK.


## Package Structure

```
@azure-foundry/sdk-samples/
├── index.ts              # Main API exports
├── lib/
│   ├── metadata.ts       # Sample metadata and indexing
│   ├── query.ts          # Query engine implementation
│   └── discovery.ts      # Discovery method implementations
├── data/
│   ├── samples/          # Sample content
│   └── metadata.json     # Sample metadata index
└── types/
    └── index.ts          # TypeScript type definitions
```

## Future Considerations

### SDK Expansion
When Projects SDK is added:
```typescript
// New usage patterns - no API changes needed
const projectsScenarios = SdkSamples.getAvailableScenarios('projects');
const projectsSample = SdkSamples.getSamplesByQuery({
  sdk: 'projects',
  scenario: 'model-deployment',
  language: 'python'
});
```

### New Dimensions
Future parameters can be added without breaking changes:
```typescript
interface SampleQuery {
  // ... existing parameters
  region?: string;          // 'eastus', 'westus2', etc.
  securityLevel?: string;   // 'basic', 'enterprise', etc.
  deploymentType?: string;  // 'container', 'serverless', etc.
}
```
