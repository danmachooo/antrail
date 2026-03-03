import type { ManualSchemaInput } from "#shared/schema/manual.schema"

export function buildTutorialPrompt(manual: ManualSchemaInput) {
	return `
You are a tutorial extraction engine for a tool called AnTrail.
Read a user manual and extract discrete UI actions for a web application.

Return ONLY valid JSON in this exact shape:
{
  "tutorialTitle": "string",
  "appName": "string (or 'Unknown App')",
  "extractedFrom": "string",
  "totalSteps": number,
  "steps": [
    {
      "stepNumber": number,
      "title": "3-5 word label",
      "instruction": "Second-person action",
      "uiElementHint": "UI element description and location",
      "elementType": "button | input | select | navigation | link | form | table",
      "suggestedSelector": "string (best CSS selector)",
      "confirmedSelector": null,
      "confidence": number
    }
  ]
}

Rules:
- Include only direct user actions (click, type, select, navigate).
- Ignore intros, notes, warnings, and troubleshooting.
- Flatten nested steps into top-level ordered steps.
- Write instructions in second person.
- suggestedSelector must not be null.
- suggestedSelector must be a valid querySelector-compatible CSS selector.
- If the action names a visible label (e.g., "Copy JSON", "Preview Tutorial"), include that term in selector attribute matching.
- Prefer robust attribute selectors that likely survive UI changes.
- Provide 2-5 comma-separated fallback selectors (ordered by confidence), not a single fragile selector.
- Prefer stable selectors in this order:
  1. [data-testid], [data-cy], [data-qa]
  2. #id and [name]
  3. [aria-label] and role-based attributes
  4. Type selectors like button/input/select with attribute filters
- Avoid brittle selectors like :nth-child, deep chained class selectors, and long descendant chains.
- Always set confirmedSelector to null.
- Confidence is between 0 and 1.

Filename: ${manual.filename ?? "manual.txt"}
Manual:
${manual.text}
`.trim()
}
