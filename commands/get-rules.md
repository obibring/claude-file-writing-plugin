---
name: get-rules
description: Retrieve file writing rules for a pathname with precedence ordering
allowed-tools:
  - Bash
argument-hint: "<pathname> [file_types] [max_age]"
---

# Get File Writing Rules

Retrieve all applicable rules for a specific pathname, ordered by precedence (root to deepest).

## Parameters

- `pathname` (required): Directory or file path relative to project root
- `file_types` (optional): Space or comma-separated list of file types to filter by
- `max_age` (optional): Maximum age of rules to include (e.g., "30m", "6h", "2d")

## Behavior

1. Query the rules engine for all rules that apply to the given pathname
2. Rules are returned in **precedence order** (root → deepest directory)
3. Filter by file types if specified (rules with empty file_types apply to all)
4. Filter by max age if specified
5. Display count message followed by the rules array

## Implementation

Use the rules engine script:

```bash
# Basic query
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js get-rules --pathname "<pathname>"

# With file types filter
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js get-rules \
  --pathname "<pathname>" \
  --file-types "<file_types>"

# With max age filter
node ${CLAUDE_PLUGIN_ROOT}/scripts/rules-engine.js get-rules \
  --pathname "<pathname>" \
  --max-age "<max_age>"
```

## Output Format

Display:
1. Count message: `"X rules found for <pathname>"`
2. JSON array of rule objects (empty array if none found)

Each rule object includes:
- `id`: Unique identifier with pathname prefix
- `last_updated`: ISO timestamp
- `file_types`: Array of file types (empty = applies to all)
- `rule`: Full rule content

## Example Usage

### Basic Query

```
User: /get-rules apps/dashboard
Claude: 3 rules found for apps/dashboard
[
  {
    "id": "root:1704067200000_abc123",
    "last_updated": "2024-01-01T00:00:00.000Z",
    "file_types": [],
    "rule": "Always include error handling for async operations"
  },
  {
    "id": "apps:1704067300000_def456",
    "last_updated": "2024-01-01T00:05:00.000Z",
    "file_types": ["typescript"],
    "rule": "Use strict type checking with no implicit any"
  },
  {
    "id": "apps/dashboard:1704067400000_ghi789",
    "last_updated": "2024-01-01T00:10:00.000Z",
    "file_types": ["typescript"],
    "rule": "Components must use named exports"
  }
]
```

### With File Type Filter

```
User: /get-rules apps/dashboard typescript
Claude: 2 rules found for apps/dashboard
[
  {
    "id": "apps:1704067300000_def456",
    "last_updated": "2024-01-01T00:05:00.000Z",
    "file_types": ["typescript"],
    "rule": "Use strict type checking with no implicit any"
  },
  {
    "id": "apps/dashboard:1704067400000_ghi789",
    "last_updated": "2024-01-01T00:10:00.000Z",
    "file_types": ["typescript"],
    "rule": "Components must use named exports"
  }
]
```

### No Rules Found

```
User: /get-rules unknown/path
Claude: 0 rules found for unknown/path
[]
```

### With Max Age Filter

```
User: /get-rules apps/dashboard typescript 2d
Claude: 1 rules found for apps/dashboard
[
  {
    "id": "apps/dashboard:1704067400000_ghi789",
    "last_updated": "2024-01-01T00:10:00.000Z",
    "file_types": ["typescript"],
    "rule": "Components must use named exports"
  }
]
```

## Precedence Rules

Rules are ordered from **general to specific**:
1. Root rules (apply to entire project)
2. Parent directory rules
3. Current directory rules

All applicable rules are returned - they are **additive** not exclusive.

## Max Age Format

- `30m`: 30 minutes
- `6h`: 6 hours
- `2d`: 2 days

Rules older than the specified age are filtered out.

## Tips

- Query parent directories to see what rules will cascade to subdirectories
- Use file type filters to see rules specific to your language
- Use max age to focus on recently added rules
- Empty results mean no rules exist for that path (check parent directories)
