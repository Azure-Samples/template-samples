// Filter interfaces for discovery methods - focused and extensible
export interface LanguageFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface ApiFilters {
  sdk?: string;               // 'openai', 'projects'
}

export interface AuthTypeFilters {
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface CapabilityFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface VersionFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
}

// Model-related interfaces
export interface ModelFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface ModelCapabilities {
  modelName: string;          // 'gpt-4', 'gpt-4o', 'o1-mini', 'text-embedding-ada-002', etc.
  sdk: string;                // 'openai', 'projects'
  supportedApis: string[];    // APIs this model supports: ['completions', 'responses']
  capabilities: string[];     // Model capabilities: ['reasoning', 'tool-calling', 'streaming', 'vision']
  description?: string;       // Human-readable description of the model
  deprecated?: boolean;       // Whether this model is deprecated
  contextWindow?: number;     // Token context window size
}

// Sample query interface for finding/retrieving samples
export interface SampleQuery {
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects' (future)
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  capabilities?: string[];    // ['tool-calling', 'reasoning', 'streaming', 'vision']
  scenario?: string;          // 'chat-completions', 'embeddings', 'images', 'audio', 'vector-database'
  modelName?: string;         // 'gpt-4', 'gpt-4o', 'o1-mini', 'text-embedding-ada-002', etc.
  apiVersion?: string;        // '2024-06-01', '2023-12-01-preview', etc.
  sdkVersion?: string;        // SDK library version: '2.1.0', 'v1.1.0', etc.
  agentCapability?: boolean; // ???? for Hosted Agent or for Prompt Agent, etc.
}

export interface SampleMetadata {
  id: string;
  language: string;
  sdk: string;
  api: string;
  authType: string;
  apiStyle?: string;
  modelName?: string;
  dependencies: Dependency[];
  description: string;
  capability: string;   // one of: 'tool-calling', 'reasoning', 'streaming', 'vision'
  scenario: string;     // one of: 'chat-completions', 'embeddings', 'images', 'audio', 'vector-database'
  apiVersion?: string;
  sdkVersion?: string;
  resourceType?: string; // used to differentiate FDP and Hub samples
}

export interface Dependency {
  name: string;
  version: string;
  type: 'package' | 'runtime' | 'tool';
}

export interface SampleContent {
  metadata: SampleMetadata;
  sourceCode: string;
  projectFile?: string;       // .csproj, requirements.txt, package.json, etc.
  readme?: string;
  examples?: string[];
}
