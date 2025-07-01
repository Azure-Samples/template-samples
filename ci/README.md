# Azure Pipeline for Code Sample Validation

This Azure DevOps pipeline automatically generates and validates code samples in the `generated-samples/` directory whenever changes are made to sample templates. It's designed to ensure that all generated code samples compile correctly and meet quality standards before they're merged.

## How the Pipeline Works

### 1. Sample Generation and setup
- The pipeline starts by generating code samples using the [Caleuche CLI tool](https://msdata.visualstudio.com/Vienna/_wiki/wikis/Vienna.wiki/106110/Sample-Code-Generation-Validation-Pipeline?anchor=processing%3A-caleuche)
- A separate job configures the validation steps that will be used for each language (or specific to a particular sample, if needed) 

### 2. Change Detection
The next job analyzes which samples need validation and splits changes by programming language (C#, Python, etc.)

### 3. Validation Process

#### Language-Specific Validation
Based on the detected changes, the pipeline runs parallel validation jobs for each language

- [x] **ValidateCSharp**: Runs when C# samples are modified
- [ ] **ValidatePython**: Runs when Python samples are modified
- [ ] JavaScript
- [ ] Java
- [ ] Go

#### Validation Process
Each sample goes through validation via the `validate-samples.sh` script, which:
1. Downloads the appropriate language's changed samples list
2. Performs validation based on set configuration input
3. Logs results to `validation-success.log` and `validation-errors.log`
   - Fails the pipeline if any sample fails validation

## Pipeline Triggers

The pipeline is triggered when:
- Changes are pushed to the `main` branch
- Files under `generated-samples/**` are modified

## Validation Scripts

See [scripts](./../scripts/readme.md)



## Configuration System

The configuration system uses a two-level hierarchy that allows for flexible sample management:

### Directory Structure Example
```
/validation-config-defaults
  csharp.json                           # C# language defaults  
  python.json                           # Python language defaults

/samples                                # Sample templates
  /chat-completion/
    /csharp/
      - sample.cs.template              # Sample template for C#
    /python/ 
      - main.py.template                # Sample template for Python
  /chat-with-vision/
    /csharp/
      - Program.cs.template
      - .validation-config.json         # Sample-specific validation overrides in .NET
    /python/
      - main.py.template
      - .validation-config.json         # Sample-specific validation overrides in Python

/generated-samples                      # Generated from templates using Caleuche
  /csharp
    /validation-config-defaults.json    # C# defaults (copied from validation-config-defaults/ during pipeline run)
    /chat-completion/
      - Program.cs                      # Generated from template
      - ChatCompletion.csproj           # Generated project file
      # No local config - uses defaults
    /chat-with-vision/
      - Program.cs
      - ChatWithVision.csproj
      - .validation-config.json         # Sample-specific validation overrides (copied here during pipeline run)
  /python
    /validation-config-defaults.json    # Python defaults (copied from validation-config-defaults/)
    /chat-completion/
      - main.py                         # Generated from template
      - requirements.txt                # Generated dependencies
    /chat-with-vision/
      - main.py
      - requirements.txt
      - .validation-config.json         # Sample-specific validation overrides (copied here during pipeline run)
```

### Configuration Files

#### Language Defaults (`validation-config-defaults/{language}.json`)
Located at `validation-config-defaults/{language}.json`, these files contain language-specific defaults that get copied to `generated-samples/{language}/validation-config-defaults.json`. Contents vary by language.

#### Sample Overrides (`.validation-config.json`)
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
- **GeneratedSamples**: The complete set of generated code samples from templates
- **GeneratedConfigs**: Configuration files copied to the generated samples structure
- **Changed<Language>**: Files listing the changed sample directories for each language
- **<Language>Results/PythonResults**: Validation logs (`validation-success.log`, `validation-errors.log`)

## Adding New Samples

To add a new sample:
1. Create a new directory under `samples/{sample-name}/`
2. Add template files for each language under `samples/{sample-name}/{language}/`
3. (Optional) Create `.validation-config.json` in language directories if you need to override default validation steps
4. The sample will be automatically generated and validated by the pipeline

The configuration system ensures that most samples can rely on sensible language defaults, while complex samples can customize their build and validation process as needed.



