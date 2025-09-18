#!/bin/bash
set -e

LANGUAGE=$1
CHANGED_SAMPLES_FILE=$2
MAKE_SERVICE_CALLS=$3

echo "Validating $LANGUAGE samples..."

# Determine which samples to validate
if [ -n "$CHANGED_SAMPLES_FILE" ] && [ -f "$CHANGED_SAMPLES_FILE" ] && [ -s "$CHANGED_SAMPLES_FILE" ]; then
    echo "Using changed samples: $CHANGED_SAMPLES_FILE"
    SAMPLES_FILE="$CHANGED_SAMPLES_FILE"
else
    echo "No $LANGUAGE samples changes found."
    exit 0
fi

# Validate each sample
> validation-success.log
> validation-errors.log

while IFS= read -r sample_dir; do
    if [ -d "$sample_dir" ]; then
        echo ""
        echo "=== Validating: $sample_dir ==="
        if ./scripts/validate-single-sample.sh "$sample_dir" "$MAKE_SERVICE_CALLS" "$LANGUAGE"; then
            echo "✅ $sample_dir" >> validation-success.log
        else
            echo "❌ $sample_dir" >> validation-errors.log
        fi
    fi
done < "$SAMPLES_FILE"

# Report results
echo ""
echo "=== Results ==="
if [ -s validation-success.log ]; then
    echo "Passed $(wc -l < validation-success.log) samples:"
    cat validation-success.log
fi

if [ -s validation-errors.log ]; then
    echo "Failed $(wc -l < validation-errors.log) samples:"
    cat validation-errors.log
    echo "##vso[task.complete result=SucceededWithIssues;]Sample validation failures found"
    exit 0
fi

echo "All $LANGUAGE samples passed!"
