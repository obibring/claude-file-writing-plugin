---
name: list-file-types
description: List all unique file types referenced in rules with their usage counts
allowed-tools:
  - Bash
argument-hint: "[max_age]"
---

# List File Types

Display all unique file types that have rules defined, sorted alphabetically with usage counts.

## Parameters

- `max_age` (optional): Only include file types from rules updated within this timeframe (e.g., "30m", "6h", "2d")

## Behavior

1. Scan all rules in the repository
2. Extract unique file types (rules with empty file_types don't contribute)
3. Count how many rules reference each file type
4. Sort alphabetically
5. Display with counts

## Implementation

Use the rules engine script:

```bash
# List all file types
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js list-file-types

# With max age filter
node $CLAUDE_PLUGIN_ROOT/scripts/rules-engine.js list-file-types --max-age "<max_age>"
```

## Output Format

Display a formatted list showing:
- File type name
- Count of rules that reference it

Format: `<file_type> (<count> rules)`

## Example Usage

### Basic List

```
User: /list-file-types
Claude: File types with rules defined:

- javascript (8 rules)
- python (5 rules)
- typescript (12 rules)
```

### With Max Age Filter

```
User: /list-file-types 7d
Claude: File types with rules defined (updated within 7d):

- python (2 rules)
- typescript (4 rules)
```

### No File Types

```
User: /list-file-types
Claude: No file types found. All rules apply to all file types.
```

## Use Cases

- **Discover languages**: See which languages have specific rules
- **Audit coverage**: Identify languages that need more rules
- **Recent changes**: Use max-age to see recently updated rule categories
- **Project insights**: Understand which file types have the most constraints

## Tips

- File types are exactly as specified when creating rules (case-sensitive)
- Use consistent naming (e.g., "typescript" not "ts" or "TypeScript")
- Rules with empty file_types array apply to all files and don't appear here
- Counts reflect how many rules reference the file type, not unique rules
