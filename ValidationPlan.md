# Sample Validation Pipeline Implementation Plan

## Overview
This document outlines a phased approach for implementing a comprehensive validation pipeline for Azure OpenAI sample code generation. We'll start with **Option 3 (Static Analysis + Compilation)** and evolve to **Option 4 (Hybrid Validation Matrix)** for production-ready validation.

## Phase 1: Foundation - Static Analysis + Compilation Validation

### Objectives
- Ensure all generated samples compile successfully
- Validate basic code structure and dependency resolution
- Establish CI/CD pipeline foundation
- Enable local development validation

### Implementation Steps

#### 1.1 Language-Specific Validation Scripts

**C# Validation (`scripts/validate-csharp.sh`)**
```bash
#!/bin/bash
for sample_dir in generated-samples/csharp/*/; do
    echo "Validating C# sample: $sample_dir"
    cd "$sample_dir"
    
    # Restore dependencies
    dotnet restore
    
    # Build project
    dotnet build --no-restore --configuration Release
    
    # Basic static analysis
    dotnet format --verify-no-changes --verbosity diagnostic
    
    cd - > /dev/null
done
```

**Python Validation (`scripts/validate-python.sh`)**
```bash
#!/bin/bash
for sample_dir in generated-samples/python/*/; do
    echo "Validating Python sample: $sample_dir"
    cd "$sample_dir"
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Syntax check
    python -m py_compile *.py
    
    # Static analysis with pylint
    pylint *.py --errors-only
    
    # Type checking with mypy
    mypy *.py --ignore-missing-imports
    
    cd - > /dev/null
done
```

**JavaScript/Node Validation (`scripts/validate-javascript.sh`)**
```bash
#!/bin/bash
for sample_dir in generated-samples/javascript/*/; do
    echo "Validating JavaScript sample: $sample_dir"
    cd "$sample_dir"
    
    # Install dependencies
    npm install
    
    # Lint check
    npx eslint *.js
    
    # Type checking (if TypeScript)
    if [ -f "tsconfig.json" ]; then
        npx tsc --noEmit
    fi
    
    cd - > /dev/null
done
```

**Java Validation (`scripts/validate-java.sh`)**
```bash
#!/bin/bash
for sample_dir in generated-samples/java/*/; do
    echo "Validating Java sample: $sample_dir"
    cd "$sample_dir"
    
    # Compile with Maven
    mvn clean compile
    
    # Static analysis with SpotBugs
    mvn spotbugs:check
    
    cd - > /dev/null
done
```

**Go Validation (`scripts/validate-go.sh`)**
```bash
#!/bin/bash
for sample_dir in generated-samples/go/*/; do
    echo "Validating Go sample: $sample_dir"
    cd "$sample_dir"
    
    # Download dependencies
    go mod tidy
    
    # Build
    go build ./...
    
    # Static analysis
    go vet ./...
    golint ./...
    
    cd - > /dev/null
done
```

#### 1.2 Master Validation Script (`scripts/validate-samples.sh`)
```bash
#!/bin/bash
set -e

echo "=== Sample Validation Pipeline ==="

# Step 1: Regenerate samples using Caleuche
echo "Regenerating samples..."
caleuche generate-all

# Step 2: Run language-specific validations
echo "Running validation for all languages..."

./scripts/validate-csharp.sh
./scripts/validate-python.sh
./scripts/validate-javascript.sh
./scripts/validate-java.sh
./scripts/validate-go.sh

echo "=== Validation Complete ==="
```

#### 1.3 Azure Pipeline Configuration
```yaml
# ci/azure-pipelines.yml
trigger:
- main

variables:
  - name: BuildConfiguration
    value: 'Release'

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: GenerateSamples
  displayName: 'Generate Samples'
  jobs:
  - job: Generate
    steps:
    - task: UseNode@1
      inputs:
        version: '18.x'
    - script: npm install -g @caleuche/cli
      displayName: 'Install Caleuche CLI'
    - script: caleuche generate-all
      displayName: 'Generate samples from templates'

- stage: ValidateSamples
  displayName: 'Validate Generated Samples'
  dependsOn: GenerateSamples
  jobs:
  - job: ValidateParallel
    strategy:
      parallel: 5
      matrix:
        CSharp:
          LanguageToValidate: 'csharp'
        Python:
          LanguageToValidate: 'python'
        JavaScript:
          LanguageToValidate: 'javascript'
        Java:
          LanguageToValidate: 'java'
        Go:
          LanguageToValidate: 'go'
    steps:
    - template: templates/validate-language.yml
      parameters:
        language: $(LanguageToValidate)
```

#### 1.4 Language Validation Template (`ci/templates/validate-language.yml`)
```yaml
parameters:
- name: language
  type: string

steps:
- task: UseDotNet@2
  condition: eq('${{ parameters.language }}', 'csharp')
  inputs:
    version: '9.x'

- task: UsePythonVersion@0
  condition: eq('${{ parameters.language }}', 'python')
  inputs:
    versionSpec: '3.11'

- task: UseNode@1
  condition: eq('${{ parameters.language }}', 'javascript')
  inputs:
    version: '18.x'

- task: UseJavaVersion@0
  condition: eq('${{ parameters.language }}', 'java')
  inputs:
    versionSpec: '17'

- task: UseGo@0
  condition: eq('${{ parameters.language }}', 'go')
  inputs:
    version: '1.21'

- script: ./scripts/validate-${{ parameters.language }}.sh
  displayName: 'Validate ${{ parameters.language }} samples'
```

### Phase 1 Success Criteria
- [ ] All generated samples compile without errors
- [ ] Static analysis passes for all languages
- [ ] Pipeline runs in under 10 minutes
- [ ] Local validation works in dev container
- [ ] Clear error reporting for failures

## Phase 2: Enhanced Validation - Mock Server Integration

### Objectives
- Add runtime validation against mock Azure OpenAI endpoints
- Validate authentication patterns and error handling
- Test actual HTTP request/response cycles
- Maintain fast feedback cycles

### Implementation Steps

#### 2.1 Universal Mock Server (`scripts/universal-mock-server.js`)
```javascript
const express = require('express');
const app = express();

// Mock Azure OpenAI Chat Completion endpoint
app.post('/openai/deployments/:deployment/chat/completions', (req, res) => {
    const { deployment } = req.params;
    
    // Validate authentication header
    const auth = req.headers.authorization;
    if (!auth || (!auth.startsWith('Bearer ') && !auth.startsWith('api-key '))) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Mock successful response
    res.json({
        choices: [{
            message: {
                content: "Paris is the capital of France."
            }
        }]
    });
});

const server = app.listen(3000, () => {
    console.log('Mock Azure OpenAI server running on port 3000');
});

module.exports = server;
```

#### 2.2 Enhanced Validation Scripts
Each language validation script now includes:
- Starting mock server
- Running samples against mock endpoints
- Validating output contains expected content
- Stopping mock server

#### 2.3 Integration Test Framework
```bash
# scripts/integration-test.sh
#!/bin/bash

# Start mock server
node scripts/universal-mock-server.js &
MOCK_PID=$!

# Wait for server to start
sleep 2

# Set environment variables for samples
export AZURE_OPENAI_ENDPOINT="http://localhost:3000"
export AZURE_OPENAI_API_KEY="mock-api-key"
export AZURE_OPENAI_DEPLOYMENT="mock-deployment"

# Run samples and validate output
./scripts/run-samples-with-validation.sh

# Cleanup
kill $MOCK_PID
```

### Phase 2 Success Criteria
- [ ] Samples successfully make HTTP requests to mock server
- [ ] Authentication patterns work correctly
- [ ] Error handling validates properly
- [ ] Output validation confirms expected responses
- [ ] Integration tests complete in under 15 minutes

## Phase 3: Production Ready - Comprehensive Validation

### Objectives
- Add dependency vulnerability scanning
- Implement performance benchmarking
- Create detailed reporting and analytics
- Support multiple SDK versions
- Add quality gates and trend analysis

### Implementation Steps

#### 3.1 Dependency Security Scanning
```yaml
# Add to pipeline
- task: dependency-check@6
  inputs:
    projectName: 'azure-openai-samples'
    scanPath: 'generated-samples'
    format: 'ALL'
```

#### 3.2 Performance Benchmarking
- Measure sample execution time
- Track memory usage patterns
- Validate response time requirements
- Generate performance trend reports

#### 3.3 Quality Gates
```yaml
# Quality gate configuration
- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/test-results.xml'
    failTaskOnFailedTests: true

- task: PublishCodeCoverageResults@1
  inputs:
    summaryFileLocation: '**/coverage.xml'
    
# Quality gate thresholds
- script: |
    # Fail if compilation success rate < 95%
    # Fail if critical vulnerabilities found
    # Fail if performance regression > 20%
  displayName: 'Quality Gate Validation'
```

#### 3.4 Multi-Version SDK Testing
- Test against multiple SDK versions
- Validate backward compatibility
- Generate compatibility matrix reports

### Phase 3 Success Criteria
- [ ] Zero critical security vulnerabilities
- [ ] Performance within acceptable thresholds
- [ ] Compatibility across SDK versions
- [ ] Comprehensive reporting dashboard
- [ ] Automated quality gate enforcement

## Local Development Support

### Dev Container Configuration
The existing `.devcontainer/devcontainer.json` already includes:
- All language runtimes (C#, Python, Node.js, Java, Go)
- Caleuche CLI installation
- VS Code extensions

### Local Validation Commands
```bash
# Quick validation (Phase 1)
./scripts/validate-samples.sh

# Full validation with integration tests (Phase 2)
./scripts/integration-test.sh

# Performance validation (Phase 3)
./scripts/performance-test.sh
```

## Rollout Timeline

**Week 1-2: Phase 1 Foundation**
- Implement basic validation scripts
- Set up Azure Pipeline structure
- Test local dev container validation

**Week 3-4: Phase 2 Enhancement** 
- Build mock server
- Add integration testing
- Implement runtime validation

**Week 5-8: Phase 3 Production**
- Add security scanning
- Implement performance monitoring
- Create reporting dashboard
- Fine-tune quality gates

## Maintenance Considerations

- **Template Changes**: Validation scripts should be updated when new template patterns are added
- **SDK Updates**: Monitor for breaking changes in Azure OpenAI SDKs
- **Mock Server**: Keep mock responses aligned with actual Azure OpenAI API
- **Performance Baselines**: Regularly update performance thresholds as infrastructure changes

## Success Metrics

- **Reliability**: 99% sample compilation success rate
- **Speed**: Validation pipeline completes in under 20 minutes
- **Coverage**: All 5 languages validated with each run
- **Quality**: Zero critical issues in production samples
- **Developer Experience**: Local validation works seamlessly in dev container
