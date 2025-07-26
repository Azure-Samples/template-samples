#!/bin/bash
set -e

SAMPLE_DIR=$1
JSON_OUTPUT_MODE=${2:-false}

# Resolve configuration
CONFIG=$(./scripts/resolve-sample-configs.sh "$SAMPLE_DIR")
LANGUAGE=$(echo "$CONFIG" | jq -r '.language')

# Start timing
START_TIME=$(date +%s)
START_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ "$JSON_OUTPUT_MODE" != "true" ]; then
    echo "Language: $LANGUAGE"
fi

# Save current directory and change to sample directory
ORIGINAL_DIR=$(pwd)
cd "$SAMPLE_DIR"

# Initialize result tracking
VALIDATION_STATUS="validated"
ERROR_MESSAGE=""

# Execute build steps
if [ "$JSON_OUTPUT_MODE" != "true" ]; then
    echo ""
    echo "--- Build Steps ---"
fi

# Handle build steps with error capture
if ! echo "$CONFIG" | jq -r '.buildSteps[]?' | while IFS= read -r step; do
    if [ -n "$step" ] && [ "$step" != "null" ]; then
        if [ "$JSON_OUTPUT_MODE" != "true" ]; then
            echo "Executing: $step"
        fi
        if [ "$JSON_OUTPUT_MODE" = "true" ]; then
            eval "$step" >&2 2>&1
        else
            eval "$step"
        fi
    fi
done; then
    VALIDATION_STATUS="failed"
    ERROR_MESSAGE="Build step failed"
fi

# Execute preBuildSteps if they exist
if [ "$VALIDATION_STATUS" = "validated" ]; then
    if ! echo "$CONFIG" | jq -r '.preBuildSteps[]?' 2>/dev/null | while IFS= read -r step; do
        if [ -n "$step" ] && [ "$step" != "null" ]; then
            if [ "$JSON_OUTPUT_MODE" != "true" ]; then
                echo "Executing pre-build: $step"
            fi
            if [ "$JSON_OUTPUT_MODE" = "true" ]; then
                eval "$step" >&2 2>&1
            else
                eval "$step"
            fi
        fi
    done; then
        VALIDATION_STATUS="failed"
        ERROR_MESSAGE="Pre-build step failed"
    fi
fi

# Execute validation steps
if [ "$VALIDATION_STATUS" = "validated" ]; then
    if [ "$JSON_OUTPUT_MODE" != "true" ]; then
        echo ""
        echo "--- Validation Steps ---"
    fi
    
    if ! echo "$CONFIG" | jq -r '.validateSteps[]?' | while IFS= read -r step; do
        if [ -n "$step" ] && [ "$step" != "null" ]; then
            if [ "$JSON_OUTPUT_MODE" != "true" ]; then
                echo "Executing: $step"
            fi
            if [ "$JSON_OUTPUT_MODE" = "true" ]; then
                eval "$step" >&2 2>&1
            else
                eval "$step"
            fi
        fi
    done; then
        VALIDATION_STATUS="failed"
        ERROR_MESSAGE="Validation step failed"
    fi
fi

# Return to original directory
cd "$ORIGINAL_DIR"

# Calculate timing
END_TIME=$(date +%s)
END_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DURATION=$((END_TIME - START_TIME))

if [ "$JSON_OUTPUT_MODE" = "true" ]; then
    # Output structured JSON for aggregation
    jq -n \
        --arg samplePath "$SAMPLE_DIR" \
        --arg status "$VALIDATION_STATUS" \
        --arg language "$LANGUAGE" \
        --arg startTime "$START_ISO" \
        --arg endTime "$END_ISO" \
        --argjson duration "$DURATION" \
        --argjson config "$CONFIG" \
        --arg error "$ERROR_MESSAGE" \
        '{
            samplePath: $samplePath,
            status: $status,
            language: $language,
            startTime: $startTime,
            endTime: $endTime,
            duration: $duration,
            config: $config,
            error: ($error | if . == "" then null else . end)
        }'
else
    # Traditional output mode
    if [ "$VALIDATION_STATUS" = "validated" ]; then
        echo "✅ Validation completed"
        exit 0
    else
        echo "❌ Validation failed: $ERROR_MESSAGE"
        exit 1
    fi
fi