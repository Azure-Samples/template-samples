# Validation Scripts Overview

This directory contains the core validation scripts used by the Azure DevOps pipeline to ensure code sample quality. (They can also be run locally.) These scripts work together to provide a flexible, configuration-driven validation system that can handle multiple programming languages and different validation requirements.

## Workflow Summary

The validation process follows this sequence:

1. **Configuration Publishing** (`publish-configs.sh`) - Copies default and sample-specific validation configurations to the generated samples directories
2. **Sample Validation** (`validate-samples.sh`) - Orchestrates validation of changed samples for a specific language
3. **Individual Sample Processing** (`validate-single-sample.sh`) - Validates each sample using resolved configuration
4. **Configuration Resolution** (`resolve-sample-configs.sh`) - Merges language defaults with any sample-specific overrides

## Key Features

- **Language Agnostic**: Supports multiple programming languages through configuration
- **Incremental Validation**: Only validates samples that have changed
- **Build and Validation Steps**: Separates build operations from validation checks

## Script Details

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
- Loads language defaults from `generated-samples/{language}/validation-config-defaults.json`
- Optionally merges with sample-specific overrides from `.validation-config.json`
- Uses `jq` to merge JSON configurations
- Returns the final merged configuration

### `publish-configs.sh`
Copies configuration files to the generated samples structure:
- Copies language defaults from `validation-config-defaults/` to `generated-samples/{language}/`
- Copies sample-specific configs from `samples/{sample}/{language}/.validation-config.json` to the corresponding generated sample directories
- Ensures each generated sample has access to the appropriate configuration files