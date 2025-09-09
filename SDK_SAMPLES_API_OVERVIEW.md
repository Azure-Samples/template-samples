# Azure SDK Samples API - Partner Integration Guide

## Overview

The `@azure-foundry/sample-library` package provides programmatic access to pipeline-validated Azure SDK code samples. This TypeScript library enables dynamic discovery and retrieval of code samples across multiple languages, SDKs, APIs, and authentication methods.

**Package Details:**
- **Package Name**: `@azure-foundry/sample-library`
- **Version**: 1.0.0
- **Repository**: https://github.com/Azure-Samples/template-samples
- **Registry**: Azure DevOps NPM Feed (internal)

## Installation

```bash
npm install @azure-foundry/sample-library
```

## Core Usage Contract

The API is designed around two main patterns:

### 1. **Discovery Methods** - What's Available
Use focused filter objects to explore available options progressively.

### 2. **Query Methods** - Get Samples
Use flexible query interface to retrieve actual sample code and metadata.

---

## API Reference

### Discovery Methods

#### `getAvailableSDKs()`
Returns all available SDKs in the sample library.

```typescript
const sdks = SdkSamples.getAvailableSDKs();
// Returns: ['openai', 'projects']
```

#### `getAvailableLanguages(filters)`
Returns programming languages available for the given SDK/API combination.

```typescript
interface LanguageFilters {
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const languages = SdkSamples.getAvailableLanguages({
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['csharp', 'python', 'java', 'go', 'javascript']
```

#### `getAvailableApis(filters)`
Returns API types available for the given SDK.

```typescript
interface ApiFilters {
  sdk?: string;  // 'openai', 'projects'
}

const apis = SdkSamples.getAvailableApis({ sdk: 'openai' });
// Returns: ['completions', 'responses', 'embeddings', 'images', 'audio']
```

#### `getAvailableAuthTypes(filters)`
Returns authentication types available for the given combination.

```typescript
interface AuthTypeFilters {
  language?: string;  // 'csharp', 'python', etc.
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const authTypes = SdkSamples.getAvailableAuthTypes({
  language: 'csharp',
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['key', 'entra']
```

#### `getAvailableCapabilities(filters)`
Returns model capabilities available for the given combination.

```typescript
interface CapabilityFilters {
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const capabilities = SdkSamples.getAvailableCapabilities({
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['streaming', 'conversation', 'vision', 'structured-outputs', 'tool-calling', 'reasoning']
```

#### `getAvailableApiVersions(filters)`
Returns REST API versions available for the given combination.

```typescript
interface VersionFilters {
  sdk?: string;        // 'openai', 'projects'
  api?: string;        // 'completions', 'responses', etc.
  language?: string;   // 'csharp', 'python', etc.
}

const apiVersions = SdkSamples.getAvailableApiVersions({
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['2024-06-01', '2023-12-01-preview', '2023-10-01-preview']
```

#### `getAvailableSdkVersions(filters)`
Returns SDK library versions available for the given combination.

```typescript
const sdkVersions = SdkSamples.getAvailableSdkVersions({
  sdk: 'openai',
  language: 'csharp'
});
// Returns: ['2.1.0', '2.0.0', '1.11.0']
```

---

### Model Capabilities Methods

#### `getAvailableModels(filters)`
Returns available models for the given SDK and/or API.

```typescript
interface ModelFilters {
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const models = SdkSamples.getAvailableModels({
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['gpt-4', 'gpt-4o', 'o1-mini', 'gpt-3.5-turbo']
```

#### `getModelCapabilities(modelName)`
Returns detailed capabilities information for a specific model.

```typescript
const modelInfo = SdkSamples.getModelCapabilities('gpt-4');
// Returns: ModelCapabilities object with capabilities, supported APIs, etc.
```

#### `getModelsWithCapability(capability, filters)`
Returns models that support a specific capability.

```typescript
const visionModels = SdkSamples.getModelsWithCapability('vision', {
  sdk: 'openai'
});
// Returns: ['gpt-4', 'gpt-4o']
```

---

### Query Methods

#### `findSamples(query)`
Returns sample metadata matching the query criteria.

```typescript
interface SampleQuery {
  language?: string;          // 'csharp', 'python', etc.
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', etc.
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  modelCapabilities?: string[]; // ['streaming', 'vision', etc.]
  modelFamily?: string;       // 'gpt-4', 'o1-mini', etc.
  apiVersion?: string;        // '2024-06-01', '2023-12-01-preview', etc.
  sdkVersion?: string;        // SDK library version: '2.1.0', 'v1.1.0', etc.
}

const samples = SdkSamples.findSamples({
  api: 'completions',
  language: 'csharp',
  authType: 'entra'
});
// Returns: SampleMetadata[]
```

#### `getSample(id)`
Returns complete sample content by ID.

```typescript
const sample = SdkSamples.getSample('csharp-chat-completion-openai-completions-entra-sync');
// Returns: SampleContent | null
```

#### `getSamplesByQuery(query)`
Returns complete sample content for all samples matching the query.

```typescript
const samples = SdkSamples.getSamplesByQuery({
  language: 'python',
  api: 'embeddings'
});
// Returns: SampleContent[]
```

---

## Data Structures

### `SampleMetadata`
Core information about a code sample.

```typescript
interface SampleMetadata {
  id: string;                    // Unique identifier
  language: string;              // Programming language
  sdk: string;                   // SDK type
  api: string;                   // API category
  authType: string;              // Authentication method
  apiStyle: string;              // Sync/async style
  modelCapabilities: string[];   // Required model features
  modelFamily?: string;          // Specific model family
  dependencies: Dependency[];    // Required packages
  description: string;           // Human-readable description
  tags: string[];                // Searchable tags
  apiVersion?: string;           // REST API version used
  sdkVersion?: string;           // SDK library version used
}
```

### `SampleContent`
Complete sample with source code and project files.

```typescript
interface SampleContent {
  metadata: SampleMetadata;
  sourceCode: string;           // Main source code
  projectFile?: string;         // Project configuration (e.g., .csproj, requirements.txt)
  readme?: string;             // Documentation
  examples?: string[];         // Additional example files
}
```

### `Dependency`
Package dependency information.

```typescript
interface Dependency {
  name: string;                // Package name
  version: string;             // Version requirement
  type: 'package' | 'runtime' | 'tool';  // Dependency type
}
```

### `ModelCapabilities`
Model capabilities and metadata information.

```typescript
interface ModelCapabilities {
  modelName: string;          // Model identifier
  sdk: string;                // SDK that provides this model
  supportedApis: string[];    // APIs this model supports
  capabilities: string[];     // Model capabilities
  description?: string;       // Human-readable description
  deprecated?: boolean;       // Whether model is deprecated
  contextWindow?: number;     // Token context window size
}
```

---

## Usage Patterns

### 1. **Progressive Discovery** (Recommended for UI)
Build dynamic sample selectors by progressively filtering options.

```typescript
// Step 1: Let user choose SDK
const sdks = SdkSamples.getAvailableSDKs();

// Step 2: Show APIs for chosen SDK
const apis = SdkSamples.getAvailableApis({ sdk: selectedSdk });

// Step 3: Show languages for SDK + API combination
const languages = SdkSamples.getAvailableLanguages({
  sdk: selectedSdk,
  api: selectedApi
});

// Step 4: Show capabilities for the combination
const capabilities = SdkSamples.getAvailableCapabilities({
  sdk: selectedSdk,
  api: selectedApi
});

// Step 5: Get the actual samples
const samples = SdkSamples.getSamplesByQuery({
  language: selectedLanguage,
  sdk: selectedSdk,
  api: selectedApi,
  modelCapabilities: selectedCapabilities
});
```

### 2. **Direct Query** (For Known Requirements)
Directly retrieve samples when you know what you want.

```typescript
// Get all streaming samples
const streamingSamples = SdkSamples.findSamples({
  modelCapabilities: ['streaming']
});

// Get async Python samples with Entra auth
const pythonEntraSamples = SdkSamples.findSamples({
  language: 'python',
  authType: 'entra',
  apiStyle: 'async'
});

// Get vision-capable samples
const visionSamples = SdkSamples.findSamples({
  modelCapabilities: ['vision']
});
```

### 3. **Capability-Based Discovery**
Find samples that support specific model features.

```typescript
// Find all samples that support tool calling
const toolCallingSamples = SdkSamples.findSamples({
  modelCapabilities: ['tool-calling']
});

// Find samples with multiple capabilities
const advancedSamples = SdkSamples.findSamples({
  modelCapabilities: ['streaming', 'vision']
});
```

### 4. **Version-Based Discovery**
Find samples that use specific API or SDK versions.

```typescript
// Find samples using the latest REST API version
const latestApiSamples = SdkSamples.findSamples({
  apiVersion: '2024-06-01',
  sdk: 'openai'
});

// Find samples for a specific SDK version
const specificSdkSamples = SdkSamples.findSamples({
  sdkVersion: '2.1.0',
  language: 'csharp'
});

// Discover available API versions for a specific SDK
const apiVersions = SdkSamples.getAvailableApiVersions({
  sdk: 'openai',
  api: 'completions'
});

// Find samples compatible with your current SDK version
const compatibleSamples = SdkSamples.findSamples({
  language: 'python',
  sdkVersion: '1.35.0',
  api: 'completions'
});
```

### 4. **Model-Aware Sample Discovery**
Choose appropriate samples based on model capabilities.

```typescript
// Step 1: Find models that support vision
const visionModels = SdkSamples.getModelsWithCapability('vision');
// ['gpt-4', 'gpt-4o']

// Step 2: Get detailed capabilities for a specific model
const modelInfo = SdkSamples.getModelCapabilities('gpt-4');
console.log('GPT-4 capabilities:', modelInfo.capabilities);
// ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs']

// Step 3: Find samples that match the model's capabilities
const matchingSamples = SdkSamples.findSamples({
  sdk: 'openai',
  api: 'completions',
  language: 'python',
  modelCapabilities: ['vision', 'streaming'] // Use model's capabilities
});

// Step 4: Use the model with compatible samples
console.log(`Found ${matchingSamples.length} samples compatible with GPT-4`);
```

---

## Integration Example

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { SdkSamples } from '@azure-foundry/sample-library';

export function SampleExplorer() {
  const [selectedSdk, setSelectedSdk] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    if (selectedSdk) {
      // Update available languages when SDK changes
      const languages = SdkSamples.getAvailableLanguages({ sdk: selectedSdk });
      setAvailableLanguages(languages);
    }
  }, [selectedSdk]);

  const handleFindSamples = () => {
    const results = SdkSamples.findSamples({
      sdk: selectedSdk,
      language: selectedLanguage,
      // ... other filters
    });
    setSamples(results);
  };

  return (
    <div>
      <select onChange={(e) => setSelectedSdk(e.target.value)}>
        {SdkSamples.getAvailableSDKs().map(sdk => 
          <option key={sdk} value={sdk}>{sdk}</option>
        )}
      </select>
      {/* More UI components */}
    </div>
  );
}
```

---