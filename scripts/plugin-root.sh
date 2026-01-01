#!/bin/bash
# Plugin Root Resolver for file-writing-rules plugin
#
# Resolves the plugin installation directory using multiple fallback strategies.
# This script works around the CLAUDE_PLUGIN_ROOT bug in command markdown files.
#
# Usage:
#   PLUGIN_ROOT=$(bash /path/to/plugin-root.sh)
#   node "$PLUGIN_ROOT/scripts/rules-engine.js" [args]

PLUGIN_NAME="file-writing-rules"

# Strategy 1: Use CLAUDE_PLUGIN_ROOT if available
if [ -n "${CLAUDE_PLUGIN_ROOT}" ] && [ -d "${CLAUDE_PLUGIN_ROOT}" ]; then
    echo "${CLAUDE_PLUGIN_ROOT%/}"
    exit 0
fi

# Strategy 2: Use jq to parse installed_plugins.json (fast, common)
if command -v jq &> /dev/null; then
    INSTALLED_PLUGINS="${HOME}/.claude/plugins/installed_plugins.json"
    if [ -f "$INSTALLED_PLUGINS" ]; then
        PLUGIN_ROOT=$(jq -r --arg name "$PLUGIN_NAME" '.plugins | to_entries[] | select(.key | contains($name)) | .value.installPath' "$INSTALLED_PLUGINS" 2>/dev/null | head -1)
        if [ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT" ]; then
            echo "${PLUGIN_ROOT%/}"
            exit 0
        fi
    fi
fi

# Strategy 3: Use Python to parse installed_plugins.json (fallback)
if command -v python3 &> /dev/null; then
    PLUGIN_ROOT=$(python3 -c "
import json
import sys
try:
    with open('${HOME}/.claude/plugins/installed_plugins.json') as f:
        plugins = json.load(f)['plugins']
    for key, value in plugins.items():
        if '$PLUGIN_NAME' in key:
            print(value['installPath'].rstrip('/'))
            sys.exit(0)
except:
    pass
" 2>/dev/null)
    if [ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT" ]; then
        echo "$PLUGIN_ROOT"
        exit 0
    fi
fi

# Strategy 4: Check if running from plugin directory (development mode)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"
if [ -f "$PLUGIN_DIR/.claude-plugin/plugin.json" ]; then
    # Verify it's the correct plugin
    if grep -q "\"name\".*[:\"].*$PLUGIN_NAME" "$PLUGIN_DIR/.claude-plugin/plugin.json" 2>/dev/null; then
        echo "$PLUGIN_DIR"
        exit 0
    fi
fi

# All strategies failed
echo "Error: Could not locate $PLUGIN_NAME plugin installation directory" >&2
echo "Tried:" >&2
echo "  1. CLAUDE_PLUGIN_ROOT environment variable" >&2
echo "  2. ~/.claude/plugins/installed_plugins.json (jq)" >&2
echo "  3. ~/.claude/plugins/installed_plugins.json (python)" >&2
echo "  4. Script directory detection" >&2
exit 1
