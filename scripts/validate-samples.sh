#!/bin/bash
set -e

LANGUAGE=$1
CHANGED_SAMPLES_FILE=$2
PACKAGE_VERSION=${PACKAGE_VERSION:-"1.0.0"}

echo "Validating $LANGUAGE samples..."

# Determine which samples to validate
if [ -n "$CHANGED_SAMPLES_FILE" ] && [ -f "$CHANGED_SAMPLES_FILE" ] && [ -s "$CHANGED_SAMPLES_FILE" ]; then
    echo "Using changed samples: $CHANGED_SAMPLES_FILE"
    SAMPLES_FILE="$CHANGED_SAMPLES_FILE"
else
    echo "No $LANGUAGE samples changes found."
    exit 0
fi

# Initialize output files for backward compatibility
> validation-success.log
> validation-errors.log

# Initialize manifest data
MANIFEST_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MANIFEST_RESULTS=""
RESULTS_COUNT=0

# Create a temporary directory for individual sample results
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Validate each sample
while IFS= read -r sample_dir; do
    if [ -d "$sample_dir" ]; then
        echo ""
        echo "=== Validating: $sample_dir ==="
        
        # Get JSON result from single sample validation
        SAMPLE_RESULT=$(./scripts/validate-single-sample.sh "$sample_dir" true)
        SAMPLE_STATUS=$(echo "$SAMPLE_RESULT" | jq -r '.status')
        
        # Store result for manifest aggregation
        echo "$SAMPLE_RESULT" > "$TEMP_DIR/result_$RESULTS_COUNT.json"
        RESULTS_COUNT=$((RESULTS_COUNT + 1))
        
        # Traditional logging for backward compatibility
        if [ "$SAMPLE_STATUS" = "validated" ]; then
            echo "✅ $sample_dir" >> validation-success.log
            
            # Also run traditional validation for console output
            ./scripts/validate-single-sample.sh "$sample_dir" >/dev/null || true
        else
            echo "❌ $sample_dir" >> validation-errors.log
            
            # Show error message
            ERROR_MSG=$(echo "$SAMPLE_RESULT" | jq -r '.error // "Unknown error"')
            echo "Error: $ERROR_MSG"
        fi
    fi
done < "$SAMPLES_FILE"

# Generate validation manifest
MANIFEST_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build the samples object for the manifest (only successful validations)
SAMPLES_JSON="{}"
for result_file in "$TEMP_DIR"/result_*.json; do
    if [ -f "$result_file" ]; then
        RESULT=$(cat "$result_file")
        STATUS=$(echo "$RESULT" | jq -r '.status')
        
        if [ "$STATUS" = "validated" ]; then
            SAMPLE_PATH=$(echo "$RESULT" | jq -r '.samplePath')
            LAST_VALIDATED=$(echo "$RESULT" | jq -r '.endTime')
            
            # Create the sample key by removing 'generated-samples/' prefix
            SAMPLE_KEY=$(echo "$SAMPLE_PATH" | sed 's|^generated-samples/||')
            
            # Add to samples object
            SAMPLES_JSON=$(echo "$SAMPLES_JSON" | jq \
                --arg key "$SAMPLE_KEY" \
                --arg lastValidated "$LAST_VALIDATED" \
                --arg version "$PACKAGE_VERSION" \
                --arg status "validated" \
                '.[$key] = {
                    lastValidated: $lastValidated,
                    version: $version,
                    status: $status
                }')
        fi
    fi
done

# Create the full manifest
MANIFEST=$(jq -n \
    --arg lastUpdated "$MANIFEST_END_TIME" \
    --argjson samples "$SAMPLES_JSON" \
    '{
        lastUpdated: $lastUpdated,
        samples: $samples
    }')

# Write manifest to file
echo "$MANIFEST" > "validation-manifest.json"
echo "Generated validation manifest: validation-manifest.json"

# Report results (traditional format for backward compatibility)
echo ""
echo "=== Results ==="
if [ -s validation-success.log ]; then
    echo "Passed $(wc -l < validation-success.log) samples:"
    cat validation-success.log
fi

if [ -s validation-errors.log ]; then
    echo "Failed $(wc -l < validation-errors.log) samples:"
    cat validation-errors.log
    exit 1
fi

echo "All $LANGUAGE samples passed!"
