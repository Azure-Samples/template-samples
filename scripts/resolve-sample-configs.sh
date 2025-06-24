#!/bin/bash
set -e

SAMPLE_DIR=$1
LANGUAGE=$(echo "$SAMPLE_DIR" | cut -d'/' -f2)

# Required language defaults
LANGUAGE_DEFAULTS="generated-samples/$LANGUAGE/.config-defaults.json"
if [ ! -f "$LANGUAGE_DEFAULTS" ]; then
    echo "Error: Missing $LANGUAGE_DEFAULTS" >&2
    exit 1
fi

# Optional sample overrides
SAMPLE_CONFIG="$SAMPLE_DIR/.sample-config.json"

if [ -f "$SAMPLE_CONFIG" ]; then
    # Merge language defaults with sample overrides
    echo "Merging configs" >&2
    jq -s 'add' "$LANGUAGE_DEFAULTS" "$SAMPLE_CONFIG"
else
    # Just use language defaults
    cat "$LANGUAGE_DEFAULTS"
fi