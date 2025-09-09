# NPM Package API Proposal: DevX Generated Samples

## Overview

This document proposes an API design for an NPM package that provides programmatic access to Azure SDK code samples. The package will be consumed by partner teams who need to dynamically select and retrieve code samples based on various criteria such as SDK type, programming language, API type, authentication method, and model capabilities.

## Background

Our pipeline generates code samples for various SDK APIs across multiple programming languages. Partner teams like Foundry require an NPM package that allows them to:

- Discover available samples programmatically
- Filter samples by multiple criteria
- Retrieve sample code and metadata
- Access dependency information for samples
- Support future expansion (new SDKs, APIs, languages)

## Current Sample Structure

Our samples are organized by:
- **SDKs**: OpenAI (current), Projects (future)
- **APIs**: Completions API (`client.chat.completions`), Responses API (`client.responses`), Embeddings API, etc.
- **Languages**: C#, Python, Java, Go, JavaScript
- **Auth Types**: Entra ID, API Key
- **API Styles**: Synchronous, Asynchronous
- **Model Capabilities**: reasoning, tool-calling, streaming, vision, structured-outputs
- **Model Families**: GPT-4, O1-mini, etc.

## API Design

### Core Interfaces

```typescript
// Discovery filter interfaces - each method gets focused, extensible filters
interface LanguageFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

interface ApiFilters {
  sdk?: string;               // 'openai', 'projects'
}

interface AuthTypeFilters {
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

interface CapabilityFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

// Sample query interface for finding/retrieving samples
interface SampleQuery {
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects' (future)
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  modelCapabilities?: string[]; // 'reasoning', 'tool-calling', 'streaming', 'vision'
  modelFamily?: string;       // 'gpt-4', 'o1-mini', etc.
}

interface SampleMetadata {
  id: string;
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

// Model-related interfaces
interface ModelFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

interface ModelCapabilities {
  modelName: string;          // 'gpt-4', 'gpt-4o', 'o1-mini', 'text-embedding-ada-002', etc.
  sdk: string;                // 'openai', 'projects'
  supportedApis: string[];    // APIs this model supports: ['completions', 'responses']
  capabilities: string[];     // Model capabilities: ['reasoning', 'tool-calling', 'streaming', 'vision']
  description?: string;       // Human-readable description of the model
  deprecated?: boolean;       // Whether this model is deprecated
  contextWindow?: number;     // Token context window size
}
```

### Main API Class

```typescript
export class SdkSamples {
  // Discovery methods - explore what's available with focused, extensible filters
  static getAvailableSDKs(): string[];
  static getAvailableLanguages(filters: LanguageFilters = {}): string[];
  static getAvailableApis(filters: ApiFilters = {}): string[];
  static getAvailableAuthTypes(filters: AuthTypeFilters = {}): string[];
  static getAvailableCapabilities(filters: CapabilityFilters = {}): string[];
  
  // Model capabilities methods - understand what models can do
  static getAvailableModels(filters: ModelFilters = {}): string[];
  static getModelCapabilities(modelName: string): ModelCapabilities | null;
  static getModelsWithCapability(capability: string, filters: ModelFilters = {}): string[];
  
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

// What APIs do the OpenAI SDK samples support?
const openaiApis = SdkSamples.getAvailableApis({ sdk: 'openai' });
// ['completions', 'responses', 'embeddings', 'images', 'audio']

// What model capabilities are available for completions API?
const capabilities = SdkSamples.getAvailableCapabilities({
  sdk: 'openai',
  api: 'completions'
});
// ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs']

// What languages support completions API?
const languages = SdkSamples.getAvailableLanguages({
  sdk: 'openai',
  api: 'completions'
});
// ['csharp', 'python', 'java', 'go', 'javascript']

// What auth types are available for C# completions?
const authTypes = SdkSamples.getAvailableAuthTypes({
  language: 'csharp',
  sdk: 'openai',
  api: 'completions'
});
// ['key', 'entra']
```

### Model Capabilities Pattern

```typescript
// What models are available?
const allModels = SdkSamples.getAvailableModels();
// ['gpt-4', 'gpt-4o', 'o1-mini', 'gpt-3.5-turbo', 'text-embedding-ada-002', 'dall-e-3', 'whisper-1']

// What models support the completions API?
const completionsModels = SdkSamples.getAvailableModels({ sdk: 'openai', api: 'completions' });
// ['gpt-4', 'gpt-4o', 'o1-mini', 'gpt-3.5-turbo']

// What models have vision capabilities?
const visionModels = SdkSamples.getModelsWithCapability('vision');
// ['gpt-4', 'gpt-4o']

// What models have reasoning capabilities for the completions API?
const reasoningModels = SdkSamples.getModelsWithCapability('reasoning', { 
  sdk: 'openai', 
  api: 'completions' 
});
// ['gpt-4', 'gpt-4o', 'o1-mini']

// Get detailed capabilities of a specific model
const gpt4Info = SdkSamples.getModelCapabilities('gpt-4');
if (gpt4Info) {
  console.log('GPT-4 supports:', gpt4Info.capabilities);
  // ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs']
  console.log('Available on APIs:', gpt4Info.supportedApis);
  // ['completions', 'responses']
  console.log('Context window:', gpt4Info.contextWindow);
  // 128000
}
```

### Sample Retrieval Pattern

```typescript
// Find Completions API samples with specific capabilities
const completionsSamples = SdkSamples.findSamples({
  sdk: 'openai',
  api: 'completions',
  language: 'csharp',
  authType: 'entra',
  modelCapabilities: ['streaming', 'tool-calling']
});

// Find Responses API samples with async style
const responsesSamples = SdkSamples.findSamples({
  sdk: 'openai',
  api: 'responses',
  language: 'python',
  apiStyle: 'async',
  modelCapabilities: ['conversation']
});

// Get a specific Responses API sample with vision capability
const sample = SdkSamples.getSamplesByQuery({
  sdk: 'openai',
  api: 'responses',
  language: 'java',
  authType: 'key',
  modelCapabilities: ['vision']
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

// New API equivalent with clear, extensible filters:
const capabilities = SdkSamples.getAvailableCapabilities({
  sdk: 'openai',
  api: 'completions'
});

const samples = SdkSamples.getSamplesByQuery({
  sdk: 'openai',
  api: 'completions',        // Completions API vs Responses API
  language: 'csharp',
  authType: 'entra',
  apiStyle: 'async',
  modelCapabilities: capabilities.length > 0 ? [capabilities[0]] : []
});

const codeSampleFile = samples[0]?.sourceCode;
const requirements = samples[0]?.metadata.dependencies;

// For Responses API samples:
const responsesSamples = SdkSamples.getSamplesByQuery({
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
  - Capabilities: streaming, conversation, vision, structured-outputs, tool-calling, reasoning
  - Use cases: Standard chat interactions, streaming responses, multi-turn conversations

- **`responses`**: New Responses API (`client.responses.create()`) 
  - Capabilities: conversation, vision, streaming, file-input
  - Use cases: Enhanced response handling, better conversation management, multi-modal inputs

- **`embeddings`**: Embeddings API (`client.embeddings.create()`)
  - Capabilities: async processing
  - Use cases: Text similarity, semantic search, vector operations

- **`images`**: Image Generation API (`client.images.generate()`)
  - Capabilities: async processing
  - Use cases: AI-generated images, creative content

- **`audio`**: Audio Processing API (`client.audio.transcriptions.create()`)
  - Capabilities: async processing
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
const projectsApis = SdkSamples.getAvailableApis({ sdk: 'projects' });
const projectsSample = SdkSamples.getSamplesByQuery({
  sdk: 'projects',
  api: 'deployments',
  language: 'python'
});
```

### Extensibility Examples
The filter-based approach makes future extensions seamless:

#### Adding New Filter Dimensions
```typescript
// Version 1.0 - Original interface
interface LanguageFilters {
  sdk?: string;
  api?: string;
}

// Version 1.1 - Add region and security level support
interface LanguageFilters {
  sdk?: string;
  api?: string;
  region?: string;          // ← New field, existing calls unaffected
  securityLevel?: string;   // ← Another new field
}

// All existing partner team code continues working unchanged:
const languages = SdkSamples.getAvailableLanguages({ 
  api: 'completions', 
  sdk: 'openai' 
});

// New capabilities become available naturally:
const enterpriseLanguages = SdkSamples.getAvailableLanguages({
  api: 'completions',
  sdk: 'openai',
  region: 'eastus',         // ← New usage
  securityLevel: 'enterprise' // ← New usage
});
```

#### Adding New Sample Types
```typescript
// When Projects SDK is added, no API changes needed:
const projectsApis = SdkSamples.getAvailableApis({ sdk: 'projects' });
const projectsLanguages = SdkSamples.getAvailableLanguages({ 
  sdk: 'projects',
  api: 'deployments' 
});

// Partner teams can immediately use new SDKs/APIs without API updates
```

## API Design Rationale

### Why Filter Objects Over Positional Parameters?

This API design uses filter objects (e.g., `{ api: 'completions', sdk: 'openai' }`) instead of positional parameters for several key reasons:

#### ✅ **Extensibility Without Breaking Changes**
```typescript
// Adding new filter dimensions is seamless:
// Version 1.0: getAvailableLanguages({ api: 'completions' })
// Version 1.1: getAvailableLanguages({ api: 'completions', region: 'eastus' })
// ↳ Existing code continues working unchanged
```

#### ✅ **Partner Team Developer Experience** 
```typescript
// Self-documenting and flexible parameter usage:
SdkSamples.getAvailableLanguages({ 
  sdk: 'openai',
  api: 'completions' 
  // ↳ Clear intent, can skip irrelevant parameters
});
```

#### ✅ **Maintainer Burden Minimization**
- Small consumer base (1-3 teams) makes coordination feasible
- Method-specific filter interfaces prevent parameter proliferation
- TypeScript provides compile-time safety for interface changes

### Alternative Considered: Faceted Search

A "flat" faceted approach was considered but seemed over-engineered for our context:
- **Small consumer base**: Don't need the flexibility for unknown use cases  
- **Infrequent updates**: Don't need to optimize for constant taxonomy changes
- **Known requirements**: Can design for specific partner team needs

The chosen approach optimizes for partner team productivity while maintaining reasonable maintainer burden.


