#!/bin/bash

set -e

GENERATED_SAMPLES_DIR="generated-samples"
CONFIG_DEFAULTS_DIR="validation-config-defaults"
SAMPLE_TEMPLATES_DIR="samples"

echo "Publishing configuration files..."

# Create language directories if they don't exist
for config_file in "$CONFIG_DEFAULTS_DIR"/*.json; do
    if [[ -f "$config_file" ]]; then
        language=$(basename "$config_file" .json)
        lang_dir="$GENERATED_SAMPLES_DIR/$language"
        
        echo "Publishing default config, filename $config_file, for $language to $lang_dir"
        mkdir -p "$lang_dir"
        cp "$config_file" "$lang_dir/.config-defaults.json"
    fi
done

# Publish sample-specific configs
for sample_dir in "$SAMPLE_TEMPLATES_DIR"/*; do
    if [[ -d "$sample_dir" ]]; then
        sample_name=$(basename "$sample_dir")
        
        # Check each language subdirectory for sample configs
        for lang_template_dir in "$sample_dir"/*; do
            if [[ -d "$lang_template_dir" ]]; then
                language=$(basename "$lang_template_dir")
                sample_config="$lang_template_dir/.validation-config.json"
                
                if [[ -f "$sample_config" ]]; then
                    target_dir="$GENERATED_SAMPLES_DIR/$language/$sample_name"
                    mkdir -p "$target_dir"
                    if [[ -d "$target_dir" ]]; then
                        echo "Publishing sample config for $sample_name ($language)"
                        cp "$sample_config" "$target_dir/.validation-config.json"
                    fi
                fi
            fi
        done
    fi
done

echo "Configuration publishing complete!"