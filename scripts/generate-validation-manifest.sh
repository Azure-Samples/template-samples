#!/bin/bash
set -e

echo "Generating validation manifest from validation results..."

# Create output directory if it doesn't exist
mkdir -p validation-manifest

# Initialize the manifest JSON
MANIFEST_FILE="validation-manifest/validation-manifest.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Start building the manifest
{
    echo "{"
    echo "  \"lastUpdated\": \"$TIMESTAMP\","
    echo "  \"samples\": {"
} > "$MANIFEST_FILE"

# Track if we've added any samples (for comma handling)
FIRST_SAMPLE=true

# Function to process validation results from a specific language
process_language_results() {
    local language="$1"
    local results_dir="$2"
    
    if [ ! -d "$results_dir" ]; then
        echo "No results directory found for $language: $results_dir"
        return
    fi
    
    local success_log="$results_dir/validation-success.log"
    if [ -f "$success_log" ]; then
        echo "Processing successful validations for $language..."
        while IFS= read -r sample_path; do
            if [ -n "$sample_path" ]; then
                # Extract sample name from the path (remove ✅ prefix and whitespace)
                sample_name=$(echo "$sample_path" | sed 's/✅ *//' | sed 's|^generated-samples/||')
                
                # Add comma if not the first sample
                if [ "$FIRST_SAMPLE" = false ]; then
                    echo "," >> "$MANIFEST_FILE"
                fi
                FIRST_SAMPLE=false
                
                # Add the sample to the manifest
                {
                    echo "    \"$sample_name\": {"
                    echo "      \"lastValidated\": \"$TIMESTAMP\","
                    echo "      \"version\": \"1.0.0\","
                    echo "      \"status\": \"validated\""
                    echo -n "    }"
                } >> "$MANIFEST_FILE"
            fi
        done < "$success_log"
    else
        echo "No success log found for $language: $success_log"
    fi
}

# Process results from each language if the artifact directories exist
if [ -d "csharp-results" ]; then
    process_language_results "csharp" "csharp-results"
fi

if [ -d "python-results" ]; then
    process_language_results "python" "python-results"
fi

if [ -d "java-results" ]; then
    process_language_results "java" "java-results"
fi

# Close the manifest JSON
{
    echo ""
    echo "  }"
    echo "}"
} >> "$MANIFEST_FILE"

# Validate the generated manifest against the schema if ajv is available
if command -v ajv &> /dev/null; then
    echo "Validating generated manifest against schema..."
    if ajv validate -s ci/validation-manifest.schema.json -d "$MANIFEST_FILE" --strict=false; then
        echo "✅ Generated manifest is valid!"
    else
        echo "❌ Generated manifest validation failed!"
        exit 1
    fi
else
    echo "⚠️  ajv not available - skipping schema validation"
fi

echo "✅ Validation manifest generated successfully: $MANIFEST_FILE"
cat "$MANIFEST_FILE"