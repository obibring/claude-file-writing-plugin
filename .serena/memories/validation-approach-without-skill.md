# How to Validate File Rules Without a Dedicated Skill

## Approach Demonstrated

When asked to validate if a file follows project rules without a dedicated validation skill, here's what an agent would naturally do:

### Step 1: Load Rule Definitions
- Read `.claude/file-writing-rules.generated.json` to understand all project rules
- Parse the rules hierarchically (global, directory-level, file-type-specific)
- Identify which rules apply to the target file based on:
  - File path (matches directory hierarchy)
  - File type (TypeScript, TSX, etc.)

### Step 2: Locate and Read Target File
- Use Glob patterns to find the file if path is uncertain
- Read the complete file content
- If file doesn't exist, report clearly and stop

### Step 3: Manual Analysis Against Rules
- For each applicable rule, analyze the file content manually
- Look for patterns that violate or satisfy the rule
- Document findings with specific line numbers and code snippets

### Step 4: Report Findings
- Create a structured validation report with:
  - File path
  - Applicable rules
  - Compliance status for each rule
  - Specific evidence (line numbers, code snippets)
  - Recommendations for fixes

## Current Project Rules

From .claude/file-writing-rules.generated.json:

1. **Global Rule**: All files must include copyright header at the top
2. **src/ Directory Rule**: Use strict TypeScript with no implicit any
3. **src/components/ Rule**: All React components must use named exports and include PropTypes

## Validation Request Analysis

File: `src/api/users.ts`
Status: File does not exist in current project

### What Would Happen If It Existed

If `src/api/users.ts` existed, the validation would check:

1. Does it have a copyright header? (Global rule)
2. Does it use strict TypeScript with no implicit any? (src/ rule)
3. Any special rules for `src/api/`? (None defined in current rules)

### How Agent Would Report Violations

If async functions existed without try-catch:
- This wouldn't violate any *defined* project rules
- However, agent could flag it as a best-practice concern
- Could suggest creating a rule for `src/api/` if error handling is critical

## Key Insights

**Limitations Without a Skill:**
- Must manually implement validation logic for each rule type
- No systematic way to update or extend rules
- Validation logic lives in agent reasoning, not persistent code
- Prone to inconsistent application across different validations

**What a Validation Skill Would Provide:**
- Reusable, versioned validation logic
- Consistent rule application
- Ability to extend rules without code changes
- Repeatable, testable validation process
- Clear separation of concerns

## Natural Agent Behavior

Without a dedicated skill, agents will:
1. Load configuration files
2. Read the target file
3. Parse rules manually
4. Apply them through reasoning
5. Generate a report
6. Suggest fixes or improvements

This works but doesn't scale well for complex projects with many rules.
