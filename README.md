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

All commands are thin forwarding layers that delegate to the `managing-file-writing-rules` skill:

- `/file-writing-rules:add-rule` - Create new rules
- `/file-writing-rules:get-rules` - Retrieve rules by pathname/file types with precedence
- `/file-writing-rules:list-file-types-for-rules` - List all unique file types in the system
- `/file-writing-rules:set-rule-by-id` - Update existing rules by ID
- `/file-writing-rules:delete-rule-by-id` - Remove rules by ID

Commands provide user-facing entry points, while skills contain all implementation logic. This separation allows skill logic to evolve independently without modifying command interfaces.

### Skills

The plugin provides four specialized skills, each with a specific purpose in the rule lifecycle:

1. **file-writing-rules** - Retrieves and presents applicable rules before writing or planning code files (NOT for copying already-planned code)

2. **managing-file-writing-rules** - Interactive rule management through conversation; checks rules BEFORE writing each file's contents to plan files; helps users keep rules current

3. **enforcing-file-writing-rules** - MANDATORY before every Write/Edit tool call; automatically validates content against standards and fixes violations before writing to ensure all code adheres to project conventions

4. **validating-file-writing-rules** - Audits files or directories against project rules to identify violations; provides systematic validation reports with specific details for each file

### Agents

- **rule-validator** - Validates files or directories against applicable rules

## How It Works

The plugin follows a three-stage workflow:

1. **Creation**: Users explicitly create rules through commands or conversational management
2. **Enforcement**: Rules are automatically checked and applied before writing any code
3. **Validation**: Existing code can be audited for compliance with project standards

## Installation

### Via Marketplace (Recommended)

```
/plugin install file-writing-rules
```

### Via GitHub

```
/plugin install https://github.com/obibring/claude-file-writing-plugin
```

### Manual Installation

1. Clone this repository to your Claude Code plugins directory:
   ```bash
   mkdir -p ~/.claude/plugins
   git clone https://github.com/obibring/claude-file-writing-plugin ~/.claude/plugins/file-writing-rules
   ```

2. Enable the plugin in Claude Code settings

### Post-Installation

The plugin automatically stores rules in `.claude/file-writing-rules.generated.json` within the nearest directory containing a `.git` folder.

### Troubleshooting

If commands fail with "Cannot find module" errors, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions to known issues with `CLAUDE_PLUGIN_ROOT`.

## Configuration

**Storage location**: `.claude/file-writing-rules.generated.json` in the nearest git root directory.

The plugin automatically finds the nearest parent directory containing a `.git` folder and stores rules in the `.claude` subdirectory within that git root.

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

### Creating Rules

#### Interactive Mode
```
/file-writing-rules:add-rule
```

Interactive prompts will guide you through:
1. Enter pathname (e.g., `apps/dashboard`)
2. Enter file types (optional, e.g., `typescript javascript`)
3. Enter rule content

#### With Parameters
```
/file-writing-rules:add-rule pathname=src/components file_types=typescript rule="All components must use named exports"
```

### Querying Rules

```
/file-writing-rules:get-rules pathname=apps/dashboard file_types=typescript
```

### Managing Rules in Conversation

Simply mention rules in natural language:
```
"What coding standards apply to src/api files?"
"Update the rule for React components to require PropTypes"
"Show me all rules that affect TypeScript files"
```

The `managing-file-writing-rules` skill will handle these requests interactively.

### Automatic Enforcement

Rules are automatically enforced when Claude writes code. The `enforcing-file-writing-rules` skill runs before every Write/Edit operation to ensure compliance.

### Validating Existing Code

Ask Claude to check compliance:
```
"Check if the files in apps/dashboard violate any rules"
"Validate src/components against project standards"
"Are there any rule violations in the api directory?"
```

Or invoke the rule-validator agent directly for systematic audits.

## Rule Precedence

Rules apply hierarchically from root to deepest directory:
1. Root rules (apply to all files)
2. Parent directory rules
3. Current directory rules

When multiple rules apply, all are enforced (deepest takes precedence for conflicts).

## What's New in v1.1.0

Version 1.1.0 introduces a major architectural shift from pattern-driven to user-controlled rule creation:

### Key Changes

- **User-Controlled Creation**: Rules are only created when users explicitly request them (no automatic suggestions)
- **Expanded Skill System**: Four specialized skills instead of one, each handling a specific phase of the rule lifecycle
- **Mandatory Enforcement**: The `enforcing-file-writing-rules` skill ensures all code adheres to standards before writing
- **Planning Integration**: The `managing-file-writing-rules` skill checks rules BEFORE writing file contents to plan files
- **Systematic Validation**: The `validating-file-writing-rules` skill provides detailed compliance auditing

### Migration from 1.0.x

If you're upgrading from version 1.0.x:
- Your existing rules in `.claude/file-writing-rules.generated.json` remain compatible
- The new skills work automatically - no configuration changes needed
- Pattern-driven rule suggestions have been removed in favor of explicit user control

## Requirements

- Node.js 14+ (for running the rules engine script)
- Claude Code (latest version)
- Basic familiarity with bash/shell commands

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions, including:
- CLAUDE_PLUGIN_ROOT not found errors
- Permission issues with scripts
- Plugin not found after installation
- Rules file creation issues

## License

MIT
