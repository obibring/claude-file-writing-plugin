---
name: file-writing-rules
description: Use when writing or planning code files, before executing Write or Edit tools. NOT when copying already-planned code into files.
---

# File Writing Rules

## Overview

Retrieve and enforce project-specific coding rules based on file pathname and type. Rules cascade hierarchically from root to deepest directory.

## When to Use

Use this skill **before** writing or planning any code file. Trigger conditions:

- About to execute Write tool for new file
- About to execute Edit tool for existing file
- Planning implementation for specific files
- **Do NOT use** when copying pre-approved code

## Core Pattern

### Retrieval

1. **Identify context**: Extract pathname and file type from current task
2. **Query rules engine**: Get precedence-ordered rules for that pathname
3. **Present to self**: Display rules as mandatory constraints

### Execution

```bash
# Get rules for pathname (automatically filters by precedence)
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js get-rules \
  --pathname "<relative_path_to_file>"

# With file type filtering
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js get-rules \
  --pathname "<relative_path_to_file>" \
  --file-types "<file_type>"
```

### Output Format

When rules exist, present them as:

```
=== FILE WRITING RULES ===
You MUST adhere to the following rules when writing this file:

1. <rule content from first rule>
2. <rule content from second rule>
3. <rule content from third rule>
==========================
```

When no rules exist:

```
No specific rules for this file.
```

## Quick Reference

| Scenario | Action |
|----------|--------|
| Writing `apps/dashboard/Button.tsx` | Query `apps/dashboard`, filter by `typescript` |
| Writing `src/utils/helpers.js` | Query `src/utils`, filter by `javascript` |
| Writing `README.md` | Query root, no file type filter |
| No rules found | Show "No specific rules" and proceed |

## Implementation

### Step 1: Extract Context

Identify from conversation:
- Pathname (relative to project root)
- File type (language/extension)

### Step 2: Query Rules Engine

Execute bash command to retrieve rules:

```bash
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js get-rules \
  --pathname "apps/dashboard" \
  --file-types "typescript"
```

### Step 3: Format and Present

Parse JSON output and format as numbered list with header.

**Important:** Rules are already in precedence order (root → deepest). Present them in that order.

### Step 4: Apply

Treat all rules as **mandatory constraints** during code writing. All rules apply - they are additive, not exclusive.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping skill for "small edits" | Always check rules, even for minor changes |
| Querying wrong pathname | Use directory path, not full file path with extension |
| Forgetting file type filter | Include file type for language-specific rules |
| Ignoring "no rules" output | It's valid - means no constraints for this path |
| Treating rules as suggestions | Rules are mandatory, not optional guidelines |

## Error Handling

**Rules file doesn't exist**: Skill will show "No specific rules" - this is normal for projects without rules set up yet

**Invalid pathname**: Rules engine returns empty array - handle gracefully

**Script execution fails**: Report error to user and proceed without rules (degraded mode)

## Integration with Commands

This skill complements the rule management commands:

- `/add-rule`: Users create rules
- `/get-rules`: Users query rules manually
- **This skill**: Automatically enforces rules during coding

## Real-World Impact

- **Consistency**: Ensures all code follows project standards automatically
- **Onboarding**: New contributors (human or AI) get instant guidance
- **Context-aware**: Rules adapt to directory structure and file types
- **Zero overhead**: No manual lookup - rules apply automatically
