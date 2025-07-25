#!/bin/bash

set -e

VALIDATION_MANIFEST="validation-manifest.json"
CONFIG_DEFAULTS_DIR="validation-config-defaults"
SAMPLE_TEMPLATES_DIR="samples"

echo "Generating validation manifest..."

# Start the manifest JSON structure
cat > "$VALIDATION_MANIFEST" << 'EOF'
{
  "version": "1.0",
  "generated": "",
  "languageDefaults": {},
  "sampleOverrides": {}
}
EOF

# Add generation timestamp
jq --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '.generated = $timestamp' "$VALIDATION_MANIFEST" > temp.json && mv temp.json "$VALIDATION_MANIFEST"

# Add language defaults
for config_file in "$CONFIG_DEFAULTS_DIR"/*.json; do
    if [[ -f "$config_file" ]]; then
        language=$(basename "$config_file" .json)
        echo "Adding language defaults for $language"
        
        # Read the config and add it to languageDefaults
        config_content=$(cat "$config_file")
        jq --arg lang "$language" --argjson config "$config_content" '.languageDefaults[$lang] = $config' "$VALIDATION_MANIFEST" > temp.json && mv temp.json "$VALIDATION_MANIFEST"
    fi
done

# Add sample-specific overrides
for sample_dir in "$SAMPLE_TEMPLATES_DIR"/*; do
    if [[ -d "$sample_dir" ]]; then
        sample_name=$(basename "$sample_dir")
        
        # Check each language subdirectory for sample configs
        for lang_template_dir in "$sample_dir"/*; do
            if [[ -d "$lang_template_dir" ]]; then
                language=$(basename "$lang_template_dir")
                sample_config="$lang_template_dir/.validation-config.json"
                
                if [[ -f "$sample_config" ]]; then
                    echo "Adding sample override for $sample_name ($language)"
                    config_content=$(cat "$sample_config")
                    
                    # Add to sampleOverrides using nested structure
                    jq --arg sample "$sample_name" --arg lang "$language" --argjson config "$config_content" '
                        .sampleOverrides[$sample] = (.sampleOverrides[$sample] // {}) |
                        .sampleOverrides[$sample][$lang] = $config
                    ' "$VALIDATION_MANIFEST" > temp.json && mv temp.json "$VALIDATION_MANIFEST"
                fi
            fi
        done
    fi
done

echo "Validation manifest generated: $VALIDATION_MANIFEST"
echo "Manifest size: $(wc -c < "$VALIDATION_MANIFEST") bytes"

# Pretty print the result for verification
echo "Manifest contents:"
jq . "$VALIDATION_MANIFEST"