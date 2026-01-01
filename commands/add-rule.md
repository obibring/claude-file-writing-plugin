---
name: add-rule
description: Create a new file writing rule scoped to a pathname and optional file types
allowed-tools:
  - Bash
  - AskUserQuestion
argument-hint: "[pathname] [file_types] [rule]"
---

# Add File Writing Rule

Create a new rule that applies to files at a specific pathname, optionally scoped to specific file types.

## Parameters

- `pathname` (optional): Directory or file path relative to project root
- `file_types` (optional): Space or comma-separated list of file types
- `rule` (optional): The rule content

## Behavior

### Interactive Mode

If any required parameter is missing, prompt the user:

1. **Pathname**: Ask for the directory or file path (e.g., `apps/dashboard`, `src/components`)
2. **File types** (optional): Ask for file types, comma or space-separated (e.g., `typescript javascript`). User can leave empty for "applies to all files"
3. **Rule content**: Ask for the rule text

### Rule Optimization

After the user provides the rule content:

1. **Rewrite the rule** to be succinct and optimized for Claude's understanding
2. **Present three options**:
   - Use the rewritten version
   - Keep the original version
   - Regenerate a new version

3. If user chooses "regenerate":
   - Ask what was wrong with the previous version
   - Generate a new rewritten version
   - Repeat the options

### Parameterized Mode

If `pathname` and `rule` are both provided as parameters, skip interactive prompts and use the rule optimization flow only.

## Implementation

Use the rules engine script:

```bash
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js add-rule \
  --pathname "<pathname>" \
  --file-types "<file_types>" \
  --rule "<rule_content>"
```

## Output

Display the complete rule object including:
- `id`: Generated unique identifier
- `last_updated`: Timestamp
- `file_types`: Array of file types (empty = applies to all)
- `rule`: The rule content

## Example Usage

### Interactive

```
User: /add-rule
Claude: What pathname should this rule apply to? (e.g., apps/dashboard, src/components)
User: apps/dashboard
Claude: What file types should this rule apply to? (optional, comma or space-separated, e.g., "typescript javascript")
User: typescript
Claude: What is the rule content?
User: All components must use named exports instead of default exports
Claude: I've rewritten your rule for clarity:

Original:
"All components must use named exports instead of default exports"

Rewritten:
"Use named exports (export const ComponentName) instead of default exports (export default ComponentName)"

Would you like to:
1. Use the rewritten version
2. Keep the original version
3. Regenerate a new version

User: 1
Claude: [Creates rule and displays full rule object]
```

### Parameterized

```
User: /add-rule apps/dashboard typescript "All components must use named exports"
Claude: [Shows rewrite options, then creates rule]
```

## Tips

- Use directory paths (not file paths) to apply rules to all files in that directory
- Leave file_types empty to apply the rule to all file types
- Rules cascade: parent directory rules apply to child directories
- Rule IDs include the pathname for fast lookup
