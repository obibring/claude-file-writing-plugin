---
name: set-rule-by-id
description: Update an existing rule by its ID (supports updating content, file types, or moving to new pathname)
allowed-tools:
  - Bash
  - AskUserQuestion
argument-hint: "<id> [pathname] [file_types] [rule]"
---

# Set Rule By ID

Update an existing rule's content, file types, or pathname. Moving a rule to a new pathname updates its ID.

## Parameters

- `id` (required): The rule ID to update
- `pathname` (optional): New pathname (moves the rule)
- `file_types` (optional): New file types (comma or space-separated)
- `rule` (optional): New rule content

## Behavior

### Interactive Mode

If only `id` is provided, prompt the user to select which fields to update:

1. Ask which fields to modify (pathname, file_types, rule)
2. For selected fields, prompt for new values
3. If updating rule content, use the rule optimization flow (rewrite/confirm)
4. If moving (changing pathname), show confirmation with ID change notice

### Parameterized Mode

If `id` and at least one update field are provided, apply updates directly:

1. If rule content is being updated, use the rule optimization flow
2. If pathname is being updated, show confirmation

### Rule Optimization

When updating rule content:

1. Rewrite the rule to be succinct and optimized for Claude's understanding
2. Present three options:
   - Use the rewritten version
   - Keep the original version
   - Regenerate a new version

3. If user chooses "regenerate":
   - Ask what was wrong with the previous version
   - Generate a new rewritten version
   - Repeat the options

### Move Confirmation

When changing pathname:

1. Show the old ID and new ID
2. Explain that the rule will be moved and its ID will change
3. Require explicit confirmation before proceeding

## Implementation

Use the rules engine script:

```bash
# Update rule content only
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js set-rule-by-id \
  --id "<id>" \
  --rule "<new_rule>"

# Update file types
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js set-rule-by-id \
  --id "<id>" \
  --file-types "<new_file_types>"

# Move to new pathname
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js set-rule-by-id \
  --id "<id>" \
  --pathname "<new_pathname>"

# Update multiple fields
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js set-rule-by-id \
  --id "<id>" \
  --pathname "<new_pathname>" \
  --file-types "<new_file_types>" \
  --rule "<new_rule>"
```

## Output Format

Display a before/after comparison:

```
BEFORE:
{
  "id": "apps/dashboard:1704067200000_abc123",
  "last_updated": "2024-01-01T00:00:00.000Z",
  "file_types": ["typescript"],
  "rule": "Original rule content"
}

AFTER:
{
  "id": "apps/dashboard:1704067500000_def456",
  "last_updated": "2024-01-01T12:00:00.000Z",
  "file_types": ["typescript", "javascript"],
  "rule": "Updated rule content"
}
```

## Example Usage

### Interactive Update

```
User: /set-rule-by-id apps/dashboard:1704067200000_abc123
Claude: What would you like to update for this rule?
- pathname
- file_types
- rule
- multiple fields

User: rule
Claude: Current rule: "All components must use named exports"

What is the new rule content?
User: Components should use named exports and include JSDoc comments
Claude: [Shows rewrite options, confirms, then displays before/after]
```

### Parameterized Update

```
User: /set-rule-by-id apps/dashboard:1704067200000_abc123 rule "Use named exports"
Claude: [Shows rewrite options, confirms, then displays before/after]
```

### Moving a Rule

```
User: /set-rule-by-id apps/dashboard:1704067200000_abc123 apps/shared
Claude: This will move the rule from 'apps/dashboard' to 'apps/shared'.

The rule ID will change:
- Old ID: apps/dashboard:1704067200000_abc123
- New ID: apps/shared:1704067500000_def456

Confirm this move? (yes/no)
User: yes
Claude: [Displays before/after comparison]
```

### Update Multiple Fields

```
User: /set-rule-by-id apps/dashboard:1704067200000_abc123 apps/shared "typescript javascript" "New rule"
Claude: This will move the rule and update multiple fields.
[Shows confirmation, then before/after]
```

## Important Notes

- **ID changes** when pathname changes (rule is moved)
- **last_updated** always updates to current timestamp
- Moving preserves all other fields unless explicitly updated
- File types are replaced entirely (not merged)
- Provide empty string for file_types to clear (apply to all files)

## Tips

- Use `/get-rules` first to find the rule ID you want to update
- Test moves on non-critical rules first
- Update multiple fields at once to avoid multiple updates
- Rewrite feature helps maintain consistent rule quality
