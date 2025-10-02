# Validation Pipeline Sequence, outline

-  **Generate all samples**
-  **Identify which samples have changes, grouped by language**
    - **Tag sample for service validation?**
    (Samples are always compiled, at a minimum for validation)

---

## For each sample group (aka language group):

- **Compile for validity**
  - Failures are noted and will be excluded from further actions

---

## For each compiled sample:

- **If tagged for service validation:**
  - Run sample against service
      - Failures are noted and excluded from further actions

---

## Samples that succeed::

- Added to packaging
- Committed to repo along with their validation notes/details
