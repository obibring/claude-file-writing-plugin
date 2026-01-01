#!/usr/bin/env node

/**
 * File Writing Rules Engine
 *
 * Core engine for managing hierarchical file writing rules.
 * Supports CRUD operations, precedence resolution, and persistence.
 *
 * Usage:
 *   node rules-engine.js add-rule --pathname <path> [--file-types <types>] --rule <content>
 *   node rules-engine.js get-rules --pathname <path> [--file-types <types>] [--max-age <age>]
 *   node rules-engine.js list-file-types [--max-age <age>]
 *   node rules-engine.js set-rule-by-id --id <id> [--pathname <path>] [--file-types <types>] [--rule <content>]
 *   node rules-engine.js delete-rule-by-id --id <id>
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

/**
 * Read settings from .claude/file-writing-rules.local.md
 */
function getSettings() {
  const settingsPath = path.join(process.cwd(), '.claude', 'file-writing-rules.local.md');
  const defaultPath = path.join(process.cwd(), '.claude', 'file-writing-rules.generated.json');

  let rulesFilePath = defaultPath;

  if (fs.existsSync(settingsPath)) {
    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      const match = content.match(/rules-file-path:\s*(.+)/);
      if (match) {
        const configuredPath = match[1].trim();
        // Resolve relative to project root
        rulesFilePath = path.isAbsolute(configuredPath)
          ? configuredPath
          : path.join(process.cwd(), configuredPath);
      }
    } catch (err) {
      // Fail silently, use default
    }
  }

  return { rulesFilePath };
}

// ============================================================================
// Storage & Persistence
// ============================================================================

/**
 * Load rules from disk
 */
function loadRules() {
  const { rulesFilePath } = getSettings();

  if (!fs.existsSync(rulesFilePath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(rulesFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to load rules from ${rulesFilePath}: ${err.message}`);
  }
}

/**
 * Save rules to disk
 */
function saveRules(rulesTree) {
  const { rulesFilePath } = getSettings();

  // Ensure directory exists
  const dir = path.dirname(rulesFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(rulesFilePath, JSON.stringify(rulesTree, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to save rules to ${rulesFilePath}: ${err.message}`);
  }
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Canonicalize pathname prefix for rule IDs
 */
function canonicalPathPrefix(pathname) {
  const parts = pathname.split(path.sep).filter(p => p && p !== '.');
  return parts.join('/');
}

/**
 * Generate unique suffix for rule ID
 */
function generateUniqueSuffix() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${random}`;
}

/**
 * Ensure suffix is unique under the given node
 */
function ensureSuffixUniqueUnderNode(node, prefix, suffix) {
  const candidate = `${prefix}:${suffix}`;
  const existingIds = new Set((node._rules_ || []).map(r => r.id));

  let finalSuffix = suffix;
  let finalCandidate = candidate;

  while (existingIds.has(finalCandidate)) {
    finalSuffix = generateUniqueSuffix();
    finalCandidate = `${prefix}:${finalSuffix}`;
  }

  return finalCandidate;
}

/**
 * Generate rule ID for a given pathname
 */
function generateRuleId(rulesTree, pathname) {
  const prefix = canonicalPathPrefix(pathname);
  const node = getOrCreateNode(rulesTree, pathname);
  const suffix = generateUniqueSuffix();
  return ensureSuffixUniqueUnderNode(node, prefix, suffix);
}

// ============================================================================
// Tree Navigation
// ============================================================================

/**
 * Get or create a node at the given pathname
 */
function getOrCreateNode(rulesTree, pathname) {
  const parts = pathname.split(path.sep).filter(p => p && p !== '.');

  let cursor = rulesTree;

  for (const part of parts) {
    if (!cursor[part]) {
      cursor[part] = { _rules_: [] };
    }
    cursor = cursor[part];
  }

  if (!cursor._rules_) {
    cursor._rules_ = [];
  }

  return cursor;
}

/**
 * Get a node at the given pathname (without creating)
 */
function getNode(rulesTree, pathname) {
  const parts = pathname.split(path.sep).filter(p => p && p !== '.');

  let cursor = rulesTree;

  for (const part of parts) {
    if (!cursor[part]) {
      return null;
    }
    cursor = cursor[part];
  }

  return cursor;
}

/**
 * Find node and rule by ID (parse pathname from ID)
 */
function findRuleById(rulesTree, id) {
  const colonIndex = id.indexOf(':');
  if (colonIndex === -1) {
    throw new Error(`Invalid rule ID format: ${id}`);
  }

  const prefix = id.substring(0, colonIndex);
  const pathname = prefix.replace(/\//g, path.sep);

  const node = getNode(rulesTree, pathname);
  if (!node || !node._rules_) {
    return { node: null, rule: null, index: -1 };
  }

  const index = node._rules_.findIndex(r => r.id === id);
  if (index === -1) {
    return { node, rule: null, index: -1 };
  }

  return { node, rule: node._rules_[index], index };
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Parse max-age string to milliseconds
 */
function parseMaxAge(maxAgeStr) {
  if (!maxAgeStr) return null;

  const match = maxAgeStr.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Invalid max-age format: ${maxAgeStr}. Use format like "30m", "6h", "2d"`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    'm': 60 * 1000,           // minutes
    'h': 60 * 60 * 1000,      // hours
    'd': 24 * 60 * 60 * 1000  // days
  };

  return value * multipliers[unit];
}

/**
 * Filter rules by max age
 */
function filterByMaxAge(rules, maxAge) {
  if (!maxAge) return rules;

  const now = Date.now();
  const maxAgeMs = parseMaxAge(maxAge);

  return rules.filter(rule => {
    const ruleTime = new Date(rule.last_updated).getTime();
    return (now - ruleTime) <= maxAgeMs;
  });
}

/**
 * Filter rules by file types
 */
function filterByFileTypes(rules, fileTypes) {
  if (!fileTypes || fileTypes.length === 0) {
    return rules;
  }

  return rules.filter(rule => {
    // Rules with empty file_types apply to all files
    if (!rule.file_types || rule.file_types.length === 0) {
      return true;
    }

    // Check if any requested file type matches rule's file types
    return fileTypes.some(ft => rule.file_types.includes(ft));
  });
}

// ============================================================================
// Precedence Algorithm
// ============================================================================

/**
 * Get rules with precedence ordering (root to deepest)
 */
function getPrecedenceOrderedRules(rulesTree, pathname, fileTypes = null, maxAge = null) {
  const parts = pathname.split(path.sep).filter(p => p && p !== '.');
  let cursor = rulesTree;
  const collected = [];

  // Root rules (depth 0)
  if (cursor._rules_) {
    let rules = cursor._rules_;
    rules = filterByFileTypes(rules, fileTypes);
    rules = filterByMaxAge(rules, maxAge);
    if (rules.length > 0) {
      collected.push({ depth: 0, rules });
    }
  }

  // Traverse path
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!cursor[part]) {
      break;
    }
    cursor = cursor[part];
    const depth = i + 1;

    if (cursor._rules_) {
      let rules = cursor._rules_;
      rules = filterByFileTypes(rules, fileTypes);
      rules = filterByMaxAge(rules, maxAge);
      if (rules.length > 0) {
        collected.push({ depth, rules });
      }
    }
  }

  // Sort by depth (already in order, but explicit)
  collected.sort((a, b) => a.depth - b.depth);

  return collected;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Add a new rule
 */
function addRule(pathname, fileTypes, ruleContent) {
  const rulesTree = loadRules();

  // Parse file types (trim whitespace, handle comma/space separation)
  const parsedFileTypes = fileTypes
    ? fileTypes.split(/[\s,]+/).map(ft => ft.trim()).filter(ft => ft)
    : [];

  // Generate ID
  const id = generateRuleId(rulesTree, pathname);

  // Create rule object
  const rule = {
    id,
    last_updated: new Date().toISOString(),
    file_types: parsedFileTypes,
    rule: ruleContent
  };

  // Add to tree
  const node = getOrCreateNode(rulesTree, pathname);
  node._rules_.push(rule);

  // Save
  saveRules(rulesTree);

  return rule;
}

/**
 * Get rules for a pathname
 */
function getRules(pathname, fileTypes = null, maxAge = null) {
  const rulesTree = loadRules();

  // Parse file types
  const parsedFileTypes = fileTypes
    ? fileTypes.split(/[\s,]+/).map(ft => ft.trim()).filter(ft => ft)
    : null;

  // Get precedence-ordered rules
  const orderedRules = getPrecedenceOrderedRules(rulesTree, pathname, parsedFileTypes, maxAge);

  // Flatten into single array
  const allRules = orderedRules.flatMap(item => item.rules);

  return allRules;
}

/**
 * List all unique file types
 */
function listFileTypes(maxAge = null) {
  const rulesTree = loadRules();
  const fileTypesSet = new Set();

  function traverse(node) {
    if (node._rules_) {
      const rules = filterByMaxAge(node._rules_, maxAge);
      for (const rule of rules) {
        if (rule.file_types && rule.file_types.length > 0) {
          rule.file_types.forEach(ft => fileTypesSet.add(ft));
        }
      }
    }

    for (const key in node) {
      if (key !== '_rules_') {
        traverse(node[key]);
      }
    }
  }

  traverse(rulesTree);

  // Count occurrences
  const fileTypeCounts = {};

  function countTraverse(node) {
    if (node._rules_) {
      const rules = filterByMaxAge(node._rules_, maxAge);
      for (const rule of rules) {
        if (rule.file_types && rule.file_types.length > 0) {
          rule.file_types.forEach(ft => {
            fileTypeCounts[ft] = (fileTypeCounts[ft] || 0) + 1;
          });
        }
      }
    }

    for (const key in node) {
      if (key !== '_rules_') {
        countTraverse(node[key]);
      }
    }
  }

  countTraverse(rulesTree);

  // Sort alphabetically
  const sorted = Array.from(fileTypesSet).sort();

  return sorted.map(ft => ({
    fileType: ft,
    count: fileTypeCounts[ft] || 0
  }));
}

/**
 * Set rule by ID (update)
 */
function setRuleById(id, updates) {
  const rulesTree = loadRules();

  const { node, rule, index } = findRuleById(rulesTree, id);

  if (!rule) {
    throw new Error(`Rule not found: ${id}`);
  }

  // Store original for comparison
  const originalRule = { ...rule };

  // Check if moving to new pathname
  if (updates.pathname && updates.pathname !== getPathnameFromId(id)) {
    // Remove from current location
    node._rules_.splice(index, 1);

    // Generate new ID at destination
    const newId = generateRuleId(rulesTree, updates.pathname);

    // Create updated rule at new location
    const newNode = getOrCreateNode(rulesTree, updates.pathname);
    const updatedRule = {
      id: newId,
      last_updated: new Date().toISOString(),
      file_types: updates.file_types !== undefined
        ? (typeof updates.file_types === 'string'
            ? updates.file_types.split(/[\s,]+/).map(ft => ft.trim()).filter(ft => ft)
            : updates.file_types)
        : rule.file_types,
      rule: updates.rule !== undefined ? updates.rule : rule.rule
    };

    newNode._rules_.push(updatedRule);
    saveRules(rulesTree);

    return { before: originalRule, after: updatedRule };
  } else {
    // Update in place
    if (updates.file_types !== undefined) {
      rule.file_types = typeof updates.file_types === 'string'
        ? updates.file_types.split(/[\s,]+/).map(ft => ft.trim()).filter(ft => ft)
        : updates.file_types;
    }

    if (updates.rule !== undefined) {
      rule.rule = updates.rule;
    }

    rule.last_updated = new Date().toISOString();

    saveRules(rulesTree);

    return { before: originalRule, after: rule };
  }
}

/**
 * Delete rule by ID
 */
function deleteRuleById(id) {
  const rulesTree = loadRules();

  const { node, rule, index } = findRuleById(rulesTree, id);

  if (!rule) {
    throw new Error(`Rule not found: ${id}`);
  }

  // Remove rule
  node._rules_.splice(index, 1);

  // Save
  saveRules(rulesTree);

  return rule;
}

/**
 * Get pathname from rule ID
 */
function getPathnameFromId(id) {
  const colonIndex = id.indexOf(':');
  if (colonIndex === -1) {
    throw new Error(`Invalid rule ID format: ${id}`);
  }

  const prefix = id.substring(0, colonIndex);
  return prefix.replace(/\//g, path.sep);
}

// ============================================================================
// CLI Interface
// ============================================================================

function parseArgs(args) {
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      result[key] = value;
      i++; // Skip next arg
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node rules-engine.js <command> [options]');
    process.exit(1);
  }

  const command = args[0];
  const options = parseArgs(args.slice(1));

  try {
    switch (command) {
      case 'add-rule': {
        const { pathname, 'file-types': fileTypes, rule } = options;
        if (!pathname || !rule) {
          console.error('Usage: add-rule --pathname <path> [--file-types <types>] --rule <content>');
          process.exit(1);
        }
        const result = addRule(pathname, fileTypes, rule);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'get-rules': {
        const { pathname, 'file-types': fileTypes, 'max-age': maxAge } = options;
        if (!pathname) {
          console.error('Usage: get-rules --pathname <path> [--file-types <types>] [--max-age <age>]');
          process.exit(1);
        }
        const rules = getRules(pathname, fileTypes, maxAge);
        console.log(JSON.stringify(rules, null, 2));
        break;
      }

      case 'list-file-types': {
        const { 'max-age': maxAge } = options;
        const fileTypes = listFileTypes(maxAge);
        console.log(JSON.stringify(fileTypes, null, 2));
        break;
      }

      case 'set-rule-by-id': {
        const { id, pathname, 'file-types': fileTypes, rule } = options;
        if (!id) {
          console.error('Usage: set-rule-by-id --id <id> [--pathname <path>] [--file-types <types>] [--rule <content>]');
          process.exit(1);
        }
        const updates = {};
        if (pathname) updates.pathname = pathname;
        if (fileTypes !== undefined) updates.file_types = fileTypes;
        if (rule !== undefined) updates.rule = rule;

        const result = setRuleById(id, updates);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'delete-rule-by-id': {
        const { id } = options;
        if (!id) {
          console.error('Usage: delete-rule-by-id --id <id>');
          process.exit(1);
        }
        const result = deleteRuleById(id);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  addRule,
  getRules,
  listFileTypes,
  setRuleById,
  deleteRuleById,
  getPrecedenceOrderedRules,
  loadRules
};
