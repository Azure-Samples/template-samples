import { SdkSamples } from '../sdk-samples';
import { SampleMetadata, SampleQuery } from '../types';

describe('ResourceType Functionality', () => {
  describe('SampleMetadata with resourceType', () => {
    it('should include resourceType in all sample metadata', () => {
      const samples = SdkSamples.findSamples({});
      
      expect(samples.length).toBeGreaterThan(0);
      
      samples.forEach(sample => {
        expect(sample).toHaveProperty('resourceType');
        expect(typeof sample.resourceType).toBe('string');
        expect(sample.resourceType).toBeTruthy();
      });
    });

    it('should have correct resourceType values for OpenAI SDK samples', () => {
      const openAISamples = SdkSamples.findSamples({ sdk: 'openai' });
      
      expect(openAISamples.length).toBeGreaterThan(0);
      
      openAISamples.forEach(sample => {
        expect(sample.resourceType).toBe('openai');
      });
    });

    it('should include resourceType in getSample results', () => {
      const sample = SdkSamples.getSample('go-chat-completion-openai-completions-key-sync');
      
      expect(sample).toBeTruthy();
      expect(sample?.metadata).toHaveProperty('resourceType');
      expect(sample?.metadata.resourceType).toBe('openai');
    });

    it('should include resourceType in getSamplesByQuery results', () => {
      const samples = SdkSamples.getSamplesByQuery({ language: 'go' });
      
      expect(samples.length).toBeGreaterThan(0);
      
      samples.forEach(sample => {
        expect(sample.metadata).toHaveProperty('resourceType');
        expect(typeof sample.metadata.resourceType).toBe('string');
        expect(sample.metadata.resourceType).toBeTruthy();
      });
    });
  });

  describe('ResourceType Filtering', () => {
    it('should filter samples by resourceType', () => {
      const allSamples = SdkSamples.findSamples({});
      const openAISamples = SdkSamples.findSamples({ resourceType: 'openai' });
      
      expect(allSamples.length).toBeGreaterThanOrEqual(openAISamples.length);
      
      openAISamples.forEach(sample => {
        expect(sample.resourceType).toBe('openai');
      });
    });

    it('should return empty array for non-existent resourceType', () => {
      const nonExistentSamples = SdkSamples.findSamples({ resourceType: 'non-existent-resource' });
      
      expect(nonExistentSamples).toEqual([]);
    });

    it('should combine resourceType with other filters', () => {
      const filteredSamples = SdkSamples.findSamples({ 
        resourceType: 'openai',
        language: 'go',
        authType: 'key'
      });
      
      filteredSamples.forEach(sample => {
        expect(sample.resourceType).toBe('openai');
        expect(sample.language).toBe('go');
        expect(sample.authType).toBe('key');
      });
    });

    it('should work with getSamplesByQuery filtering', () => {
      const samples = SdkSamples.getSamplesByQuery({ resourceType: 'openai' });
      
      expect(samples.length).toBeGreaterThan(0);
      
      samples.forEach(sample => {
        expect(sample.metadata.resourceType).toBe('openai');
      });
    });
  });

  describe('ResourceType Discovery', () => {
    it('should list available resource types', () => {
      const resourceTypes = SdkSamples.getAvailableResourceTypes();
      
      expect(Array.isArray(resourceTypes)).toBe(true);
      expect(resourceTypes.length).toBeGreaterThan(0);
      expect(resourceTypes).toContain('openai');
    });

    it('should filter available resource types by SDK', () => {
      const openAIResourceTypes = SdkSamples.getAvailableResourceTypes({ sdk: 'openai' });
      
      expect(Array.isArray(openAIResourceTypes)).toBe(true);
      expect(openAIResourceTypes).toContain('openai');
    });

    it('should maintain backward compatibility with existing properties', () => {
      const samples = SdkSamples.findSamples({});
      
      samples.forEach(sample => {
        // Verify all existing properties still exist
        expect(sample).toHaveProperty('id');
        expect(sample).toHaveProperty('language');
        expect(sample).toHaveProperty('sdk');
        expect(sample).toHaveProperty('api');
        expect(sample).toHaveProperty('authType');
        expect(sample).toHaveProperty('dependencies');
        expect(sample).toHaveProperty('description');
        expect(sample).toHaveProperty('capability');
        expect(sample).toHaveProperty('scenario');
        
        // Verify optional properties are handled correctly
        expect(typeof sample.apiStyle).toBeDefined();
        expect(typeof sample.modelName).toBeDefined();
        expect(typeof sample.apiVersion).toBeDefined();
        expect(typeof sample.sdkVersion).toBeDefined();
        expect(typeof sample.resourceType).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined/null resourceType gracefully', () => {
      const query: SampleQuery = { resourceType: undefined };
      const samples = SdkSamples.findSamples(query);
      
      // Should return all samples when resourceType is undefined
      expect(samples.length).toBeGreaterThan(0);
    });

    it('should handle empty string resourceType', () => {
      const samples = SdkSamples.findSamples({ resourceType: '' });
      
      // Should return all samples when resourceType is empty string (treated as no filter)
      expect(samples.length).toBeGreaterThan(0);
    });

    it('should be case sensitive for resourceType filtering', () => {
      const lowerCaseSamples = SdkSamples.findSamples({ resourceType: 'openai' });
      const upperCaseSamples = SdkSamples.findSamples({ resourceType: 'OPENAI' });
      
      expect(lowerCaseSamples.length).toBeGreaterThan(0);
      expect(upperCaseSamples.length).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain proper TypeScript types', () => {
      const sample = SdkSamples.getSample('go-chat-completion-openai-completions-key-sync');
      
      if (sample) {
        // These should not cause TypeScript compilation errors
        const resourceType: string | undefined = sample.metadata.resourceType;
        expect(typeof resourceType).toBe('string');
      }
    });

    it('should accept resourceType in SampleQuery', () => {
      // This should not cause TypeScript compilation errors
      const query: SampleQuery = {
        resourceType: 'openai',
        language: 'go'
      };
      
      const samples = SdkSamples.findSamples(query);
      expect(Array.isArray(samples)).toBe(true);
    });
  });
});