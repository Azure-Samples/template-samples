import { 
  SampleQuery, 
  SampleMetadata, 
  SampleContent, 
  Dependency,
  LanguageFilters,
  ApiFilters,
  AuthTypeFilters,
  CapabilityFilters,
  ModelFilters,
  ModelCapabilities,
  VersionFilters
} from './types';

// In-memory sample metadata store (will be populated from file system scan)
let sampleMetadataIndex: SampleMetadata[] = [];

// In-memory model capabilities store
let modelCapabilitiesIndex: ModelCapabilities[] = [];



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
      tags: ['chat', 'completion', 'go', 'basic'],
      apiVersion: '2024-06-01',
      sdkVersion: 'v1.1.0'
    },
    {
      id: 'go-chat-completion-async-openai-completions-key-async',
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
      tags: ['chat', 'completion', 'go', 'async'],
      apiVersion: '2024-06-01',
      sdkVersion: 'v1.1.0'
    },
    {
      id: 'go-chat-completion-streaming-openai-completions-key-sync',
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
      tags: ['chat', 'completion', 'go', 'streaming'],
      apiVersion: '2024-06-01',
      sdkVersion: 'v1.1.0'
    },
    {
      id: 'go-responses-basic-openai-responses-key-sync',
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
      tags: ['responses', 'go', 'basic'],
      apiVersion: '2024-06-01',
      sdkVersion: 'v1.1.0'
    },
    {
      id: 'go-embeddings-openai-embeddings-key-sync',
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
      tags: ['embeddings', 'go', 'vectors'],
      apiVersion: '2024-06-01',
      sdkVersion: 'v1.1.0'
    },
    {
      id: 'csharp-chat-completion-openai-completions-entra-sync',
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
      tags: ['chat', 'completion', 'csharp', 'entra'],
      apiVersion: '2024-06-01',
      sdkVersion: '2.1.0'
    }
  ];

  return mockSamples;
}

/**
 * Generate model capabilities data
 * This would typically be populated from a models registry or configuration
 */
function generateModelCapabilities(): ModelCapabilities[] {
  const mockModels: ModelCapabilities[] = [
    {
      modelName: 'gpt-4',
      sdk: 'openai',
      supportedApis: ['completions', 'responses'],
      capabilities: ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs'],
      description: 'Most capable GPT-4 model with vision and advanced reasoning',
      contextWindow: 128000
    },
    {
      modelName: 'gpt-4o',
      sdk: 'openai',
      supportedApis: ['completions', 'responses'],
      capabilities: ['reasoning', 'tool-calling', 'streaming', 'vision', 'structured-outputs'],
      description: 'GPT-4 Optimized for better performance and lower cost',
      contextWindow: 128000
    },
    {
      modelName: 'o1-mini',
      sdk: 'openai',
      supportedApis: ['completions'],
      capabilities: ['reasoning'],
      description: 'Reasoning-focused model optimized for complex problem solving',
      contextWindow: 65536
    },
    {
      modelName: 'gpt-3.5-turbo',
      sdk: 'openai',
      supportedApis: ['completions'],
      capabilities: ['tool-calling', 'streaming'],
      description: 'Fast and efficient model for most chat use cases',
      contextWindow: 4096
    },
    {
      modelName: 'text-embedding-ada-002',
      sdk: 'openai',
      supportedApis: ['embeddings'],
      capabilities: [],
      description: 'Most capable embedding model for text similarity and search',
      contextWindow: 8191
    },
    {
      modelName: 'dall-e-3',
      sdk: 'openai',
      supportedApis: ['images'],
      capabilities: [],
      description: 'Advanced image generation model',
      contextWindow: 4000
    },
    {
      modelName: 'whisper-1',
      sdk: 'openai',
      supportedApis: ['audio'],
      capabilities: [],
      description: 'Speech recognition model for audio transcription',
      contextWindow: 25000000 // 25MB file limit
    }
  ];

  return mockModels;
}

/**
 * Initialize the metadata index
 */
function initializeIndex() {
  if (sampleMetadataIndex.length === 0) {
    sampleMetadataIndex = generateSampleMetadata();
  }
  if (modelCapabilitiesIndex.length === 0) {
    modelCapabilitiesIndex = generateModelCapabilities();
  }
}

/**
 * Filter samples based on query parameters
 */
function filterSamples(samples: SampleMetadata[], query: Partial<SampleQuery>): SampleMetadata[] {
  return samples.filter(sample => {
    // Check each query parameter
    if (query.language && sample.language !== query.language) return false;
    if (query.sdk && sample.sdk !== query.sdk) return false;
    if (query.api && sample.api !== query.api) return false;
    if (query.authType && sample.authType !== query.authType) return false;
    if (query.apiStyle && sample.apiStyle !== query.apiStyle) return false;
    if (query.modelFamily && sample.modelFamily !== query.modelFamily) return false;
    if (query.apiVersion && sample.apiVersion !== query.apiVersion) return false;
    if (query.sdkVersion && sample.sdkVersion !== query.sdkVersion) return false;
    
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
    sourceCode: `// ${metadata.description}\n// Sample code for ${metadata.language} ${metadata.api} API\n// This would contain the actual source code`,
    projectFile: metadata.language === 'csharp' ? 'Sample.csproj' : 
                metadata.language === 'python' ? 'requirements.txt' :
                metadata.language === 'go' ? 'go.mod' : 
                metadata.language === 'java' ? 'pom.xml' : 'package.json',
    readme: `# ${metadata.api} API Sample\n\n${metadata.description}\n\n## Dependencies\n\n${metadata.dependencies.map(d => `- ${d.name}: ${d.version}`).join('\n')}`
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

  static getAvailableLanguages(filters: LanguageFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
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
    if (filters.language) query.language = filters.language;
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'authType', query);
  }

  static getAvailableCapabilities(filters: CapabilityFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    
    return getUniqueValues(sampleMetadataIndex, 'modelCapabilities', query);
  }

  static getAvailableApiVersions(filters: VersionFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    if (filters.language) query.language = filters.language;
    
    return getUniqueValues(sampleMetadataIndex, 'apiVersion', query);
  }

  static getAvailableSdkVersions(filters: VersionFilters = {}): string[] {
    initializeIndex();
    const query: Partial<SampleQuery> = {};
    if (filters.sdk) query.sdk = filters.sdk;
    if (filters.api) query.api = filters.api;
    if (filters.language) query.language = filters.language;
    
    return getUniqueValues(sampleMetadataIndex, 'sdkVersion', query);
  }

  // Model-related methods
  static getAvailableModels(filters: ModelFilters = {}): string[] {
    initializeIndex();
    let filteredModels = modelCapabilitiesIndex;
    
    if (filters.sdk) {
      filteredModels = filteredModels.filter(model => model.sdk === filters.sdk);
    }
    if (filters.api) {
      filteredModels = filteredModels.filter(model => model.supportedApis.includes(filters.api!));
    }
    
    return filteredModels.map(model => model.modelName).sort();
  }

  static getModelCapabilities(modelName: string): ModelCapabilities | null {
    initializeIndex();
    return modelCapabilitiesIndex.find(model => model.modelName === modelName) || null;
  }

  static getModelsWithCapability(capability: string, filters: ModelFilters = {}): string[] {
    initializeIndex();
    let filteredModels = modelCapabilitiesIndex.filter(model => 
      model.capabilities.includes(capability)
    );
    
    if (filters.sdk) {
      filteredModels = filteredModels.filter(model => model.sdk === filters.sdk);
    }
    if (filters.api) {
      filteredModels = filteredModels.filter(model => model.supportedApis.includes(filters.api!));
    }
    
    return filteredModels.map(model => model.modelName).sort();
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
