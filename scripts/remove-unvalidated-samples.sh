#!/bin/bash
set -e

VALIDATION_RESULTS_FILE=$1

# Check validation results input file is provided
if [ -n "$VALIDATION_RESULTS_FILE" ] && [ -f "$VALIDATION_RESULTS_FILE" ] && [ -s "$VALIDATION_RESULTS_FILE" ]; then
    echo "Removing unvalidated samples: $VALIDATION_RESULTS_FILE"
else
    echo "No unvalidated samples found."
    exit 0
fi

while IFS= read -r line; do
  # skip lines that don't contain ❌
  if [[ "$line" != *❌* ]]; then 
    printf 'Skipping: %s\n' "$line"
    continue
  fi

  # extract path after ❌
  path=$(printf '%s' "$line" | sed -nE 's/^.*❌\s*//p')
  path=$(printf '%s' "$path" | tr -d '\r' | sed 's/[[:space:]]*$//')
  [ -z "$path" ] && continue

  printf 'Removing: %s\n' "$path"
  [[ -e "$path" ]] && rm -rf -- "$path"

done < "$VALIDATION_RESULTS_FILE"