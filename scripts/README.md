# Validation Scripts Overview

This directory contains the core validation scripts used by the Azure DevOps pipeline to ensure code sample quality. (They can also be run locally.) These scripts work together to provide a flexible, configuration-driven validation system that can handle multiple programming languages and different validation requirements.

## Workflow Summary

The validation process follows this sequence:

1. **Validation Manifest Generation** (`generate-validation-manifest.sh`) - Creates a centralized validation-manifest.json containing all validation metadata
2. **Configuration Publishing** (`publish-configs.sh`) - Copies default and sample-specific validation configurations to the generated samples directories (for backward compatibility)
3. **Sample Validation** (`validate-samples.sh`) - Orchestrates validation of changed samples for a specific language
4. **Individual Sample Processing** (`validate-single-sample.sh`) - Validates each sample using resolved configuration from the manifest
5. **Configuration Resolution** (`resolve-sample-configs-from-manifest.sh` or `resolve-sample-configs.sh`) - Resolves validation configs from manifest or legacy files

## Key Features

- **Language Agnostic**: Supports multiple programming languages through configuration
- **Incremental Validation**: Only validates samples that have changed
- **Build and Validation Steps**: Separates build operations from validation checks
- **Artifact-Based Configuration**: Validation metadata stored as Azure DevOps artifacts instead of repository files
- **Backward Compatibility**: Falls back to legacy configuration resolution when manifest is unavailable

## Configuration System

### Validation Manifest (Preferred)
The validation system now uses a centralized `validation-manifest.json` artifact containing:
- **languageDefaults**: Default validation configurations for each supported language
- **sampleOverrides**: Sample-specific configuration overrides (when needed)
- **version**: Manifest format version for future compatibility
- **generated**: Timestamp of manifest generation

This manifest is generated during the build pipeline and published as an Azure DevOps artifact, consumed by validation jobs.

### Legacy Configuration (Fallback)
If the validation manifest is not available, the system falls back to:
- Language defaults from `validation-config-defaults/{language}.json` 
- Sample-specific overrides from `samples/{sample}/{language}/.validation-config.json`

## Script Details

### `generate-validation-manifest.sh`
**New**: Generates a centralized validation manifest by:
- Reading language defaults from `validation-config-defaults/*.json`
- Scanning for sample-specific overrides in `samples/*/language/.validation-config.json`
- Creating a unified `validation-manifest.json` with all validation metadata
- Adding version and timestamp information for artifact tracking

### `validate-samples.sh`
The main orchestrator script that:
- Takes a language parameter and file containing changed sample paths
- Iterates through each sample directory
- Calls the single sample validator for each one
- Aggregates results and reports success/failure

### `validate-single-sample.sh`
Validates an individual sample by:
1. **Configuration Resolution**: Calls `resolve-sample-configs-from-manifest.sh` (preferred) or `resolve-sample-configs.sh` (fallback) to get validation configuration
2. **Build Steps**: Executes commands from the `buildSteps` array (e.g., `dotnet restore`, `dotnet build`)
3. **Validation Steps**: Runs commands from the `validateSteps` array for additional checks
4. **Error Handling**: Exits with appropriate status codes

### `resolve-sample-configs-from-manifest.sh`
**New**: Resolves configuration from the validation manifest:
- Loads validation manifest from `validation-manifest.json`
- Extracts language defaults for the specified language
- Optionally merges sample-specific overrides
- Uses `jq` to process and merge JSON configurations
- Returns the final resolved configuration

### `resolve-sample-configs.sh`
**Legacy**: Handles the traditional configuration hierarchy:
- Loads language defaults from `generated-samples/{language}/validation-config-defaults.json`
- Optionally merges with sample-specific overrides from `.validation-config.json`
- Uses `jq` to merge JSON configurations
- Returns the final merged configuration

### `publish-configs.sh`
Copies configuration files to the generated samples structure for backward compatibility:
- Copies language defaults from `validation-config-defaults/` to `generated-samples/{language}/`
- Copies sample-specific configs from `samples/{sample}/{language}/.validation-config.json` to the corresponding generated sample directories
- Ensures each generated sample has access to the appropriate configuration files