# Troubleshooting

## CLAUDE_PLUGIN_ROOT not found error

### Problem

If you encounter errors like:
```
Cannot find module '/scripts/rules-engine.js'
```

This is due to a known bug in Claude Code where `${CLAUDE_PLUGIN_ROOT}` environment variable doesn't expand correctly in command markdown files ([Issue #9354](https://github.com/anthropics/claude-code/issues/9354)).

### Solution 1: Use the Plugin Root Resolver (Recommended)

The plugin includes a helper script that resolves the plugin installation path. Use this workaround until the bug is fixed:

1. **Create a resolver alias** in your project:
   ```bash
   # Add to your .bashrc, .zshrc, or project scripts
   export FWR_ROOT=$(bash ~/.claude/plugins/*/file-writing-rules*/scripts/plugin-root.sh 2>/dev/null)
   ```

2. **Use in commands**:
   ```bash
   node "$FWR_ROOT/scripts/rules-engine.js" get-rules --pathname "src/"
   ```

### Solution 2: Manual Path Resolution

Find your plugin installation directory:

```bash
# On macOS/Linux
find ~/.claude/plugins -type d -name "file-writing-rules*" 2>/dev/null

# On Windows (PowerShell)
Get-ChildItem -Path "$env:USERPROFILE\.claude\plugins" -Filter "file-writing-rules*" -Recurse -Directory
```

Then use the absolute path directly:
```bash
node /Users/yourname/.claude/plugins/file-writing-rules@1.0.2/scripts/rules-engine.js get-rules --pathname "src/"
```

### Solution 3: Local Development Installation

If you're developing or testing the plugin:

1. Clone the repository to your project's `.claude/plugins/` directory:
   ```bash
   mkdir -p .claude/plugins
   git clone https://github.com/yourusername/claude-file-writing-plugin .claude/plugins/file-writing-rules
   ```

2. The plugin will work directly from this location.

## Permission Errors

If you see permission errors when running scripts:

```bash
# Make scripts executable
chmod +x ~/.claude/plugins/*/file-writing-rules*/scripts/*.sh
chmod +x ~/.claude/plugins/*/file-writing-rules*/scripts/*.js
```

## Plugin Not Found After Installation

1. **Verify installation**:
   ```bash
   cat ~/.claude/plugins/installed_plugins.json | grep file-writing-rules
   ```

2. **Reinstall the plugin**:
   ```
   /plugin uninstall file-writing-rules
   /plugin install file-writing-rules
   ```

3. **Clear plugin cache** (if updating):
   ```bash
   rm -rf ~/.claude/plugins/cache/file-writing-rules*
   ```

## Rules File Not Created

The rules file is created in your project's `.claude/` directory when you first add a rule. If it's missing:

1. **Check directory permissions**:
   ```bash
   ls -la .claude/
   ```

2. **Manually create the directory**:
   ```bash
   mkdir -p .claude
   ```

3. **Add your first rule** to initialize the file:
   ```
   /add-rule
   ```

## Getting Help

If issues persist:

1. Check the [GitHub Issues](https://github.com/yourusername/claude-file-writing-plugin/issues)
2. Review the [Claude Code documentation](https://docs.claude.com/)
3. Report bugs with:
   - Your OS and Claude Code version
   - The exact error message
   - Steps to reproduce

## Known Limitations

- **CLAUDE_PLUGIN_ROOT bug**: Commands may fail on some systems until [Issue #9354](https://github.com/anthropics/claude-code/issues/9354) is resolved
- **Windows path handling**: Use forward slashes in paths, even on Windows
- **Node.js requirement**: The plugin requires Node.js 14+ to be installed
