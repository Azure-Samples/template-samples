# Validation Manifest Schema Documentation

## Overview

The validation manifest schema defines a standardized format for storing validation results from the Azure OpenAI template samples pipeline. This replaces the current file-based validation result storage with a structured JSON format that captures comprehensive validation metadata.

## Schema Version

Current version: **1.0.0**

The schema follows semantic versioning to ensure compatibility as requirements evolve.

## Purpose

The validation manifest serves multiple purposes:

1. **Centralized Results Storage**: Replaces simple log files with structured data
2. **Pipeline Integration**: Supports Azure DevOps artifact storage requirements
3. **Historical Tracking**: Maintains cumulative data for packaging logic decisions
4. **Debugging Support**: Provides detailed error information and execution context
5. **Trend Analysis**: Enables failure pattern detection and performance monitoring

## Schema Structure

### Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | ✅ | Schema version (semver format) |
| `timestamp` | string | ✅ | ISO 8601 timestamp of validation execution |
| `pipeline` | object | ✅ | Pipeline execution context |
| `language` | string | ✅ | Programming language being validated |
| `configuration` | object | ❌ | Default language configuration |
| `validation` | object | ✅ | Validation results and summary |
| `history` | object | ❌ | Cumulative data from previous runs |
| `metadata` | object | ❌ | Additional metadata for extensibility |

### Pipeline Information

The `pipeline` object captures the execution context:

```json
{
  "runId": "20240115.3",
  "buildNumber": "123",
  "repository": {
    "name": "template-samples",
    "branch": "main", 
    "commit": "abc123..."
  },
  "agent": {
    "name": "ubuntu-latest",
    "os": "Linux"
  }
}
```

### Language Configuration

Stores the default validation configuration used for the language:

```json
{
  "framework": "net9.0",
  "dependencies": {
    "Azure.AI.OpenAI": "latest"
  },
  "buildSteps": [
    "dotnet restore",
    "dotnet build"
  ],
  "validateSteps": [],
  "validationLevel": "compile-only"
}
```

### Validation Results

The core validation data includes:

#### Summary
- Total, passed, failed, and skipped sample counts
- Overall duration in seconds

#### Individual Sample Results
Each sample includes:
- **Identification**: name, path, status
- **Timing**: timestamp, duration
- **Configuration**: resolved config for this specific sample
- **Build Steps**: detailed execution results for each build command
- **Validation Steps**: detailed execution results for each validation command
- **Artifacts**: generated files and their metadata

### Step Execution Details

Both build and validation steps capture:

```json
{
  "command": "dotnet build",
  "status": "success",
  "duration": 7.1,
  "exitCode": 0,
  "stdout": "Build output...",
  "stderr": "Error output...",
  "errorDetails": {
    "type": "CompilationError",
    "message": "Human-readable error description",
    "location": {
      "file": "Program.cs",
      "line": 15,
      "column": 34
    }
  }
}
```

### Historical Data

The `history` section enables trend analysis:

- **Previous Runs**: Summary of recent validation executions
- **Trends**: Success rates, average durations, failing patterns
- **Packaging Logic**: Data to inform release decisions

### Extensibility

The schema supports future requirements through:

1. **Extensions Object**: Reserved namespace for custom properties
2. **Additional Properties**: Schema allows extending metadata sections
3. **Versioning**: Semantic versioning enables backward compatibility

## Usage Examples

### Basic Success Case

```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-15T14:30:45.123Z",
  "pipeline": {
    "runId": "20240115.3",
    "buildNumber": "123"
  },
  "language": "csharp",
  "validation": {
    "summary": {
      "total": 2,
      "passed": 2,
      "failed": 0,
      "duration": 24.1
    },
    "samples": [
      {
        "name": "chat-completion",
        "path": "generated-samples/csharp/chat-completion",
        "status": "passed",
        "timestamp": "2024-01-15T14:30:50.456Z",
        "duration": 12.3,
        "buildSteps": [
          {
            "command": "dotnet restore",
            "status": "success",
            "duration": 5.2,
            "exitCode": 0
          }
        ]
      }
    ]
  }
}
```

### Failure Case with Error Details

```json
{
  "samples": [
    {
      "name": "image-generation",
      "status": "failed",
      "buildSteps": [
        {
          "command": "dotnet build",
          "status": "failed",
          "exitCode": 1,
          "stderr": "Program.cs(15,34): error CS1002: ; expected",
          "errorDetails": {
            "type": "CompilationError",
            "message": "Syntax error in generated code",
            "location": {
              "file": "Program.cs",
              "line": 15,
              "column": 34
            }
          }
        }
      ]
    }
  ]
}
```

## Integration with Current System

### Replacing Log Files

The manifest replaces these current files:
- `validation-success.log` → `validation.samples[].status: "passed"`
- `validation-errors.log` → `validation.samples[].status: "failed"`

### Pipeline Artifacts

The manifest will be published as an Azure DevOps artifact:
- **Artifact Name**: `{Language}ValidationManifest` 
- **File Name**: `validation-manifest.json`
- **Format**: Single JSON file per language per pipeline run

### Configuration Integration

The schema integrates with existing configuration files:
- `validation-config-defaults/{language}.json` → `configuration`
- `.validation-config.json` → `samples[].configuration`

## Validation and Quality Assurance

### Schema Validation

All manifest files should be validated against the JSON schema:

```bash
# Using a JSON schema validator
ajv validate -s validation-manifest-schema.json -d validation-manifest.json
```

### Required Fields

The schema enforces these minimum requirements:
- Version, timestamp, pipeline info, language
- Validation summary with counts
- Each sample must have name, path, status, timestamp

### Data Integrity

- Timestamps must be valid ISO 8601 format
- Durations must be non-negative numbers
- Status values must match defined enums
- Counts in summary must be consistent with sample array

## Future Considerations

### Planned Enhancements

1. **Test Execution**: Add support for actual test runs beyond compilation
2. **Performance Metrics**: Include memory usage, build cache statistics
3. **Quality Gates**: Define success criteria based on trends
4. **Notifications**: Structure data for automated alerts

### Backward Compatibility

When updating the schema:
1. Increment version number according to semver
2. Maintain support for previous schema versions
3. Provide migration documentation
4. Update examples and documentation

### Custom Extensions

Projects can extend the schema using the `extensions` object:

```json
{
  "metadata": {
    "extensions": {
      "customTool": {
        "enabled": true,
        "config": "custom configuration"
      }
    }
  }
}
```

## Related Documentation

- [Azure DevOps Artifacts](https://docs.microsoft.com/en-us/azure/devops/artifacts/)
- [JSON Schema Specification](https://json-schema.org/)
- [Issue #30: Store validation metadata as Azure DevOps artifact](https://github.com/Azure-Samples/template-samples/issues/30)