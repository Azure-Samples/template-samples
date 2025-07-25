#!/bin/bash
set -e

SAMPLE_DIR=$1

# Resolve configuration using the validation manifest
if [ -f "validation-manifest.json" ]; then
    echo "Using validation manifest for config resolution"
    CONFIG=$(./scripts/resolve-sample-configs-from-manifest.sh "$SAMPLE_DIR" "validation-manifest.json")
else
    echo "Falling back to legacy config resolution"
    CONFIG=$(./scripts/resolve-sample-configs.sh "$SAMPLE_DIR")
fi

LANGUAGE=$(echo "$CONFIG" | jq -r '.language')

echo "Language: $LANGUAGE"

# Save current directory and change to sample directory
ORIGINAL_DIR=$(pwd)
cd "$SAMPLE_DIR"

# Execute build steps
echo ""
echo "--- Build Steps ---"
echo "$CONFIG" | jq -r '.buildSteps[]?' | while IFS= read -r step; do
    if [ -n "$step" ] && [ "$step" != "null" ]; then
        echo "Executing: $step"
        eval "$step"
    fi
done

# Execute validation steps
echo ""
echo "--- Validation Steps ---"
echo "$CONFIG" | jq -r '.validateSteps[]?' | while IFS= read -r step; do
    if [ -n "$step" ] && [ "$step" != "null" ]; then
        echo "Executing: $step"
        eval "$step"
    fi
done

# Return to original directory
cd "$ORIGINAL_DIR"

echo "✅ Validation completed"