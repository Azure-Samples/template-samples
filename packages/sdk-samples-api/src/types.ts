// Filter interfaces for discovery methods - focused and extensible
export interface ScenarioFilters {
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface LanguageFilters {
  scenario?: string;          // 'chat-completion', 'embeddings', 'responses-basic', etc.
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface ApiFilters {
  sdk?: string;               // 'openai', 'projects'
}

export interface AuthTypeFilters {
  scenario?: string;          // 'chat-completion', 'embeddings', 'responses-basic', etc.
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

export interface CapabilityFilters {
  scenario?: string;          // 'chat-completion', 'embeddings', 'responses-basic', etc.
  sdk?: string;               // 'openai', 'projects'
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
}

// Sample query interface for finding/retrieving samples
export interface SampleQuery {
  scenario?: string;           // 'chat-completion', 'embeddings', 'responses-basic', etc.
  language?: string;          // 'csharp', 'python', 'java', 'go', 'javascript'
  sdk?: string;               // 'openai', 'projects' (future)
  api?: string;               // 'completions', 'responses', 'embeddings', 'images', 'audio'
  authType?: string;          // 'entra', 'key'
  apiStyle?: string;          // 'sync', 'async'
  modelCapabilities?: string[]; // 'reasoning', 'tool-calling', 'streaming', 'vision'
  modelFamily?: string;       // 'gpt-4', 'o1-mini', etc.
}

export interface SampleMetadata {
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
