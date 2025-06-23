#!/bin/bash
set -e

LANGUAGE=$1
PIPELINE_WORKSPACE=$2
CHANGED_SAMPLES_FILE="$PIPELINE_WORKSPACE/ChangedSamples/changed_samples.txt"

echo "Validating $LANGUAGE samples..."

if [ ! -f "$CHANGED_SAMPLES_FILE" ]; then
    echo "No changed samples file found. Validating all samples."
    find generated-samples/$LANGUAGE -name "*.csproj" -exec dirname {} \; > all_samples.txt
    SAMPLES_FILE="all_samples.txt"
else
    SAMPLES_FILE="$CHANGED_SAMPLES_FILE"
fi

while IFS= read -r sample_dir; do
    if [ -d "$sample_dir" ]; then
        echo "Validating sample: $sample_dir"
        ./scripts/validate-single-sample.sh "$sample_dir"
    fi
done < "$SAMPLES_FILE"