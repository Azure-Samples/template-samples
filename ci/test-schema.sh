#!/bin/bash
# Schema validation test script for LKG manifest schema

set -e

echo "Testing Last Known Good (LKG) manifest schema..."

# Install ajv-cli if not already installed
if ! command -v ajv &> /dev/null; then
    echo "Installing ajv-cli..."
    npm install -g ajv-cli
fi

# Validate the example against the schema
echo "Validating example LKG manifest against schema..."
ajv validate -s validation-manifest.schema.json -d validation-manifest-example.json --strict=false

if [ $? -eq 0 ]; then
    echo "✅ Schema validation passed!"
    echo "✅ Example LKG manifest is valid according to the schema"
else
    echo "❌ Schema validation failed!"
    exit 1
fi

echo ""
echo "LKG manifest schema validation test completed successfully!"