#!/bin/bash
set -e

SAMPLE_DIR=$1
CONFIG_FILE="$SAMPLE_DIR/.sample-config.json"

echo "Validating sample in: $SAMPLE_DIR"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: No .sample-config.json found in $SAMPLE_DIR"
    exit 1
fi

# Parse config file
LANGUAGE=$(jq -r '.language' "$CONFIG_FILE")
BUILD_COMMAND=$(jq -r '.buildCommand' "$CONFIG_FILE")

cd "$SAMPLE_DIR"

# Step 1: Check for outdated dependencies (informational only)
echo "Checking for outdated dependencies..."
case $LANGUAGE in
    "csharp")
        # Check for outdated packages but don't update them
        echo "Running: dotnet list package --outdated"
        dotnet list package --outdated || echo "Warning: Could not check for outdated packages"
        ;;
esac

# Step 2: Restore dependencies
echo "Restoring dependencies..."
case $LANGUAGE in
    "csharp")
        dotnet restore
        ;;
esac

# Step 3: Build/Compile
echo "Building sample..."
eval "$BUILD_COMMAND"

# Step 4: Run basic validation (if specified)
TEST_COMMAND=$(jq -r '.testCommand // empty' "$CONFIG_FILE")
if [ -n "$TEST_COMMAND" ]; then
    echo "Running test command..."
    eval "$TEST_COMMAND"
fi

echo "✅ Sample validation completed successfully: $SAMPLE_DIR"