# File Writing Rules Plugin

Hierarchical rules system for Claude Code that stores and enforces coding best practices based on directory structure and file types.

## Overview

This plugin provides a sophisticated rules repository that:
- Stores rules scoped to relative pathnames from the package root
- Optionally scopes rules to specific file types (e.g., TypeScript, Python)
- Applies rules hierarchically from root to deepest directory
- Automatically enforces rules when writing or planning code
- Validates existing code against applicable rules

## Features

### Commands

- `/file-writing-rules:add-rule` - Create new rules (interactive or parameterized)
- `/file-writing-rules:get-rules` - Retrieve rules by pathname/file types with precedence
- `/file-writing-rules:list-file-types` - List all unique file types in the system
- `/file-writing-rules:set-rule-by-id` - Update existing rules by ID
- `/file-writing-rules:delete-rule-by-id` - Remove rules by ID

### Skills

- **file-writing-rules** - Automatically retrieves and applies applicable rules when writing or planning code

### Agents

- **rule-validator** - Validates files or directories against applicable rules

## Installation

1. Copy this plugin to your Claude Code plugins directory
2. Enable the plugin in Claude Code settings
3. (Optional) Configure custom rules file location in `.claude/file-writing-rules.local.md`

## Configuration

Create `.claude/file-writing-rules.local.md` in your project root:

```markdown
# File Writing Rules Configuration

rules-file-path: .claude/custom-rules.generated.json
```

**Default storage location**: `.claude/file-writing-rules.generated.json`

## Rule Structure

Rules are stored hierarchically based on directory paths:

```json
{
  "apps": {
    "_rules_": [],
    "dashboard": {
      "_rules_": [
        {
          "id": "apps/dashboard:1704067200000_abc123",
          "last_updated": "2024-01-01T00:00:00.000Z",
          "file_types": ["typescript"],
          "rule": "All components must use named exports"
        }
      ]
    }
  }
}
```

### Rule Object

Every rule contains:
- `id`: Unique identifier (pathname:unique_suffix)
- `last_updated`: ISO timestamp
- `file_types`: Array of file types (empty = applies to all)
- `rule`: Rule content

## Usage Examples

### Adding a Rule

```
/file-writing-rules:add-rule
```

Interactive prompts will guide you through:
1. Enter pathname (e.g., `apps/dashboard`)
2. Enter file types (optional, e.g., `typescript javascript`)
3. Enter rule content

### Getting Rules

```
/file-writing-rules:get-rules pathname=apps/dashboard file_types=typescript
```

### Validating Code

Invoke the rule-validator agent:
```
Check if the files in apps/dashboard violate any rules
```

## Rule Precedence

Rules apply hierarchically from root to deepest directory:
1. Root rules (apply to all files)
2. Parent directory rules
3. Current directory rules

When multiple rules apply, all are enforced (deepest takes precedence for conflicts).

## Requirements

- Node.js 18+
- Claude Code (latest version)

## License

MIT
