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

# Step 1: Update dependencies to latest versions
echo "Updating dependencies to latest versions..."
case $LANGUAGE in
    "csharp")
        # Get all PackageReference items and update them
        dotnet list package --outdated --format json > outdated.json
        if [ -s outdated.json ] && [ "$(jq '.projects | length' outdated.json)" -gt 0 ]; then
            jq -r '.projects[].frameworks[].topLevelPackages[]? | select(.latestVersion) | "dotnet add package \(.id) --version \(.latestVersion)"' outdated.json | bash
        fi
        rm -f outdated.json
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