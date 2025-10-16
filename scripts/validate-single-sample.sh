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

IN_PIPELINE_TEST_DIR=false
if [ "$MAKE_SERVICE_CALLS" = true ]; then
    TEST_DIR="test"
    if [ -d "$TEST_DIR" ]; then
        echo ""
        echo "Service validation requested and detected a '$TEST_DIR' directory. Proceeding to run tests from subdirectory."
        echo ""

        cd "$TEST_DIR"
        IN_PIPELINE_TEST_DIR=true
    fi
fi

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

if [ "$MAKE_SERVICE_CALLS" = true ] && [ "$IN_PIPELINE_TEST_DIR" = true ]; then
    echo "--- Execution Steps ---"
    echo "$CONFIG" | jq -r '.executeSteps[]?' | while IFS= read -r step; do
        if [ -n "$step" ] && [ "$step" != "null" ]; then
            echo "Executing: $step"
            eval "$step"
        fi
    done
else
    echo "⚠️ Service validation is requested but no '$TEST_DIR' directory was found. Skipping validation."
    exit 1
fi

# Execute validation steps
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