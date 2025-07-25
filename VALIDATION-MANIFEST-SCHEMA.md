# Validation Manifest Schema

This document describes the JSON schema for the validation manifest (`validation-manifest.json`) that replaces the current file-based validation result storage in the Azure OpenAI Template Samples repository.

## Overview

The validation manifest captures comprehensive metadata about sample validation runs, including:
- Individual sample validation results (pass/fail status)
- Build step outcomes and error details
- Validation step results and timing information
- Timestamps and pipeline run information
- Configuration used for each sample
- Cumulative data from previous runs for packaging logic

## Schema Location

The JSON Schema is defined in [`validation-manifest.schema.json`](../validation-manifest.schema.json) and follows JSON Schema Draft 2020-12.

## Schema Structure

### Root Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `schemaVersion` | string | ✓ | Version of the validation manifest schema (semver format) |
| `timestamp` | string | ✓ | ISO 8601 timestamp when validation was performed |
| `pipelineInfo` | object | ✓ | Information about the pipeline run |
| `validationResults` | object | ✓ | Validation results organized by language |
| `cumulativeData` | object | | Cumulative data from previous runs |

### Pipeline Information

Contains metadata about the Azure DevOps pipeline run:

```json
{
  "pipelineInfo": {
    "runId": "20240125.1",
    "buildNumber": "1234",
    "branch": "main",
    "commit": "abc123...",
    "triggeredBy": "push"
  }
}
```

### Validation Results

Results are organized by programming language, with each language containing:

- Summary statistics (total, passed, failed samples)
- Array of individual sample results

### Sample Result

Each sample result includes:

- **Basic Info**: Path, overall status, timing
- **Configuration**: Validation config used for the sample
- **Build Steps**: Results of each build command executed
- **Validation Steps**: Results of each validation command executed  
- **Errors**: Detailed error information with file/line numbers
- **Metadata**: Additional information like file count, dependencies

### Step Results

Both build and validation steps capture:

- Command executed
- Execution status, timing, and exit code
- stdout/stderr output

### Error Details

Structured error information including:

- Error type (compilation, syntax, dependency, etc.)
- Severity level
- File location (file, line, column)
- Error message and code

## Usage Examples

### Basic Validation Manifest

```json
{
  "schemaVersion": "1.0.0",
  "timestamp": "2024-01-25T10:30:00Z",
  "pipelineInfo": {
    "runId": "20240125.1",
    "buildNumber": "1234",
    "branch": "main",
    "commit": "abc123def456",
    "triggeredBy": "push"
  },
  "validationResults": {
    "csharp": {
      "language": "csharp",
      "totalSamples": 15,
      "passedSamples": 14,
      "failedSamples": 1,
      "samples": [
        {
          "samplePath": "generated-samples/csharp/chat-completion",
          "status": "passed",
          "startTime": "2024-01-25T10:30:05Z",
          "endTime": "2024-01-25T10:30:45Z",
          "duration": 40.5,
          "configuration": {
            "language": "csharp",
            "framework": "net9.0",
            "validationLevel": "compile-only",
            "buildSteps": ["dotnet restore", "dotnet build"],
            "validateSteps": [],
            "dependencies": {
              "Azure.AI.OpenAI": "latest"
            }
          },
          "buildSteps": [
            {
              "command": "dotnet restore",
              "status": "passed",
              "startTime": "2024-01-25T10:30:05Z",
              "endTime": "2024-01-25T10:30:25Z",
              "duration": 20.0,
              "exitCode": 0,
              "stdout": "Restore completed successfully"
            },
            {
              "command": "dotnet build",
              "status": "passed", 
              "startTime": "2024-01-25T10:30:25Z",
              "endTime": "2024-01-25T10:30:45Z",
              "duration": 20.5,
              "exitCode": 0,
              "stdout": "Build succeeded."
            }
          ],
          "validationSteps": [],
          "errors": [],
          "metadata": {
            "fileCount": 3,
            "dependencies": ["Azure.AI.OpenAI"],
            "tags": ["chat", "completion"]
          }
        }
      ]
    }
  }
}
```

### Sample with Validation Errors

```json
{
  "samplePath": "generated-samples/csharp/image-generation",
  "status": "failed",
  "startTime": "2024-01-25T10:31:00Z",
  "endTime": "2024-01-25T10:31:30Z",
  "duration": 30.0,
  "configuration": {
    "language": "csharp",
    "framework": "net9.0",
    "validationLevel": "compile-only",
    "buildSteps": ["dotnet restore", "dotnet build"],
    "validateSteps": []
  },
  "buildSteps": [
    {
      "command": "dotnet restore",
      "status": "passed",
      "startTime": "2024-01-25T10:31:00Z",
      "endTime": "2024-01-25T10:31:10Z",
      "duration": 10.0,
      "exitCode": 0
    },
    {
      "command": "dotnet build",
      "status": "failed",
      "startTime": "2024-01-25T10:31:10Z", 
      "endTime": "2024-01-25T10:31:30Z",
      "duration": 20.0,
      "exitCode": 1,
      "stderr": "Program.cs(15,23): error CS0103: The name 'invalidMethod' does not exist in the current context"
    }
  ],
  "validationSteps": [],
  "errors": [
    {
      "type": "compilation",
      "message": "The name 'invalidMethod' does not exist in the current context",
      "file": "Program.cs",
      "line": 15,
      "column": 23,
      "severity": "error",
      "code": "CS0103"
    }
  ],
  "metadata": {
    "fileCount": 2,
    "dependencies": ["Azure.AI.OpenAI"],
    "tags": ["image", "generation"]
  }
}
```

### Cumulative Data Example

```json
{
  "cumulativeData": {
    "previousRunResults": [
      {
        "runId": "20240124.3",
        "timestamp": "2024-01-24T15:45:00Z",
        "totalSamples": 45,
        "passedSamples": 43,
        "failedSamples": 2
      },
      {
        "runId": "20240124.2", 
        "timestamp": "2024-01-24T12:30:00Z",
        "totalSamples": 45,
        "passedSamples": 45,
        "failedSamples": 0
      }
    ],
    "trendAnalysis": {
      "successRate": 0.956,
      "consecutiveSuccesses": 2,
      "lastFailureTimestamp": "2024-01-23T09:15:00Z"
    }
  }
}
```

## Integration with Azure DevOps

The validation manifest is designed to be:

1. **Generated** by validation scripts during pipeline execution
2. **Published** as an Azure DevOps artifact for each language validation job
3. **Consumed** by downstream processes for packaging decisions
4. **Aggregated** across multiple runs for trend analysis

### Pipeline Integration Points

1. **Generation**: Validation scripts output structured JSON instead of simple log files
2. **Artifact Publishing**: Manifest files are published as pipeline artifacts
3. **Artifact Consumption**: Downstream jobs can download and parse previous manifests
4. **Packaging Logic**: Use cumulative data and success rates to make packaging decisions

## Schema Validation

You can validate a validation manifest against the schema using tools like:

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s validation-manifest.schema.json -d validation-manifest.json

# Using online validators
# Upload both schema and manifest to https://www.jsonschemavalidator.net/
```

## Extensibility

The schema is designed to be extensible:

- **Additional Properties**: Most objects allow additional properties for future expansion
- **Error Types**: New error types can be added to the enum
- **Languages**: New languages can be added to the validation results
- **Step Types**: New types of build/validation steps are automatically supported
- **Metadata**: Sample metadata object is flexible for additional properties

## Migration from Current System

The current validation system uses simple log files:
- `validation-success.log` - Contains sample paths that passed
- `validation-errors.log` - Contains sample paths that failed

Migration involves:
1. **Script Updates**: Modify validation scripts to generate JSON manifests
2. **Pipeline Updates**: Update Azure DevOps pipeline to publish/consume JSON artifacts
3. **Backward Compatibility**: Keep log files during transition period if needed

## Future Enhancements

Potential future additions to the schema:
- **Performance Metrics**: Memory usage, CPU utilization during validation
- **Code Quality Metrics**: Complexity, coverage, linting scores
- **Security Scanning**: Results from security analysis tools
- **Dependency Analysis**: Vulnerability scanning, license compliance
- **Historical Comparison**: Compare current run against baseline metrics