# Validation Pipeline, Making Service Calls

Make service calls as a means of validating generated samples.

Foundry UX has many variations of scenarios across all languages (JS, Go, Java, C#, Python)
- Even larger if models are supported
- i.e., the number of samples gets very large quickly

---

## Questions to Consider:
- What does a baseline group of samples look like?
- How can we select which tests do/don't run?
- When making service calls, what does success look like? (e.g. any response? only 200s?)

---

## Service Validation Execution:
- How is a service validation run requested? For both:
  - Manually (who can request? What params are needed or optional?)
  - Automated (how often or based on what criteria?)

---

## Triggers for Service Validation:
- A sample changed (how to track? do we commit generated samples somewhere to then diff against?)
- the client library is updated (and/or other dependencies?)

---

## Tracking Whitelisted Samples:
If we check in validated samples, how can we track the details from their run?
e.g., last run model/resources used, dependency versions, etc.
- build manifest and and insert entries for each run? e.g.
    - `gpt-46` — Nov. 7 — OPENAI 2.3
    - `gpt-5` — Nov. 9 — OPENAI 2.3
    - `ol-main` — Nov. 10 — OPENAI 2.4
