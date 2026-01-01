---
name: validate-rules
description: Validate files or directories against project rules to identify violations
allowed-tools:
  - Skill
argument-hint: "<pathname> [--deep|--shallow]"
---

# Validate File Writing Rules

Use the `validating-file-writing-rules` skill to check files or directories for rule compliance.

The skill will:
- Identify which files comply with rules
- Report specific violations with rule details
- Provide actionable feedback for fixing non-compliant code

## Usage

```
/file-writing-rules:validate-rules <pathname> [--deep|--shallow]
```

### Options

- `<pathname>`: File or directory to validate
- `--deep`: Recursively validate all files in directory (default for directories)
- `--shallow`: Only validate files in the immediate directory (no subdirectories)

## Examples

```
/file-writing-rules:validate-rules src/components/
/file-writing-rules:validate-rules src/api/user.ts
/file-writing-rules:validate-rules src/ --deep
/file-writing-rules:validate-rules tests/ --shallow
```
