#!/bin/bash
set -e

SAMPLE_DIR=$1
MANIFEST_PATH=$2

if [ -z "$MANIFEST_PATH" ]; then
    MANIFEST_PATH="validation-manifest.json"
fi

if [ ! -f "$MANIFEST_PATH" ]; then
    echo "Error: Validation manifest not found at $MANIFEST_PATH" >&2
    exit 1
fi

LANGUAGE=$(echo "$SAMPLE_DIR" | cut -d'/' -f2)
SAMPLE_NAME=$(echo "$SAMPLE_DIR" | cut -d'/' -f3)

echo "Resolving config for language: $LANGUAGE, sample: $SAMPLE_NAME" >&2

# Get language defaults
LANGUAGE_CONFIG=$(jq --arg lang "$LANGUAGE" '.languageDefaults[$lang]' "$MANIFEST_PATH")

if [ "$LANGUAGE_CONFIG" = "null" ]; then
    echo "Error: No language defaults found for $LANGUAGE" >&2
    exit 1
fi

# Check for sample-specific overrides
SAMPLE_OVERRIDE=$(jq --arg sample "$SAMPLE_NAME" --arg lang "$LANGUAGE" '.sampleOverrides[$sample][$lang] // null' "$MANIFEST_PATH")

if [ "$SAMPLE_OVERRIDE" != "null" ]; then
    # Merge language defaults with sample overrides
    echo "Merging configs for sample $SAMPLE_NAME" >&2
    echo "$LANGUAGE_CONFIG $SAMPLE_OVERRIDE" | jq -s 'add'
else
    # Just use language defaults
    echo "$LANGUAGE_CONFIG"
fi