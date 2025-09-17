#!/bin/bash
set -e

SAMPLE_DIR=$1
MAKE_SERVICE_CALLS=${2:-false}
LANGUAGE=$3

# Resolve configuration

CONFIG=$(./scripts/resolve-sample-configs.sh "$SAMPLE_DIR" "$LANGUAGE")
LANGUAGE=$(echo "$CONFIG" | jq -r '.language')

echo "Language: $LANGUAGE"

# Save current directory and change to sample directory
ORIGINAL_DIR=$(pwd)
cd "$SAMPLE_DIR"

# Execute preBuild steps
echo ""
echo "--- PreBuild Steps ---"
echo "$CONFIG" | jq -r '.preBuildSteps[]?' | while IFS= read -r step; do
    if [ -n "$step" ] && [ "$step" != "null" ]; then
        echo "Executing: $step"
        eval "$step"
    fi
done

# Execute build steps
echo ""
echo "--- Build Steps ---"
echo "$CONFIG" | jq -r '.buildSteps[]?' | while IFS= read -r step; do
    if [ -n "$step" ] && [ "$step" != "null" ]; then
        echo "Executing: $step"
        eval "$step"
    fi
done

if [ "$MAKE_SERVICE_CALLS" = true ]; then
    echo ""
    echo "--- Execution Steps ---"
    echo "$CONFIG" | jq -r '.executeSteps[]?' | while IFS= read -r step; do
        if [ -n "$step" ] && [ "$step" != "null" ]; then
            echo "Executing: $step"
            eval "$step"
        fi
    done
fi

#Execute validation steps
# echo ""
# echo "--- Validation Steps ---"
# echo "$CONFIG" | jq -r '.validateSteps[]?' | while IFS= read -r step; do
#     if [ -n "$step" ] && [ "$step" != "null" ]; then
#         echo "Executing: $step"
#         eval "$step"
#     fi
# done

# Return to original directory
cd "$ORIGINAL_DIR"

echo "✅ Validation completed"