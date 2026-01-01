---
name: delete-rule-by-id
description: Delete a rule by its ID (requires confirmation)
allowed-tools:
  - Bash
  - AskUserQuestion
argument-hint: "<id>"
---

# Delete Rule By ID

Permanently delete a rule from the repository. This operation cannot be undone.

## Parameters

- `id` (required): The rule ID to delete

## Behavior

1. Fetch the rule by ID
2. Display the full rule to the user
3. Ask for explicit confirmation
4. If confirmed, delete the rule and show success message
5. If not confirmed, cancel the operation

## Confirmation Flow

Before deletion, always:

1. Show the complete rule object being deleted
2. Highlight key information (pathname, file_types, rule content)
3. Ask: "Are you sure you want to delete this rule? (yes/no)"
4. Only proceed on explicit "yes" response

## Implementation

Use the rules engine script:

```bash
# Delete rule by ID
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js delete-rule-by-id --id "<id>"
```

## Output Format

### Before Deletion (Confirmation)

```
You are about to delete this rule:

ID: apps/dashboard:1704067200000_abc123
Pathname: apps/dashboard
File Types: typescript, javascript
Last Updated: 2024-01-01T00:00:00.000Z
Rule: All components must use named exports

Are you sure you want to delete this rule? This cannot be undone.
```

### After Deletion

```
Rule deleted successfully: apps/dashboard:1704067200000_abc123
```

### Cancelled

```
Deletion cancelled. Rule not deleted.
```

## Example Usage

### Successful Deletion

```
User: /delete-rule-by-id apps/dashboard:1704067200000_abc123
Claude: You are about to delete this rule:

ID: apps/dashboard:1704067200000_abc123
Pathname: apps/dashboard
File Types: typescript
Last Updated: 2024-01-01T00:00:00.000Z
Rule: All components must use named exports

Are you sure you want to delete this rule? This cannot be undone. (yes/no)

User: yes
Claude: Rule deleted successfully: apps/dashboard:1704067200000_abc123
```

### Cancelled Deletion

```
User: /delete-rule-by-id apps/dashboard:1704067200000_abc123
Claude: [Shows rule details and confirmation prompt]

User: no
Claude: Deletion cancelled. Rule not deleted.
```

### Rule Not Found

```
User: /delete-rule-by-id nonexistent:12345
Claude: Error: Rule not found: nonexistent:12345

Use /get-rules to find valid rule IDs.
```

## Important Notes

- **Deletion is permanent** - there is no undo
- **Confirmation is mandatory** - cannot be bypassed
- **Rule preview** ensures you're deleting the right rule
- **File is rewritten** immediately upon deletion

## Tips

- Use `/get-rules` to verify the rule ID before deletion
- Review the rule content carefully during confirmation
- Consider updating the rule instead of deleting if content just needs refinement
- Deleting a parent directory rule won't affect child directory rules (they're independent)
- If you accidentally delete a rule, you'll need to recreate it with `/add-rule`

## Safety

The confirmation step is designed to prevent accidental deletion of important rules:

1. Always shows complete rule context
2. Requires explicit "yes" response
3. Provides clear cancellation path
4. Shows helpful error messages for invalid IDs
