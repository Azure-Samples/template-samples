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

#### `getAvailableScenarios(filters)`
Returns scenarios available for the given SDK and/or API.

```typescript
interface ScenarioFilters {
  sdk?: string;     // 'openai', 'projects'
  api?: string;     // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

const scenarios = SdkSamples.getAvailableScenarios({ 
  sdk: 'openai', 
  api: 'completions' 
});
// Returns: ['chat-completion', 'chat-completion-streaming', 'chat-completion-conversation', ...]
```

#### `getAvailableLanguages(filters)`
Returns programming languages available for the given scenario/SDK/API combination.

```typescript
interface LanguageFilters {
  scenario?: string;  // 'chat-completion', 'embeddings', etc.
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const languages = SdkSamples.getAvailableLanguages({
  scenario: 'chat-completion',
  sdk: 'openai'
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
  scenario?: string;  // 'chat-completion', etc.
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
  scenario?: string;  // 'chat-completion', etc.
  sdk?: string;       // 'openai', 'projects'
  api?: string;       // 'completions', 'responses', etc.
}

const capabilities = SdkSamples.getAvailableCapabilities({
  sdk: 'openai',
  api: 'completions'
});
// Returns: ['streaming', 'conversation', 'vision', 'structured-outputs', 'tool-calling', 'reasoning']
```

---

### Query Methods

#### `findSamples(query)`
Returns sample metadata matching the query criteria.

```typescript
interface SampleQuery {
  scenario?: string;           // 'chat-completion', etc.
  language?: string;          // 'csharp', 'python', etc.
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', etc.
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  modelCapabilities?: string[]; // ['streaming', 'vision', etc.]
  modelFamily?: string;       // 'gpt-4', 'o1-mini', etc.
}

const samples = SdkSamples.findSamples({
  scenario: 'chat-completion',
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
  scenario: string;              // Use case scenario
  language: string;              // Programming language
  sdk: string;                   // SDK type
  api: string;                   // API category
  authType: string;              // Authentication method
  apiStyle: string;              // Sync/async style
  modelCapabilities: string[];   // Required model features
  modelFamily?: string;          // Specific model family
  dependencies: Dependency[];    // Required packages
  description: string;           // Human-readable description
  tags: string[];               // Searchable tags
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

---

## Usage Patterns

### 1. **Progressive Discovery** (Recommended for UI)
Build dynamic sample selectors by progressively filtering options.

```typescript
// Step 1: Let user choose SDK
const sdks = SdkSamples.getAvailableSDKs();

// Step 2: Show APIs for chosen SDK
const apis = SdkSamples.getAvailableApis({ sdk: selectedSdk });

// Step 3: Show scenarios for SDK + API
const scenarios = SdkSamples.getAvailableScenarios({ 
  sdk: selectedSdk, 
  api: selectedApi 
});

// Step 4: Show languages for the combination
const languages = SdkSamples.getAvailableLanguages({
  scenario: selectedScenario,
  sdk: selectedSdk,
  api: selectedApi
});

// Step 5: Get the actual samples
const samples = SdkSamples.getSamplesByQuery({
  scenario: selectedScenario,
  language: selectedLanguage,
  sdk: selectedSdk,
  api: selectedApi
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