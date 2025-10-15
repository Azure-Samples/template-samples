#!/bin/bash
set -e

VALIDATION_RESULTS_FILE=$1

echo "DEBUG: Processing validation file: '$VALIDATION_RESULTS_FILE'"

# Check validation results input file is provided
if [ -n "$VALIDATION_RESULTS_FILE" ] && [ -f "$VALIDATION_RESULTS_FILE" ] && [ -s "$VALIDATION_RESULTS_FILE" ]; then
    echo "Removing unvalidated samples: $VALIDATION_RESULTS_FILE"
else
    echo "No unvalidated samples found (file: '$VALIDATION_RESULTS_FILE')"
    if [ ! -f "$VALIDATION_RESULTS_FILE" ]; then
        echo "DEBUG: File does not exist"
    elif [ ! -s "$VALIDATION_RESULTS_FILE" ]; then
        echo "DEBUG: File exists but is empty"
    fi
    exit 0
fi

while IFS= read -r line; do
  echo "DEBUG: Processing line: '$line'"
  
  # skip lines that don't contain ❌
  if [[ "$line" != *❌* ]]; then 
    printf 'Skipping: %s\n' "$line"
    continue
  fi

  # extract path after ❌
  echo "DEBUG: Extracting path from line with ❌"
  path=$(printf '%s' "$line" | sed -nE 's/^.*❌\s*//p')
  echo "DEBUG: After sed: '$path'"
  path=$(printf '%s' "$path" | tr -d '\r' | sed 's/[[:space:]]*$//')
  echo "DEBUG: After cleanup: '$path'"
  
  if [ -z "$path" ]; then
    echo "DEBUG: Path is empty, continuing"
    continue
  fi

  printf 'Removing: %s\n' "$path"
  if [[ -e "$path" ]]; then
    echo "DEBUG: Path exists, removing"
    rm -rf -- "$path"
  else
    echo "DEBUG: Path does not exist, skipping removal"
  fi

done < "$VALIDATION_RESULTS_FILE"