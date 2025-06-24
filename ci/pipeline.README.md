# Azure Pipeline for Code Sample Validation

This Azure DevOps pipeline automatically validates code samples in the `generated-samples/` directory whenever changes are made. It's designed to ensure that all code samples compile correctly and meet quality standards before they're merged.

## How the Pipeline Works

### 1. Change Detection
The pipeline is triggered when:
- Changes are pushed to the `main` branch
- Files under `generated-samples/**` are modified

The first job (`DetectChanges`) analyzes the git diff to identify which sample directories have been modified:
- Compares current HEAD with the main branch
- Extracts unique sample directories from changed file paths
- Splits changes by programming language (C# and Python)
- Sets pipeline variables to conditionally run language-specific validation jobs

### 2. Language-Specific Validation
Based on the detected changes, the pipeline runs parallel validation jobs:

- **ValidateCSharp**: Runs when C# samples are modified
  - Sets up .NET SDK (version 9.x)
  - Installs required tools (jq for JSON processing)
  - Validates each changed C# sample

- **ValidatePython**: Runs when Python samples are modified
  - Sets up Python 3.11
  - Installs required tools
  - Validates each changed Python sample

### 3. Validation Process
Each sample goes through validation via the `validate-samples.sh` script, which:
1. Reads the list of changed samples
2. For each sample directory, calls `validate-single-sample.sh`
3. Logs results to `validation-success.log` and `validation-errors.log`
4. Fails the pipeline if any sample fails validation

## Validation Scripts

### `validate-samples.sh`
The main orchestrator script that:
- Takes a language parameter and file containing changed sample paths
- Iterates through each sample directory
- Calls the single sample validator for each one
- Aggregates results and reports success/failure

### `validate-single-sample.sh`
Validates an individual sample by:
1. **Configuration Resolution**: Calls `resolve-sample-configs.sh` to merge language defaults with sample-specific overrides
2. **Build Steps**: Executes commands from the `buildSteps` array (e.g., `dotnet restore`, `dotnet build`)
3. **Validation Steps**: Runs commands from the `validateSteps` array for additional checks
4. **Error Handling**: Exits with appropriate status codes

### `resolve-sample-configs.sh`
Handles the configuration hierarchy:
- Loads language defaults from `generated-samples/{language}/.config-defaults.json`
- Optionally merges with sample-specific overrides from `.sample-config.json`
- Uses `jq` to merge JSON configurations
- Returns the final merged configuration

## Configuration System

The configuration system uses a two-level hierarchy that allows for flexible sample management:

### Directory Structure Example
```
/generated-samples
  /csharp
    /.config-defaults.json  # C# language defaults
    /chat-completion/
      - Program.cs
      - ChatCompletion.csproj
      # No local config needed - uses defaults
    /chat-with-vision/
      - Program.cs
      - ChatWithVision.csproj
      - .sample-config.json   # Override only what's different
    /streaming-example/
      - Program.cs
      - StreamingExample.csproj
      - .sample-config.json   # Special streaming configuration
  /python
    /.config-defaults.json  # Python language defaults
    /basic-completion/
      - main.py
      - requirements.txt
    /async-complex/
      - main.py
      - requirements.txt
      - .sample-config.json   # Special async handling
```

### Configuration Files

#### Language Defaults (`.config-defaults.json`)
Located at `generated-samples/{language}/.config-defaults.json`, this file contains:
- **language**: Programming language identifier
- **framework**: Target framework/version (e.g., "net9.0", "python3.11")
- **dependencies**: Common packages/libraries needed for all samples
- **buildSteps**: Array of commands to build the sample (e.g., restore, compile)
- **validateSteps**: Array of commands for additional validation
- **validationLevel**: Level of validation (e.g., "compile-only", "runtime-test")

Example C# defaults:
```json
{
  "language": "csharp",
  "framework": "net9.0",
  "dependencies": {
    "Azure.AI.OpenAI": "latest"
  },
  "buildSteps": [
    "dotnet restore",
    "dotnet build"
  ],
  "validationLevel": "compile-only",
  "validateSteps": []
}
```

#### Sample Overrides (`.sample-config.json`)
Optional file in individual sample directories that can override or extend defaults:
- Only needs to specify properties that differ from defaults
- Can add custom properties for special handling

Example override:
```json
{
  "name": "chat-with-vision-reasoning",
  "validateSteps": [
    "dotnet test --no-build"
  ],
  "customTimeout": 30
}
```

## Pipeline Artifacts

The pipeline generates several artifacts for debugging and reporting:
- **ChangedCSharp/ChangedPython**: Files listing the changed sample directories
- **CSharpResults/PythonResults**: Validation logs (`validation-success.log`, `validation-errors.log`)

## Adding New Samples

To add a new sample, see the directions in `sample-templates`.
- (Optional) Create `.sample-config.json` if you need to override language defaults

The configuration system ensures that most samples can rely on sensible language defaults, while complex samples can customize their build and validation process as needed.



