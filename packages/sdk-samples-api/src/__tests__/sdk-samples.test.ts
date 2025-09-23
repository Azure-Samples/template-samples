import { SdkSamples } from '../sdk-samples';
import { SampleMetadata, SampleQuery, SampleContent } from '../types';

describe('SdkSamples API', () => {
  describe('Discovery Methods', () => {
    it('should return available SDKs', () => {
      const sdks = SdkSamples.getAvailableSDKs();
      expect(Array.isArray(sdks)).toBe(true);
      expect(sdks.length).toBeGreaterThan(0);
      expect(sdks).toContain('openai');
    });

    it('should return available APIs', () => {
      const apis = SdkSamples.getAvailableApis({ sdk: 'openai' });
      expect(Array.isArray(apis)).toBe(true);
      expect(apis.length).toBeGreaterThan(0);
      expect(apis).toContain('completions');
    });

    it('should return available languages', () => {
      const languages = SdkSamples.getAvailableLanguages({ sdk: 'openai', api: 'completions' });
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('go');
      expect(languages).toContain('csharp');
    });

    it('should return available auth types', () => {
      const authTypes = SdkSamples.getAvailableAuthTypes();
      expect(Array.isArray(authTypes)).toBe(true);
      expect(authTypes.length).toBeGreaterThan(0);
      expect(authTypes).toContain('key');
      expect(authTypes).toContain('entra');
    });

    it('should return available capabilities', () => {
      const capabilities = SdkSamples.getAvailableCapabilities({ sdk: 'openai', api: 'completions' });
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('Sample Finding', () => {
    it('should find samples with basic query', () => {
      const samples = SdkSamples.findSamples({ language: 'go' });
      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBeGreaterThan(0);
      
      samples.forEach(sample => {
        expect(sample.language).toBe('go');
      });
    });

    it('should find samples with multiple filters', () => {
      const samples = SdkSamples.findSamples({ 
        language: 'go',
        sdk: 'openai',
        authType: 'key'
      });
      
      samples.forEach(sample => {
        expect(sample.language).toBe('go');
        expect(sample.sdk).toBe('openai');
        expect(sample.authType).toBe('key');
      });
    });

    it('should return empty array for non-matching filters', () => {
      const samples = SdkSamples.findSamples({ language: 'non-existent-language' });
      expect(samples).toEqual([]);
    });

    it('should handle empty query', () => {
      const samples = SdkSamples.findSamples({});
      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBeGreaterThan(0);
    });
  });

  describe('Sample Retrieval', () => {
    it('should get a specific sample by ID', () => {
      const sample = SdkSamples.getSample('go-chat-completion-openai-completions-key-sync');
      
      expect(sample).toBeTruthy();
      expect(sample?.metadata.id).toBe('go-chat-completion-openai-completions-key-sync');
      expect(sample?.sourceCode).toBeTruthy();
    });

    it('should return null for non-existent sample ID', () => {
      const sample = SdkSamples.getSample('non-existent-sample-id');
      expect(sample).toBeNull();
    });

    it('should get samples by query', () => {
      const samples = SdkSamples.getSamplesByQuery({ language: 'csharp' });
      
      expect(Array.isArray(samples)).toBe(true);
      samples.forEach(sample => {
        expect(sample.metadata.language).toBe('csharp');
        expect(sample.sourceCode).toBeTruthy();
      });
    });
  });

  describe('Sample Metadata Structure', () => {
    it('should have required metadata properties', () => {
      const samples = SdkSamples.findSamples({});
      expect(samples.length).toBeGreaterThan(0);
      
      samples.forEach(sample => {
        expect(sample).toHaveProperty('id');
        expect(sample).toHaveProperty('language');
        expect(sample).toHaveProperty('sdk');
        expect(sample).toHaveProperty('api');
        expect(sample).toHaveProperty('authType');
        expect(sample).toHaveProperty('dependencies');
        expect(sample).toHaveProperty('description');
        expect(sample).toHaveProperty('capability');
        expect(sample).toHaveProperty('scenario');
        
        expect(typeof sample.id).toBe('string');
        expect(typeof sample.language).toBe('string');
        expect(typeof sample.sdk).toBe('string');
        expect(typeof sample.api).toBe('string');
        expect(typeof sample.authType).toBe('string');
        expect(Array.isArray(sample.dependencies)).toBe(true);
        expect(typeof sample.description).toBe('string');
        expect(typeof sample.capability).toBe('string');
        expect(typeof sample.scenario).toBe('string');
      });
    });

    it('should have valid dependency structure', () => {
      const samples = SdkSamples.findSamples({});
      
      samples.forEach(sample => {
        sample.dependencies.forEach(dep => {
          expect(dep).toHaveProperty('name');
          expect(dep).toHaveProperty('version');
          expect(dep).toHaveProperty('type');
          
          expect(typeof dep.name).toBe('string');
          expect(typeof dep.version).toBe('string');
          expect(['package', 'runtime', 'tool']).toContain(dep.type);
        });
      });
    });
  });

  describe('Model Capabilities', () => {
    it('should return available models', () => {
      const models = SdkSamples.getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it('should return models with specific capability', () => {
      const visionModels = SdkSamples.getModelsWithCapability('vision');
      expect(Array.isArray(visionModels)).toBe(true);
      
      visionModels.forEach(model => {
        const capabilities = SdkSamples.getModelCapabilities(model);
        expect(capabilities?.capabilities).toContain('vision');
      });
    });

    it('should get model capabilities', () => {
      const gpt4Capabilities = SdkSamples.getModelCapabilities('gpt-4');
      
      expect(gpt4Capabilities).toBeTruthy();
      expect(gpt4Capabilities?.modelName).toBe('gpt-4');
      expect(Array.isArray(gpt4Capabilities?.capabilities)).toBe(true);
      expect(Array.isArray(gpt4Capabilities?.supportedApis)).toBe(true);
    });
  });

  describe('Version Filtering', () => {
    it('should filter by API version', () => {
      const samples = SdkSamples.findSamples({ apiVersion: '2024-06-01' });
      
      samples.forEach(sample => {
        expect(sample.apiVersion).toBe('2024-06-01');
      });
    });

    it('should filter by SDK version', () => {
      const samples = SdkSamples.findSamples({ sdkVersion: '2.1.0' });
      
      samples.forEach(sample => {
        expect(sample.sdkVersion).toBe('2.1.0');
      });
    });
  });

  describe('Capability Filtering', () => {
    it('should filter by single capability', () => {
      const samples = SdkSamples.findSamples({ capabilities: ['streaming'] });
      
      samples.forEach(sample => {
        expect(sample.capability).toBe('streaming');
      });
    });

    it('should filter by multiple capabilities', () => {
      const samples = SdkSamples.findSamples({ capabilities: ['reasoning', 'streaming'] });
      
      samples.forEach(sample => {
        expect(['reasoning', 'streaming']).toContain(sample.capability);
      });
    });
  });
});