import { 
  SampleQuery, 
  SampleMetadata, 
  SampleContent, 
  Dependency,
  ScenarioFilters,
  LanguageFilters,
  ApiFilters,
  AuthTypeFilters,
  CapabilityFilters
} from './types';

// In-memory sample metadata store (will be populated from file system scan)
let sampleMetadataIndex: SampleMetadata[] = [];

/**
 * Parse scenario information from folder path
 */
function parseScenarioInfo(folderPath: string): {
  scenario: string;
  api: string;
  apiStyle: string;
  modelCapabilities: string[];
} {
  // Extract folder name from path
  const folderName = folderPath.split('/').pop() || folderPath;
  
  // Determine API type from scenario name
  let api = 'completions'; // default
  if (folderName.startsWith('responses-')) {
    api = 'responses';
  } else if (folderName.startsWith('embeddings')) {
    api = 'embeddings';
  } else if (folderName.startsWith('image-generation')) {
    api = 'images';
  } else if (folderName.startsWith('audio-transcription')) {
    api = 'audio';
  }

  // Determine API style
  const apiStyle = folderName.includes('-async') ? 'async' : 'sync';

  // Extract model capabilities
  const modelCapabilities: string[] = [];
  if (folderName.includes('streaming')) modelCapabilities.push('streaming');
  if (folderName.includes('conversation')) modelCapabilities.push('conversation');
  if (folderName.includes('vision') || folderName.includes('image')) modelCapabilities.push('vision');
  if (folderName.includes('structured-outputs')) modelCapabilities.push('structured-outputs');
  if (folderName.includes('tool-calling')) modelCapabilities.push('tool-calling');
  if (folderName.includes('reasoning')) modelCapabilities.push('reasoning');

  return {
    scenario: folderName,
    api,
    apiStyle,
    modelCapabilities
  };
}

/**
 * Determine SDK from folder structure
 */
function determineSdk(folderPath: string): string {
  if (folderPath.includes('/foundry/')) return 'projects';
  return 'openai'; // default
}

/**
 * Determine auth type from folder structure
 */
function determineAuthType(folderPath: string): string {
  if (folderPath.includes('/entra/') || folderPath.includes('entra-auth')) return 'entra';
  return 'key'; // default
}

/**
 * Extract model family from folder structure
 */
function extractModelFamily(folderPath: string): string | undefined {
  if (folderPath.includes('/gpt-5/')) return 'gpt-5';
  if (folderPath.includes('/o1-mini/')) return 'o1-mini';
  return undefined;
}

/**
 * Generate sample metadata from file system structure
 * This would typically be called during build time to create the index
 */
function generateSampleMetadata(basePath: string = '/workspaces/template-samples/generated-samples'): SampleMetadata[] {
  // In a real implementation, this would scan the file system
  // For now, we'll create some mock data based on the known structure
  const mockSamples: SampleMetadata[] = [
    {
      id: 'go-chat-completion-openai-completions-key-sync',
      scenario: 'chat-completion',
      language: 'go',
      sdk: 'openai',
      api: 'completions',
      authType: 'key',
      apiStyle: 'sync',
      modelCapabilities: [],
      dependencies: [
        { name: 'github.com/Azure/azure-sdk-for-go/sdk/azidentity', version: 'v1.10.0', type: 'package' },
        { name: 'github.com/openai/openai-go', version: 'v1.1.0', type: 'package' }
      ],
      description: 'Basic chat completion using Go SDK with key authentication',
      tags: ['chat', 'completion', 'go', 'basic']
    },
    {
      id: 'go-chat-completion-async-openai-completions-key-async',
      scenario: 'chat-completion',
      language: 'go',
      sdk: 'openai',
      api: 'completions',
      authType: 'key',
      apiStyle: 'async',
      modelCapabilities: [],
      dependencies: [
        { name: 'github.com/Azure/azure-sdk-for-go/sdk/azidentity', version: 'v1.10.0', type: 'package' },
        { name: 'github.com/openai/openai-go', version: 'v1.1.0', type: 'package' }
      ],
      description: 'Async chat completion using Go SDK with key authentication',
      tags: ['chat', 'completion', 'go', 'async']
    },
    {
      id: 'go-chat-completion-streaming-openai-completions-key-sync',
      scenario: 'chat-completion-streaming',
      language: 'go',
      sdk: 'openai',
      api: 'completions',
      authType: 'key',
      apiStyle: 'sync',
      modelCapabilities: ['streaming'],
      dependencies: [
        { name: 'github.com/Azure/azure-sdk-for-go/sdk/azidentity', version: 'v1.10.0', type: 'package' },
        { name: 'github.com/openai/openai-go', version: 'v1.1.0', type: 'package' }
      ],
      description: 'Streaming chat completion using Go SDK',
      tags: ['chat', 'completion', 'go', 'streaming']
    },
    {
      id: 'go-responses-basic-openai-responses-key-sync',
      scenario: 'responses-basic',
      language: 'go',
      sdk: 'openai',
      api: 'responses',
      authType: 'key',
      apiStyle: 'sync',
      modelCapabilities: [],
      dependencies: [
        { name: 'github.com/Azure/azure-sdk-for-go/sdk/azidentity', version: 'v1.10.0', type: 'package' },
        { name: 'github.com/openai/openai-go', version: 'v1.1.0', type: 'package' }
      ],
      description: 'Basic responses API usage with Go SDK',
      tags: ['responses', 'go', 'basic']
    },
    {
      id: 'go-embeddings-openai-embeddings-key-sync',
      scenario: 'embeddings',
      language: 'go',
      sdk: 'openai',
      api: 'embeddings',
      authType: 'key',
      apiStyle: 'sync',
      modelCapabilities: [],
      dependencies: [
        { name: 'github.com/Azure/azure-sdk-for-go/sdk/azidentity', version: 'v1.10.0', type: 'package' },
        { name: 'github.com/openai/openai-go', version: 'v1.1.0', type: 'package' }
      ],
      description: 'Text embeddings using Go SDK',
      tags: ['embeddings', 'go', 'vectors']
    },
    {
      id: 'csharp-chat-completion-openai-completions-entra-sync',
      scenario: 'chat-completion',
      language: 'csharp',
      sdk: 'openai',
      api: 'completions',
      authType: 'entra',
      apiStyle: 'sync',
      modelCapabilities: [],
      dependencies: [
        { name: 'OpenAI', version: '2.1.0', type: 'package' },
        { name: 'Azure.AI.OpenAI', version: '2.1.0', type: 'package' },
        { name: 'Azure.Identity', version: '1.14.0', type: 'package' }
      ],
      description: 'Chat completion using C# SDK with Entra ID authentication',
      tags: ['chat', 'completion', 'csharp', 'entra']
    }
  ];

  return mockSamples;
}

/**
 * Initialize the metadata index
 */
function initializeIndex() {
  if (sampleMetadataIndex.length === 0) {
    sampleMetadataIndex = generateSampleMetadata();
  }
}

/**
 * Filter samples based on query parameters
 */
function filterSamples(samples: SampleMetadata[], query: Partial<SampleQuery>): SampleMetadata[] {
  return samples.filter(sample => {
    // Check each query parameter
    if (query.scenario && sample.scenario !== query.scenario) return false;
    if (query.language && sample.language !== query.language) return false;
    if (query.sdk && sample.sdk !== query.sdk) return false;
    if (query.api && sample.api !== query.api) return false;
    if (query.authType && sample.authType !== query.authType) return false;
    if (query.apiStyle && sample.apiStyle !== query.apiStyle) return false;
    if (query.modelFamily && sample.modelFamily !== query.modelFamily) return false;
    
    // Check model capabilities (sample must have all requested capabilities)
    if (query.modelCapabilities && query.modelCapabilities.length > 0) {
      const hasAllCapabilities = query.modelCapabilities.every(capability => 
        sample.modelCapabilities.includes(capability)
      );
      if (!hasAllCapabilities) return false;
    }

    return true;
  });
}

/**
 * Get unique values for a specific field from filtered samples
 */
function getUniqueValues<K extends keyof SampleMetadata>(
  samples: SampleMetadata[], 
  field: K, 
  query: Partial<SampleQuery> = {}
): string[] {
  const filteredSamples = filterSamples(samples, query);
  const values = filteredSamples.map(sample => {
    const value = sample[field];
    if (Array.isArray(value)) {
      return value;
    }
    return value as string;
  }).flat().filter(Boolean);
  
  return Array.from(new Set(values)).sort();
}

/**
 * Load sample content (source code, project files, etc.)
 */
function loadSampleContent(metadata: SampleMetadata): SampleContent {
  // In a real implementation, this would read from the file system
  // For now, return mock content
  return {
    metadata,
    sourceCode: `// ${metadata.description}\n// Sample code for ${metadata.language} ${metadata.scenario}\n// This would contain the actual source code`,
    projectFile: metadata.language === 'csharp' ? 'Sample.csproj' : 
                metadata.language === 'python' ? 'requirements.txt' :
                metadata.language === 'go' ? 'go.mod' : 
                metadata.language === 'java' ? 'pom.xml' : 'package.json',
    readme: `# ${metadata.scenario}\n\n${metadata.description}\n\n## Dependencies\n\n${metadata.dependencies.map(d => `- ${d.name}: ${d.version}`).join('\n')}`
  };
}

/**
 * Main API class for discovering and retrieving Azure SDK samples
 */
export class SdkSamples {
  // Discovery methods - explore what's available with focused, extensible filters
  static getAvailableSDKs(): string[] {
    initializeIndex();
    return getUniqueValues(sampleMetadataIndex, 'sdk');
  }

  static getAvailableScenarios(filters: ScenarioFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'scenario', query);
  }

  static getAvailableLanguages(filters: LanguageFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.scenario) query.scenario = filters.scenario;
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'language', query);
  }

  static getAvailableApis(filters: ApiFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.sdk) query.sdk = filters.sdk;
    
    return getUniqueValues(sampleMetadataIndex, 'api', query);
  }

  static getAvailableAuthTypes(filters: AuthTypeFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.scenario) query.scenario = filters.scenario;
    if (filters.language) query.language = filters.language;
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'authType', query);
  }

  static getAvailableCapabilities(filters: CapabilityFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.scenario) query.scenario = filters.scenario;
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'modelCapabilities', query);
  }

  // Core query methods - retrieve samples
  static findSamples(query: Partial<SampleQuery>): SampleMetadata[] {
    initializeIndex();
    return filterSamples(sampleMetadataIndex, query);
  }

  static getSample(id: string): SampleContent | null {
    initializeIndex();
    const metadata = sampleMetadataIndex.find(sample => sample.id === id);
    if (!metadata) return null;
    
    return loadSampleContent(metadata);
  }

  static getSamplesByQuery(query: Partial<SampleQuery>): SampleContent[] {
    const metadataResults = this.findSamples(query);
    return metadataResults.map(metadata => loadSampleContent(metadata));
  }
}
