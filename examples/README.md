# Validation Manifest Examples

This directory contains example validation manifest files demonstrating the schema in action across different programming languages and scenarios.

## Files Overview

| File | Description |
|------|-------------|
| [`validation-manifest-csharp-example.json`](./validation-manifest-csharp-example.json) | C# validation with mixed success/failure results |
| [`validation-manifest-python-example.json`](./validation-manifest-python-example.json) | Python validation with linting steps |
| [`validation-manifest-java-example.json`](./validation-manifest-java-example.json) | Java validation with Maven and code quality tools |

## Example Scenarios

### C# Example
- **Samples**: 3 samples (2 passed, 1 failed)
- **Configuration**: .NET 9.0 with Azure.AI.OpenAI dependency
- **Build Steps**: `dotnet restore`, `dotnet build`
- **Failure**: Compilation error in image-generation sample
- **Features Demonstrated**:
  - Successful build steps with timing
  - Compilation error with detailed location info
  - Build artifacts tracking

### Python Example  
- **Samples**: 4 samples (3 passed, 1 failed)
- **Configuration**: Python 3.11 with OpenAI package
- **Build Steps**: `pip install -r requirements.txt`
- **Validation Steps**: `python -m py_compile`, `flake8` (for some samples)
- **Failure**: Syntax error in async function
- **Features Demonstrated**:
  - Pre-build dependency installation
  - Multiple validation tools (compilation + linting)
  - Custom sample configuration with additional validation steps
  - Extension metadata for linting configuration

### Java Example
- **Samples**: 2 samples (1 passed, 1 failed)
- **Configuration**: Java 17 with Maven build system
- **Build Steps**: `mvn clean compile`
- **Validation Steps**: `mvn checkstyle:check`, `mvn pmd:pmd`
- **Failure**: Compilation error in async embeddings sample
- **Features Demonstrated**:
  - Maven build system integration
  - Multiple code quality tools (Checkstyle, PMD)
  - Longer build times typical of Java projects
  - Code quality report artifacts

## Common Patterns

### Success Path
1. Build steps execute successfully with exit code 0
2. Validation steps pass all checks
3. Artifacts are generated and tracked
4. Timing information captured for performance analysis

### Failure Path
1. Build or validation step fails with non-zero exit code
2. Error output captured in `stderr`
3. Structured error details provided when possible
4. Sample marked as failed, but pipeline continues

### Historical Tracking
All examples include:
- Previous run summaries for trend analysis
- Success rate calculations
- Failure pattern detection
- Performance metrics (average duration)

## Schema Features Demonstrated

### Core Requirements ✅
- [x] Sample validation results (pass/fail status)
- [x] Build step outcomes and error details
- [x] Validation step results and timing
- [x] Timestamps and pipeline run information
- [x] Configuration used for each sample
- [x] Cumulative data from previous runs for packaging logic

### Extensibility ✅
- [x] Extension metadata for custom configurations
- [x] Additional properties support
- [x] Language-specific adaptations

### Error Handling ✅
- [x] Structured error details with location information
- [x] Exit codes and output capture
- [x] Human-readable error messages

## Usage in Pipeline

These examples show how the manifest would be generated and used:

### Generation
```bash
# Current validation script would be modified to output JSON
./scripts/validate-samples.sh csharp > validation-manifest.json
```

### Consumption
```bash
# Pipeline artifact publishing
az pipelines universal publish \
  --organization "https://dev.azure.com/myorg" \
  --project "myproject" \
  --scope project \
  --feed "validation-manifests" \
  --name "csharp-validation" \
  --version "1.0.$(Build.BuildNumber)" \
  --description "C# validation results" \
  --path "./validation-manifest.json"
```

### Analysis
```bash
# Trend analysis from historical data
jq '.history.trends.successRate' validation-manifest.json
jq '.validation.summary' validation-manifest.json
```

## Validation

All example files validate against the schema:

```bash
# Install JSON schema validator
npm install -g ajv-cli

# Validate examples
ajv validate -s ../validation-manifest-schema.json -d validation-manifest-csharp-example.json
ajv validate -s ../validation-manifest-schema.json -d validation-manifest-python-example.json  
ajv validate -s ../validation-manifest-schema.json -d validation-manifest-java-example.json
```

## Migration from Current System

The examples show how current validation data maps to the new schema:

| Current File | New Location |
|--------------|--------------|
| `validation-success.log` | `validation.samples[].status: "passed"` |
| `validation-errors.log` | `validation.samples[].status: "failed"` |
| Build output | `samples[].buildSteps[].stdout/stderr` |
| Error details | `samples[].buildSteps[].errorDetails` |
| Timing info | `samples[].duration`, `buildSteps[].duration` |

## Next Steps

1. **Implementation**: Modify validation scripts to generate manifests
2. **Pipeline Integration**: Update Azure DevOps pipeline to publish manifests
3. **Tooling**: Create utilities for manifest analysis and reporting
4. **Dashboard**: Build visualization for trend analysis

## Related Files

- [`../validation-manifest-schema.json`](../validation-manifest-schema.json) - The JSON schema definition
- [`../docs/validation-manifest-schema.md`](../docs/validation-manifest-schema.md) - Comprehensive documentation