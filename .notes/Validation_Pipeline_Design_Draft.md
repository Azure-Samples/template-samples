# Validation Pipeline Design Draft

**Last Updated**: October 2, 2025  
**Status**: Draft - Iteration v1  
**Purpose**: Comprehensive design for service validation pipeline in template-samples repository

---

## Executive Summary

This document outlines the design for a robust validation pipeline that makes service calls to validate generated Azure OpenAI SDK samples. The system addresses the challenge of validating large numbers of sample variations across multiple languages, models, and scenarios while maintaining efficiency and reliability.

---

## Current State Analysis

### Existing Infrastructure
- **Generation Pipeline**: Caleuche CLI processes EJS templates → `generated-samples/`
- **Validation Scripts**: `validate-samples.sh`, `validate-single-sample.sh`
- **Configuration System**: Language defaults + per-sample overrides
- **Validation Steps**: `preBuildSteps`, `buildSteps`, `executeSteps`, `validateSteps`

### Current Limitations
- **Service validation is optional**: Pipeline supports service calls via `$(VALIDATE_WITH_SERVICE)` variable, but lacks structured success criteria and retry logic
- **Basic sample selection**: Change detection works well for modified samples, but lacks tiered validation approach for different scenarios (essential vs comprehensive)
- **Limited validation tracking**: Validation results are collected as artifacts, but no persistent manifest system for tracking validation history, success rates, or environmental context
- **No intelligent scope analysis**: All changed samples are validated equally, regardless of impact scope or validation complexity
- **Minimal service validation framework**: While service calls can be made, there's no structured validation of response content, performance thresholds, or functional correctness

---

## Design Objectives

1. **Customer Code Correctness**: Ensure samples work when customers copy/paste and execute them
2. **Integration Validation**: Catch SDK compatibility issues, missing properties, and auth problems
3. **Model Compatibility**: Validate samples work across supported models (limited subset initially)
4. **Authentication Pattern Coverage**: Test both API key and token credential authentication methods
5. **Scalable Sample Selection**: Smart algorithms to determine which samples require validation
6. **Change Impact Analysis**: Intelligent detection of what needs re-validation
7. **Validation Tracking**: Persistent storage of validation results and metadata

---

## Core Design Components

### 1. Sample Selection Strategy

#### Tiered Validation Approach
```yaml
# .notes/validation-tiers.yaml (PROPOSED)
validation_tiers:
  essential:
    description: "Core functionality samples - always validate on changes"
    samples:
      - chat-completion/*/basic
      - embeddings/*/basic  
      - image-generation/*/basic
    
  extended:
    description: "Common scenarios - validate on relevant changes"
    samples:
      - chat-completion/*/streaming
      - chat-completion/*/conversation
      - responses-*/*
    
  comprehensive:
    description: "Full feature coverage - validate on releases"
    samples:
      - "**/*async*"
      - "**/structured-outputs*"
      - "**/agents*"

execution_matrix:
  pull_request: ["essential"]
  weekly_schedule: ["essential", "extended"]
  release: ["essential", "extended", "comprehensive"]
```

#### Capability-Based Selection
```yaml
# .notes/validation-matrix.yaml (PROPOSED)
baseline_capabilities:
  authentication_methods:
    - token_credentials: "DefaultAzureCredential patterns"
    - api_key: "Direct key authentication"
  
  response_patterns:
    - synchronous: "Standard request/response"
    - asynchronous: "Async/await patterns"
    - streaming: "Real-time response streaming"
  
  input_modalities:
    - text_only: "Standard text input"
    - multimodal: "Text + image input"
    - file_input: "File-based input"

  languages: ["csharp", "python", "javascript", "go", "java"]
  
  models: 
    chat: ["gpt-4", "gpt-4-turbo"]
    embeddings: ["text-embedding-ada-002"]
    images: ["dall-e-3"]
```

### 2. Enhanced Change Detection

#### Smart Impact Analysis
```bash
# Enhanced validation trigger logic (PROPOSED)
#!/bin/bash
# scripts/analyze-validation-scope.sh

analyze_change_impact() {
    local changed_files=$(git diff --name-only HEAD~1)
    
    # Direct sample template changes
    local template_changes=$(echo "$changed_files" | grep "^samples/")
    
    # Shared template changes
    local shared_template_changes=$(echo "$changed_files" | grep "^sample-templates/")
    
    # Configuration changes
    local config_changes=$(echo "$changed_files" | grep -E "(input-data\.yaml|foundry-samples\.yaml|validation-config)")
    
    # SDK/dependency changes
    local dependency_changes=$(echo "$changed_files" | grep -E "(package\.json|requirements\.txt|\.csproj|go\.mod)")
    
    # Calculate scope
    if [[ -n "$config_changes" || -n "$dependency_changes" ]]; then
        echo "scope=comprehensive reason=infrastructure_change"
    elif [[ -n "$shared_template_changes" ]]; then
        calculate_shared_template_impact "$shared_template_changes"
    elif [[ -n "$template_changes" ]]; then
        echo "scope=targeted samples=$(extract_affected_samples "$template_changes")"
    else
        echo "scope=none reason=no_relevant_changes"
    fi
}

calculate_shared_template_impact() {
    # Analyze which samples use shared templates
    local affected_samples=$(grep -r "include.*$1" samples/ | cut -d: -f1 | sort -u)
    echo "scope=extended samples=$affected_samples reason=shared_template_change"
}
```

### 3. Service Validation Framework

#### Customer Code Correctness Validation Criteria
```yaml
# .notes/customer-code-validation-criteria.yaml (PROPOSED)
validation_criteria:
  execution_validation:
    success_criteria:
      # Primary: Did the code execute without errors?
      http_codes: [200, 201, 202]
      retry_codes: [429, 500, 502, 503, 504]  # Transient service issues
      max_retries: 3
      retry_delay_seconds: 2
      timeout_seconds: 30
      
    failure_indicators:
      # These indicate customer-facing code problems
      client_errors: [400, 401, 403, 422]  # Bad request, auth issues, validation errors
      error_patterns:
        - "required property"
        - "missing parameter"
        - "invalid model"
        - "unsupported parameter"
        
  integration_validation:
    # Validate basic service integration without caring about response quality
    chat_completion:
      success_indicators:
        - "HTTP 2xx response received"
        - "Response is valid JSON"
        - "No client error codes (4xx)"
      failure_indicators:
        - "Missing required ChatCompletionOptions properties"
        - "Invalid model specified"
        - "Authentication failure"
    
    embeddings:
      success_indicators:
        - "HTTP 2xx response received"
        - "Response contains data array"
        - "No client error codes (4xx)"
      failure_indicators:
        - "Invalid input format"
        - "Model not available for embeddings"
        
    image_generation:
      success_indicators:
        - "HTTP 2xx response received"  
        - "Response contains image data or URL"
        - "No client error codes (4xx)"
      failure_indicators:
        - "Invalid image generation parameters"
        - "Unsupported model for image generation"

  authentication_pattern_validation:
    # Test both auth methods customers will use
    api_key_auth:
      required: true
      validation: "Sample works with API key authentication"
      
    token_credential_auth:
      required: true  
      validation: "Sample works with DefaultAzureCredential"

  model_compatibility_validation:
    # Limited model subset to start
    baseline_models:
      chat: ["gpt-4", "gpt-4-turbo"]  # Start with 2 models
      embeddings: ["text-embedding-ada-002"]
      images: ["dall-e-3"]
    
    validation_approach:
      - "Test sample against each applicable model"
      - "Ensure no model-specific parameter issues"
      - "Validate request structure compatibility"
```

#### Customer Code Validation Engine
```python
# scripts/customer_code_validation_engine.py (PROPOSED STRUCTURE)
class CustomerCodeValidationEngine:
    def __init__(self, criteria_config, environment_config):
        self.criteria = criteria_config
        self.environment = environment_config
    
    def validate_sample(self, sample_path, validation_tier="essential"):
        """Validate that customer can successfully copy/paste and run this code"""
        result = ValidationResult(sample_path)
        
        try:
            # 1. Compilation validation - does the code compile?
            if not self.compile_sample(sample_path):
                result.add_failure("compilation", "Code will not compile for customers")
                return result
            
            # 2. Authentication pattern validation
            auth_result = self.validate_authentication_patterns(sample_path)
            result.merge(auth_result)
            
            # 3. Model compatibility validation (if tier requires it)
            if self.should_test_model_compatibility(validation_tier):
                model_result = self.validate_model_compatibility(sample_path)
                result.merge(model_result)
            
            # 4. Integration validation - does the code execute successfully?
            if self.should_make_service_calls(validation_tier):
                integration_result = self.validate_integration(sample_path)
                result.merge(integration_result)
            
        except Exception as e:
            result.add_failure("execution", str(e))
        
        return result
    
    def validate_authentication_patterns(self, sample_path):
        """Test both API key and token credential authentication"""
        result = ValidationResult(sample_path, "authentication")
        
        # Test with API key auth
        api_key_result = self.execute_with_auth_pattern(sample_path, "api_key")
        if not api_key_result.success:
            result.add_failure("api_key_auth", "Sample fails with API key authentication")
        
        # Test with token credentials  
        token_result = self.execute_with_auth_pattern(sample_path, "token_credential")
        if not token_result.success:
            result.add_failure("token_auth", "Sample fails with DefaultAzureCredential")
            
        return result
    
    def validate_model_compatibility(self, sample_path):
        """Test sample against multiple models to catch compatibility issues"""
        result = ValidationResult(sample_path, "model_compatibility")
        
        applicable_models = self.get_applicable_models(sample_path)
        
        for model in applicable_models:
            model_result = self.execute_with_model(sample_path, model)
            if not model_result.success:
                result.add_failure(f"model_{model}", f"Sample fails with model {model}")
                
        return result
    
    def validate_integration(self, sample_path):
        """Execute sample and validate it works (not response quality)"""
        result = ValidationResult(sample_path, "integration")
        
        execution_result = self.execute_sample(sample_path)
        
        # Check for customer-facing code issues
        if execution_result.has_client_errors():
            result.add_failure("client_error", 
                f"Sample produces client error: {execution_result.error_details}")
        
        if execution_result.has_integration_issues():
            result.add_failure("integration_error",
                f"Sample has integration issues: {execution_result.integration_details}")
        
        # Success = HTTP 2xx and no client errors (we don't care about response content)
        if execution_result.is_successful_execution():
            result.mark_success("Sample executes successfully for customers")
            
        return result
```

### 4. Validation Tracking System

#### Validation Manifest Structure
```json
// .notes/validation-manifest-schema.json (PROPOSED)
{
  "schema_version": "1.0",
  "last_updated": "2025-10-02T10:30:00Z",
  "validation_run_id": "vr_20251002_103000",
  "trigger": {
    "type": "pull_request",
    "scope": "essential",
    "commit_sha": "abc123def456",
    "changed_files": ["samples/chat-completion/csharp/sample.cs.template"]
  },
  "samples": {
    "csharp/chat-completion/basic": {
      "validation_status": "success",
      "last_validated": "2025-10-02T10:30:00Z",
      "validation_hash": "sha256:def456...",
      "environment_snapshot": {
        "sdk_version": "Azure.AI.OpenAI 2.1.0",
        "dotnet_version": "8.0.100",
        "model_used": "gpt-4-0613",
        "endpoint_region": "eastus2"
      },
      "validation_results": {
        "compilation": {"status": "success", "duration_ms": 2500},
        "service_call": {
          "status": "success", 
          "duration_ms": 1250,
          "http_status": 200,
          "response_size_bytes": 156,
          "token_usage": {"prompt": 12, "completion": 33, "total": 45}
        },
        "performance": {"status": "success", "duration_ms": 1250}
      },
      "artifacts": {
        "compilation_log": "logs/vr_20251002_103000/csharp-chat-completion-basic-compile.log",
        "execution_log": "logs/vr_20251002_103000/csharp-chat-completion-basic-execute.log",
        "service_response": "responses/vr_20251002_103000/csharp-chat-completion-basic.json"
      }
    }
  },
  "summary": {
    "total_samples": 15,
    "successful": 14,
    "failed": 1,
    "duration_total_ms": 45000,
    "service_calls_made": 14,
    "total_tokens_consumed": 630
  }
}
```

#### Validation History Tracking
```bash
# Directory structure for validation artifacts (PROPOSED)
.validation-results/
├── manifests/
│   ├── vr_20251002_103000.json
│   ├── vr_20251001_142000.json
│   └── latest.json -> vr_20251002_103000.json
├── logs/
│   └── vr_20251002_103000/
│       ├── csharp-chat-completion-basic-compile.log
│       ├── csharp-chat-completion-basic-execute.log
│       └── validation-summary.log
└── responses/
    └── vr_20251002_103000/
        ├── csharp-chat-completion-basic.json
        └── python-embeddings-basic.json
```

### 5. Execution Control Interface

#### Enhanced CLI Interface
```bash
# scripts/validate-samples.sh (ENHANCED VERSION)
#!/bin/bash

# Usage examples:
# ./scripts/validate-samples.sh --scope=essential --service-calls=true
# ./scripts/validate-samples.sh --scope=changed --languages=csharp,python --dry-run
# ./scripts/validate-samples.sh --scope=targeted --samples="chat-completion/*" --models=gpt-4

SCOPE="essential"           # essential|extended|comprehensive|changed|targeted|full
LANGUAGES=""               # comma-separated: csharp,python,javascript,go,java
SERVICE_CALLS="true"       # true|false
MODELS=""                  # comma-separated: gpt-4,gpt-4-turbo,dall-e-3
DRY_RUN="false"           # true|false
SAMPLES=""                 # glob pattern for targeted validation
PARALLEL="true"            # true|false
MAX_PARALLEL=4            # number of parallel validation processes

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --scope=*)
            SCOPE="${1#*=}"
            shift
            ;;
        --languages=*)
            LANGUAGES="${1#*=}"
            shift
            ;;
        --service-calls=*)
            SERVICE_CALLS="${1#*=}"
            shift
            ;;
        --models=*)
            MODELS="${1#*=}"
            shift
            ;;
        --dry-run*)
            DRY_RUN="true"
            shift
            ;;
        --samples=*)
            SAMPLES="${1#*=}"
            shift
            ;;
        --parallel=*)
            PARALLEL="${1#*=}"
            shift
            ;;
        --max-parallel=*)
            MAX_PARALLEL="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

validate_samples() {
    echo "=== Validation Pipeline Starting ==="
    echo "Scope: $SCOPE"
    echo "Languages: ${LANGUAGES:-all}"
    echo "Service Calls: $SERVICE_CALLS"
    echo "Models: ${MODELS:-default}"
    echo "Dry Run: $DRY_RUN"
    echo "=================================="
    
    # 1. Analyze scope and determine sample list
    local sample_list=$(analyze_validation_scope "$SCOPE" "$LANGUAGES" "$SAMPLES")
    
    # 2. Create validation run manifest
    local run_id=$(create_validation_run "$sample_list")
    
    # 3. Execute validation for each sample
    if [[ "$PARALLEL" == "true" ]]; then
        validate_samples_parallel "$sample_list" "$run_id"
    else
        validate_samples_sequential "$sample_list" "$run_id"
    fi
    
    # 4. Generate summary report
    generate_validation_report "$run_id"
}
```

### 6. Pipeline Integration

#### Integration with Existing Azure DevOps Pipeline

Your existing `ci/azure-pipelines.yml` already provides a strong foundation with:
- ✅ **Change Detection**: Smart diff-based sample detection per language
- ✅ **Parallel Validation**: Conditional jobs per language (C#, Python, Java, Go, JavaScript)
- ✅ **Credential Management**: Azure CLI integration for service credentials
- ✅ **Artifact Management**: Generated samples and validation results
- ✅ **Configuration Flexibility**: Template config selection via parameters

#### Enhanced Pipeline Integration Strategy

**Phase 1: Extend Existing Pipeline** (Minimal Changes)
```yaml
# Additions to ci/azure-pipelines.yml parameters section
parameters:
  - name: templateConfigInput
    # ... existing parameter ...
  
  # NEW: Validation tier selection
  - name: validationTier
    displayName: 'Validation Tier'
    type: string
    default: 'essential'
    values:
      - 'essential'
      - 'extended' 
      - 'comprehensive'
  
  # NEW: Service validation toggle  
  - name: enableServiceValidation
    displayName: 'Enable Service Validation'
    type: boolean
    default: true

variables:
  # ... existing variables ...
  
  # NEW: Validation configuration
  - name: VALIDATION_TIER
    value: ${{ parameters.validationTier }}
  - name: ENABLE_SERVICE_VALIDATION  
    value: ${{ parameters.enableServiceValidation }}
```

**Phase 2: Enhanced Change Detection**
```yaml
# Enhanced DetectChanges job in ci/azure-pipelines.yml
  - job: DetectChanges
    displayName: 'Detect Changed Samples and Analyze Validation Scope'
    dependsOn: GenerateSamples
    steps:
    - checkout: self
      fetchDepth: 0
    - download: current
      artifact: GeneratedSamples
      displayName: 'Download generated samples'

    - script: |
        mkdir -p ./generated-samples/
        cp -r "$(Pipeline.Workspace)/GeneratedSamples/"* ./generated-samples/
        echo "Copied downloaded samples to ./generated-samples/"
      displayName: 'Copy sample artifacts to workspace'

    - script: |
        # ENHANCED: Use new validation scope analysis
        chmod +x scripts/analyze-validation-scope.sh
        
        # Analyze what validation scope is needed based on changes
        SCOPE_ANALYSIS=$(./scripts/analyze-validation-scope.sh \
          --trigger=pipeline \
          --tier=$(VALIDATION_TIER) \
          --base-ref=main)
        
        echo "Scope Analysis Result: $SCOPE_ANALYSIS"
        
        # Extract scope and reasoning
        VALIDATION_SCOPE=$(echo "$SCOPE_ANALYSIS" | grep "scope=" | cut -d= -f2 | cut -d' ' -f1)
        VALIDATION_REASON=$(echo "$SCOPE_ANALYSIS" | grep "reason=" | cut -d= -f2)
        
        echo "##vso[task.setvariable variable=validationScope;isOutput=true]$VALIDATION_SCOPE"
        echo "##vso[task.setvariable variable=validationReason;isOutput=true]$VALIDATION_REASON"
        
        # Existing change detection logic...
        (git diff --name-only main; git ls-files --others --exclude-standard) | grep "^generated-samples/" | xargs -n1 dirname | sort | uniq > changed_samples.txt || touch changed_samples.txt
        
        # NEW: Filter samples based on validation tier if needed
        if [[ "$VALIDATION_SCOPE" != "comprehensive" ]]; then
            ./scripts/filter-samples-by-tier.sh \
              --tier=$(VALIDATION_TIER) \
              --scope=$VALIDATION_SCOPE \
              --input=changed_samples.txt \
              --output=filtered_samples.txt
            mv filtered_samples.txt changed_samples.txt
        fi
        
        echo "Final sample list for validation:"
        cat changed_samples.txt

        # Split by language (existing logic)
        grep "/csharp/" changed_samples.txt > changed_csharp.txt || touch changed_csharp.txt
        # ... rest of existing logic ...
        
      displayName: 'Analyze validation scope and detect changes'
      name: 'detectChanges'
```

**Phase 3: Enhanced Validation Jobs**
```yaml
# Enhanced validation job template (example for C#)
  - job: ValidateCSharp
    displayName: 'Validate C# Samples'
    dependsOn: 
    - DetectChanges
    - PublishConfigs  
    - GenerateSamples
    condition: eq(dependencies.DetectChanges.outputs['detectChanges.hasCSharpChanges'], 'true')
    variables:
      # Existing variables...
      azureOpenAIEndpoint: $[ dependencies.GenerateSamples.outputs['configureCredentials.AZURE_OPENAI_ENDPOINT'] ]
      azureOpenAIApiKey: $[ dependencies.GenerateSamples.outputs['configureCredentials.AZURE_OPENAI_API_KEY'] ]
      azureOpenAIDeployment: $[ dependencies.GenerateSamples.outputs['configureCredentials.AZURE_OPENAI_DEPLOYMENT'] ]
      
      # NEW: Validation context variables
      validationScope: $[ dependencies.DetectChanges.outputs['detectChanges.validationScope'] ]
      validationReason: $[ dependencies.DetectChanges.outputs['detectChanges.validationReason'] ]
      
    steps:
    - checkout: self
    - task: UseDotNet@2
      inputs:
        version: $(dotnetVersion)

    # ... existing artifact download steps ...

    - script: |
        chmod +x scripts/*.sh
        
        # NEW: Enhanced validation with service validation support
        export AZURE_OPENAI_ENDPOINT=$(azureOpenAIEndpoint)
        export AZURE_OPENAI_API_KEY=$(azureOpenAIApiKey)
        export AZURE_OPENAI_DEPLOYMENT=$(azureOpenAIDeployment)
        
        # NEW: Create validation run manifest
        VALIDATION_RUN_ID=$(./scripts/create-validation-run.sh \
          --language=csharp \
          --scope=$(validationScope) \
          --trigger=pipeline \
          --samples-file="$(Pipeline.Workspace)/ChangedCSharp/changed_csharp.txt")
        
        echo "Created validation run: $VALIDATION_RUN_ID"
        echo "##vso[task.setvariable variable=validationRunId]$VALIDATION_RUN_ID"

        # Enhanced validation call
        ./scripts/validate-samples.sh \
          --language=csharp \
          --samples-file="$(Pipeline.Workspace)/ChangedCSharp/changed_csharp.txt" \
          --service-validation=$(ENABLE_SERVICE_VALIDATION) \
          --validation-tier=$(VALIDATION_TIER) \
          --run-id=$VALIDATION_RUN_ID

      displayName: 'Validate C# samples with enhanced pipeline'

    - script: |
        # NEW: Enhanced artifact collection including validation manifest
        mkdir -p validation-results
        
        # Existing log collection
        cp validation-*.log validation-results/ 2>/dev/null || echo "No validation log files found"
        
        # NEW: Collect validation manifest and artifacts
        if [[ -n "$(validationRunId)" ]]; then
            cp -r .validation-results/manifests/$(validationRunId).json validation-results/ 2>/dev/null || true
            cp -r .validation-results/logs/$(validationRunId)/ validation-results/ 2>/dev/null || true
            cp -r .validation-results/responses/$(validationRunId)/ validation-results/ 2>/dev/null || true
        fi
        
      displayName: 'Collect enhanced validation artifacts'
      condition: always()

    - publish: validation-results/
      artifact: CSharpResults
      condition: always()
```

**Phase 4: Validation Summary and Reporting**
```yaml
# NEW: Validation summary job
  - job: ValidationSummary
    displayName: 'Generate Validation Summary'
    dependsOn: 
    - DetectChanges
    - ValidateCSharp
    - ValidatePython
    - ValidateJava
    - ValidateJavascript
    - ValidateGo
    condition: always()
    
    steps:
    - checkout: self
    
    # Download all validation results
    - download: current
      artifact: CSharpResults
      condition: eq(dependencies.DetectChanges.outputs['detectChanges.hasCSharpChanges'], 'true')
      
    # ... download other language results ...
    
    - script: |
        chmod +x scripts/generate-validation-summary.sh
        
        # Generate comprehensive validation report
        ./scripts/generate-validation-summary.sh \
          --artifacts-path="$(Pipeline.Workspace)" \
          --output-path="validation-summary" \
          --format=json,html,markdown
        
      displayName: 'Generate validation summary report'
    
    - publish: validation-summary/
      artifact: ValidationSummary
      displayName: 'Publish validation summary'
```

#### Integration Benefits

**Leverages Existing Strengths**:
- ✅ Keeps your proven change detection logic
- ✅ Maintains parallel execution per language
- ✅ Preserves Azure CLI credential integration  
- ✅ Uses existing artifact pipeline

**Adds Enhanced Capabilities**:
- 🆕 **Tiered Validation**: Essential/Extended/Comprehensive scopes
- 🆕 **Service Call Validation**: Actual Azure OpenAI service integration
- 🆕 **Validation Tracking**: Persistent manifests and history
- 🆕 **Smart Scope Analysis**: Intelligent validation scope determination
- 🆕 **Enhanced Reporting**: Comprehensive validation summaries

#### Migration Path

**Week 1-2**: Implement enhanced scripts while keeping existing pipeline unchanged
- Create `analyze-validation-scope.sh`
- Create `create-validation-run.sh` 
- Create `generate-validation-summary.sh`
- Create validation tier configurations

**Week 3**: Integrate enhanced change detection 
- Update `DetectChanges` job with scope analysis
- Add validation tier parameters
- Test with existing validation logic as fallback

**Week 4**: Enhance validation jobs
- Update language validation jobs with enhanced artifact collection
- Add service validation capabilities
- Maintain backward compatibility

**Week 5**: Full integration
- Enable service validation by default
- Add validation summary job
- Complete testing and documentation

---

## Implementation Timeline - Ignite 2025 Ready

**Deadline**: November 7, 2025 (5 weeks from start)
**Constraint**: Must deliver quality content for Ignite 2025 conference

### ESSENTIAL - Pre-Ignite (Weeks 1-4, Complete by Oct 31)
**Objective**: Ensure customer samples work correctly for Ignite demos and content

**Week 1 (Oct 6-12) - Foundation**
- [ ] **CRITICAL**: Enhance existing `validate-samples.sh` to make service calls
- [ ] **CRITICAL**: Add basic success/failure detection (HTTP 2xx = success, 4xx = code problem)
- [ ] **CRITICAL**: Test authentication patterns (API key + token credential)
- [ ] Update Azure DevOps pipeline to use enhanced validation

**Week 2 (Oct 13-17) - Integration**
- [ ] **CRITICAL**: Integrate service validation into existing pipeline
- [ ] **CRITICAL**: Test with current samples to catch any issues
- [ ] Add retry logic for transient service issues (5xx errors)
- [ ] Basic logging and error reporting

**Week 3 (Oct 20-24) - Validation & Polish**
- [ ] **CRITICAL**: Full validation run on all Ignite-bound samples
- [ ] Fix any discovered customer code correctness issues
- [ ] Validate both authentication patterns work
- [ ] Documentation for the validation process

**Week 4 (Oct 27-Oct 31) - Ignite Readiness**
- [ ] **CRITICAL**: Final validation of all samples going to Ignite
- [ ] **CRITICAL**: Ensure samples work with target model deployments
- [ ] Buffer time for any last-minute fixes
- [ ] Validation sign-off for Ignite content

**Pre-Ignite Deliverables (Must Have)**:
- Enhanced `validate-samples.sh` with service call validation
- Updated Azure DevOps pipeline with service validation enabled
- All Ignite samples validated as customer-ready
- Basic error detection and retry logic

### DEFERRED - Post-Ignite (After Nov 7)
**Objective**: Add intelligence and sophistication after conference delivery

**Post-Ignite Phase 1 (Nov 11-22) - Intelligence**
- [ ] Validation tier system (essential/extended/comprehensive)
- [ ] Enhanced change detection and scope analysis
- [ ] Model compatibility testing framework
- [ ] Validation manifest and tracking system

**Post-Ignite Phase 2 (Nov 25-Dec 6) - Optimization**
- [ ] Advanced reporting and dashboards
- [ ] Performance optimization and parallel execution
- [ ] Historical validation tracking
- [ ] Enhanced error categorization and analysis

**Post-Ignite Deliverables (Nice to Have)**:
- Tiered validation system
- Comprehensive validation tracking
- Advanced reporting capabilities
- Performance-optimized pipeline

### Minimal Viable Product (MVP) for Ignite

**Core Functionality**:
1. ✅ **Service Call Execution**: Samples actually call Azure OpenAI service
2. ✅ **Success Detection**: HTTP 2xx = success, 4xx = customer code problem  
3. ✅ **Auth Pattern Testing**: Both API key and DefaultAzureCredential work
4. ✅ **Basic Retry Logic**: Retry 5xx errors, fail fast on 4xx errors
5. ✅ **Pipeline Integration**: Works with existing Azure DevOps change detection

**What We're NOT Building for Ignite**:
- ❌ Complex validation tiers or scope analysis
- ❌ Multi-model compatibility testing  
- ❌ Sophisticated validation tracking/manifests
- ❌ Advanced reporting or dashboards
- ❌ Performance optimization or parallel execution

### Risk Mitigation for Tight Timeline

**Week 1 Success Criteria**:
- Enhanced validation script successfully calls service
- Can detect and report basic success/failure
- Runs in existing pipeline without breaking current functionality

**Early Warning System**:
- Daily validation runs starting Week 2
- Any sample failures addressed immediately
- No new failures introduced by pipeline changes

**Fallback Plan**:
- If service validation fails, fall back to compilation-only validation
- Manual spot-checking of critical Ignite samples
- Emergency sample fixes during Week 4 buffer time

---

## Open Questions & Decisions Needed
Items with a `Decision` entry are finalized.

### 1. Service Call Quotas & Costs
**Question**: How do we manage Azure OpenAI service costs and quotas during validation?

**Options**:
- A) Use dedicated validation service instances with quotas
- B) Implement token budgeting per validation run
- C) Use mock responses for most validations, real calls for subset

**Recommendation**: Option B with A - dedicated instances with budget controls

### 2. Sample Versioning Strategy
**Question**: How do we handle versioning of validated samples in relation to SDK versions?

**Options**:
- A) Tag samples with SDK versions in validation manifest
- B) Separate validation branches for different SDK versions
- C) Matrix validation across multiple SDK versions

**Decision**: Option A 

### 3. Customer Code Correctness vs Service Issues
**Question**: How do we distinguish between customer-facing code problems vs transient service issues?

**Options**:
- A) Retry with exponential backoff for 5xx errors, fail immediately on 4xx client errors
- B) Categorize failures: client errors (4xx) = code problem, server errors (5xx) = service issue
- C) Allow manual override for known service outages

**Recommendation**: Option B with A - client errors indicate sample problems, server errors get retries

### 4. Multi-Model Testing Strategy  
**Question**: How do we test model compatibility without exploding infrastructure costs?

**Options**:
- A) Start with 2-model subset (gpt-5, gpt-4o) and expand gradually
- B) Matrix testing only for "essential" tier samples  
- C) Model-specific sample variants rather than testing same sample across models

**Recommendation**: Option A with B - limited model set for essential samples initially

### 5. Authentication Pattern Testing
**Question**: How do we efficiently test both API key and token credential patterns?

**Options**:
- A) Run each sample twice with different auth configurations
- B) Template variants that generate separate auth-specific samples
- C) Runtime auth switching within single sample execution

**Decision**: Option A

### 6. Validation Result Storage
**Question**: Where and how long should we store validation results and artifacts?

**Options**:
- A) Git LFS for artifacts, JSON manifests in main repo
- B) External storage (Azure Blob) with manifest references
- C) Hybrid: Recent results in repo, archived results in ADO

**Decision**: Option A

---

## Success Metrics

### Customer Code Correctness
- **Target**: 100% of published samples execute successfully when copied by customers  
- **Measure**: Zero customer-reported "this sample doesn't work" issues

### Validation Coverage
- **Target**: 90% of essential samples validated with service calls on every PR
- **Measure**: Percentage of samples with recent successful execution validation

### Client Error Detection
- **Target**: Catch 100% of client errors (4xx) that would affect customers
- **Measure**: Ratio of validation runs that catch missing properties, auth issues, parameter problems

### Authentication Pattern Coverage  
- **Target**: All samples validated with both API key and token credential auth
- **Measure**: Percentage of samples successfully tested with both authentication methods

### Model Compatibility (Phase 2)
- **Target**: Essential samples validated against baseline model set
- **Measure**: Percentage of samples that work across supported models

### Pipeline Performance
- **Target**: PR validation completes within 15 minutes (increased from 10 due to service calls)
- **Measure**: Average validation pipeline execution time

---

## Next Steps

1. **Review and Refine**: Team review of this design draft
2. **Prototype Core Components**: Build minimal viable validation framework
3. **Pilot Testing**: Test with subset of samples and languages
4. **Iterative Implementation**: Implement in phases with regular feedback
5. **Documentation**: Create operational runbooks and troubleshooting guides

---

## Ignite 2025 Delivery Plan - Action Items

### Immediate Next Steps (Start Oct 6)

**Day 1-2: Assessment & Planning**
- [ ] Inventory all samples targeted for Ignite 2025 content
- [ ] Review current `validate-samples.sh` script capabilities
- [ ] Identify Azure OpenAI service instances available for validation
- [ ] Set up test credentials (both API key and service principal)

**Day 3-5: Core Implementation**
- [ ] Enhance `validate-samples.sh` to execute samples and capture HTTP responses
- [ ] Add success/failure detection logic (2xx=success, 4xx=code issue, 5xx=retry)
- [ ] Implement basic authentication pattern testing
- [ ] Add retry logic with exponential backoff for transient failures

**Week 1 Milestone**: Enhanced validation script ready for pipeline integration

### Critical Dependencies & Risks

**External Dependencies**:
- Azure OpenAI service quotas sufficient for validation runs
- Service principal permissions for DefaultAzureCredential testing
- Model deployments available for validation (gpt-4, text-embedding-ada-002, dall-e-3)

**Technical Risks**:
- Service call validation may slow pipeline significantly
- Authentication pattern testing may require pipeline credential changes
- Existing samples may have hidden correctness issues

**Mitigation Strategies**:
- Start with subset of samples for validation testing
- Implement timeout and failure limits to prevent pipeline hanging
- Have manual validation process as backup
- Use existing pipeline's `$(VALIDATE_WITH_SERVICE)` toggle for gradual rollout

### Success Definition for Ignite

**Primary Goal**: Zero customer-reported "this sample doesn't work" issues for Ignite content

**Minimum Success**: 
- All Ignite-bound samples execute successfully with service calls
- Both API key and DefaultAzureCredential authentication patterns work
- No 4xx client errors indicating missing properties or parameter issues

**Stretch Goal**:
- Automated validation runs daily catching issues early
- Clear error reporting when samples fail validation
- Fast feedback loop for sample fixes

---

**Document Status**: Draft v2 - Ignite 2025 Timeline Focus  
**Deadline**: November 7, 2025  
**Next Review**: Oct 7 for implementation kickoff  
**Owner**: [OWNER]  
**Contributors**: [CONTRIBUTORS]
