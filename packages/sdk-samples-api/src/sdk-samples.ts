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
import * as fs from 'fs';
import * as path from 'path';

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
 * Extract model name from folder structure
 */
function extractModelName(folderPath: string): string | undefined {
  if (folderPath.includes('/gpt-5/')) return 'gpt-5';
  if (folderPath.includes('/o1-mini/')) return 'o1-mini';
  return undefined;
}

/**
 * Parse dependencies from project files
 */
function parseDependencies(sampleDir: string, language: string): Dependency[] {
  const dependencies: Dependency[] = [];
  
  // TODO: Implement dependency parsing for different languages
  // - C#: Parse .csproj files for PackageReference elements
  // - Go: Parse go.mod files for require statements
  // - Python: Parse requirements.txt files
  // - Java: Parse pom.xml files for dependencies
  // - JavaScript/TypeScript: Parse package.json files
  
  return dependencies;
}

/**
 * Infer API style from directory structure or code
 */
function inferApiStyle(sampleDir: string, language: string): 'sync' | 'async' | undefined {
  // Check directory name first
  const dirName = path.basename(sampleDir).toLowerCase();
  if (dirName.includes('async')) return 'async';

  return undefined;
}

/**
 * Infer model capabilities from code analysis
 */
function inferModelCapabilities(sampleDir: string, language: string): string[] {
  const capabilities: string[] = [];
  
  // TODO: Implement model capabilities inference
  // This is where model catalog lookup could be done to determine capabilities
  // based on the model name extracted from the path or code analysis.
  // Needs more design work to determine the best approach.
  
  return []; // TBD - return empty array for now
}

/**
 * Generate description from directory path and code
 */
function generateDescription(
  modelName: string, 
  api: string, 
  language: string, 
  authType: string, 
  apiStyle?: string,
  capabilities?: string[]
): string {
  const authDesc = authType === 'entra' ? 'Entra ID authentication' : 'API key authentication';
  const styleDesc = apiStyle === 'async' ? 'asynchronous' : 'synchronous';
  const capDesc = capabilities && capabilities.length > 0 ? ` with ${capabilities.join(', ')}` : '';

  return `${styleDesc.charAt(0).toUpperCase() + styleDesc.slice(1)} ${api} using ${language.toUpperCase()} SDK with ${authDesc}${capDesc}`;
}

/**
 * Check if directory contains sample files
 */
function hasSampleFiles(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    const sampleExtensions = ['.cs', '.go', '.py', '.java', '.js', '.ts'];
    return files.some(file => 
      sampleExtensions.some(ext => file.endsWith(ext)) ||
      file.endsWith('.csproj') ||
      file.endsWith('go.mod') ||
      file.endsWith('requirements.txt') ||
      file.endsWith('pom.xml') ||
      file.endsWith('package.json')
    );
  } catch {
    return false;
  }
}

/**
 * Extract API version from dependencies
 */
function extractApiVersionFromDependencies(dependencies: Dependency[]): string | undefined {
  // Look for version patterns in dependency names or versions
  for (const dep of dependencies) {
    if (dep.name.toLowerCase().includes('openai')) {
      // Could extract version info or map to known API versions
      return '2024-06-01'; // or parse from version
    }
  }
  return undefined;
}

/**
 * Extract SDK version from dependencies
 */
function extractSdkVersionFromDependencies(dependencies: Dependency[], sdk: string): string | undefined {
  const sdkMappings: { [key: string]: string[] } = {
    openai: ['OpenAI', 'Azure.AI.OpenAI', 'openai-go', 'openai'],
    projects: ['Azure.AI.Projects', 'azure-ai-projects']
  };
  
  const relevantPackages = sdkMappings[sdk] || [];
  
  for (const dep of dependencies) {
    if (relevantPackages.some(pkg => dep.name.includes(pkg))) {
      return dep.version;
    }
  }
  
  return undefined;
}

function getDefaultBasePath(): string {
  // Check environment variable first
  if (process.env.SAMPLES_BASE_PATH) {
    return process.env.SAMPLES_BASE_PATH;
  }
  
  // Fall back to current working directory
  return path.join(process.cwd(), 'samples');
}

function generateSampleMetadata(basePath?: string): SampleMetadata[] {
  const samplesPath = basePath || getDefaultBasePath();
  const samples: SampleMetadata[] = [];

  if (!fs.existsSync(samplesPath)) {
    console.warn(`Base path does not exist: ${samplesPath}, falling back to mock data`);
    return generateMockSampleMetadata();
  }
  
  // Walk the directory structure: <model>/<api>/<sdk>/<language>/<auth-type>/
  const walkDirectory = (currentPath: string, pathParts: string[] = []) => {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const newPath = path.join(currentPath, entry.name);
          const newPathParts = [...pathParts, entry.name];
          
          // Check if we've reached a sample directory (has source files)
          if (hasSampleFiles(newPath)) {
            // Parse the path: [model, api, sdk, language, authType]
            if (newPathParts.length >= 5) {
              const [modelName, api, sdk, language, authType] = newPathParts;
              
              // Parse dependencies from project files
              const dependencies = parseDependencies(newPath, language);
              
              // Infer additional metadata
              const apiStyle = 'ignore-TBD'; // inferApiStyle(newPath, language);
              const modelCapabilities = inferModelCapabilities(newPath, language);
              
              // Extract versions
              const apiVersion = extractApiVersionFromDependencies(dependencies) || 'v1';
              const sdkVersion = extractSdkVersionFromDependencies(dependencies, sdk) || '0.0.0';
              
              // Generate tags
              const tags = [
                api.replace('-', ' '),
                language,
                authType,
                ...modelCapabilities
              ].filter(Boolean);
              
              // Create sample metadata
              const sample: SampleMetadata = {
                id: `${language}-${api}-${sdk}-${authType}-${modelName}`.replace(/[^a-z0-9-]/gi, '-'),
                language,
                sdk,
                api,
                authType,
                apiStyle,
                modelName,
                modelCapabilities,
                dependencies,
                description: generateDescription(modelName, api, language, authType, apiStyle, modelCapabilities),
                tags,
                apiVersion,
                sdkVersion
              };
              
              samples.push(sample);
            }
          } else {
            // Continue walking deeper
            walkDirectory(newPath, newPathParts);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${currentPath}:`, error);
    }
  };

  walkDirectory(samplesPath);

  // If no samples found, fall back to mock data for backward compatibility
  if (samples.length === 0) {
    console.warn('No samples found in file system, falling back to mock data');
    return generateMockSampleMetadata();
  }
  
  return samples;
}

/**
 * Generate mock sample metadata for backward compatibility and testing
 */
function generateMockSampleMetadata(): SampleMetadata[] {
  const mockSamples: SampleMetadata[] = [
    {
      id: 'go-chat-completion-openai-completions-key-sync',
      language: 'go',
      sdk: 'openai',
      api: 'completions',
      authType: 'key',
      apiStyle: 'sync',
      modelName: 'gpt-4o',
      modelCapabilities: ['reasoning', 'tool-calling'],
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
      modelCapabilities: ['reasoning', 'tool-calling'],
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
      id: 'csharp-chat-completion-openai-completions-entra-sync',
      language: 'csharp',
      sdk: 'openai',
      api: 'completions',
      authType: 'entra',
      apiStyle: 'sync',
      modelCapabilities: ['reasoning', 'tool-calling'],
      dependencies: [
        { name: 'OpenAI', version: '2.1.0', type: 'package' },
        { name: 'Azure.AI.OpenAI', version: '2.1.0', type: 'package' },
        { name: 'Azure.Identity', version: '1.14.0', type: 'package' }
      ],
      description: 'Chat completion using C# SDK with Entra ID authentication',
      tags: ['chat', 'completion', 'csharp', 'entra'],
      apiVersion: 'v1',
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
 * Filter samples based on query parameters
 */
function filterSamples(samples: SampleMetadata[], query: Partial<SampleQuery>): SampleMetadata[] {
  // Handle null or undefined query
  if (!query) query = {};
  
  return samples.filter(sample => {
    // Check each query parameter
    if (query.language && sample.language !== query.language) return false;
    if (query.sdk && sample.sdk !== query.sdk) return false;
    if (query.api && sample.api !== query.api) return false;
    if (query.authType && sample.authType !== query.authType) return false;
    if (query.apiStyle && sample.apiStyle !== query.apiStyle) return false;
    if (query.modelName && sample.modelName !== query.modelName) return false;
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
  // Try to find the actual sample directory based on the metadata
  const basePath = path.join(__dirname, '..', '..', 'samples');
  const samplePath = path.join(basePath, metadata.modelName || 'unknown', metadata.api, metadata.sdk, metadata.language, metadata.authType);
  
  let sourceCode = '';
  let projectFile = '';
  
  try {
    if (fs.existsSync(samplePath)) {
      // Read source code
      const extensions: { [key: string]: string[] } = {
        csharp: ['.cs'],
        go: ['.go'],
        python: ['.py'],
        java: ['.java'],
        javascript: ['.js', '.ts']
      };
      
      const sourceExts = extensions[metadata.language] || ['.txt'];
      for (const ext of sourceExts) {
        const files = fs.readdirSync(samplePath).filter(f => f.endsWith(ext));
        if (files.length > 0) {
          sourceCode = fs.readFileSync(path.join(samplePath, files[0]), 'utf8');
          break;
        }
      }
      
      // Read project file
      const projectFiles: { [key: string]: string } = {
        csharp: 'Sample.csproj',
        python: 'requirements.txt',
        go: 'go.mod',
        java: 'pom.xml',
        javascript: 'package.json'
      };
      
      const projectFileName = projectFiles[metadata.language];
      const projectFilePath = path.join(samplePath, projectFileName);
      if (fs.existsSync(projectFilePath)) {
        projectFile = fs.readFileSync(projectFilePath, 'utf8');
      }
    }
  } catch (error) {
    console.warn(`Failed to load sample content for ${metadata.id}:`, error);
  }
  
  // Fall back to generated content if files not found
  if (!sourceCode) {
    sourceCode = `// ${metadata.description}\n// Sample code for ${metadata.language} ${metadata.api} API\n// This would contain the actual source code`;
  }
  
  if (!projectFile) {
    const projectFileName = metadata.language === 'csharp' ? 'Sample.csproj' : 
                           metadata.language === 'python' ? 'requirements.txt' :
                           metadata.language === 'go' ? 'go.mod' : 
                           metadata.language === 'java' ? 'pom.xml' : 'package.json';
    projectFile = `# Generated ${projectFileName}\n# Dependencies would be listed here`;
  }
  
  const readme = `# ${metadata.api} API Sample\n\n${metadata.description}\n\n## Dependencies\n\n${metadata.dependencies.map(d => `- ${d.name}: ${d.version}`).join('\n')}`;
  
  return {
    metadata,
    sourceCode,
    projectFile,
    readme
  };
}

/**
 * Initialize the metadata index with current configuration
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
