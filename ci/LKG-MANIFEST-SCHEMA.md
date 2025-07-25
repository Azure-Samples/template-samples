# Last Known Good (LKG) Manifest Schema

This document describes the JSON schema for the Last Known Good manifest (`lkg-manifest.json`) that tracks the last validated versions of Azure OpenAI template samples for the packaging pipeline.

## Overview

The LKG manifest serves a single, critical purpose: tracking the last known good version for each sample relative to the package versions published to the feed by the pipeline. This enables the packaging pipeline to:

- Pull samples from appropriate package versions when creating new releases
- Ensure published packages always contain valid samples without gaps
- Roll back to previous versions when current samples are failing

## Schema Location

The JSON Schema is defined in [`validation-manifest.schema.json`](validation-manifest.schema.json) and follows JSON Schema Draft 2020-12.

## Use Case

When the pipeline runs validation and some samples fail, instead of publishing a package with gaps, the pipeline can:

1. Use this manifest to identify the last known good version for each failing sample
2. Pull those versions from previous packages  
3. Combine them with newly validated samples
4. Publish a complete package with all working samples

## Schema Structure

### Root Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `lastUpdated` | string | ✓ | ISO 8601 timestamp when this manifest was last updated |
| `samples` | object | ✓ | Last known good information for each sample, keyed by sample path |

### Sample Object

Each sample in the `samples` object has the following structure:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `lastValidated` | string | ✓ | ISO 8601 timestamp when this sample was last successfully validated |
| `version` | string | ✓ | Package version (semver) that contains the last known good version of this sample |
| `status` | string | ✓ | Status of the sample - always "validated" (only validated samples are tracked) |

## Example

```json
{
  "lastUpdated": "2025-07-25T22:15:52Z",
  "samples": {
    "csharp/chat-completion": {
      "lastValidated": "2025-07-25T22:15:52Z",
      "version": "1.2.3",
      "status": "validated"
    },
    "python/chat-completion": {
      "lastValidated": "2025-07-20T15:30:00Z", 
      "version": "1.2.1",
      "status": "validated"
    }
  }
}
```

## Pipeline Integration

### Updating the Manifest

When the validation pipeline runs:

1. For each sample that passes validation, update its entry with the current timestamp and package version
2. For samples that fail validation, leave their existing entries unchanged
3. Update the `lastUpdated` timestamp

### Using the Manifest for Packaging

When creating a package:

1. Start with all currently validated samples
2. For any missing or failed samples, consult the LKG manifest to find the last validated version
3. Pull those sample versions from the corresponding package in the feed
4. Combine into a complete package with no gaps

## Schema Validation

Test the schema with the provided example:

```bash
cd ci
./test-schema.sh
```

This ensures the manifest structure is valid and ready for pipeline consumption.