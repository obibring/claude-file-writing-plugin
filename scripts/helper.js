/**
 * Helper Utilities Module
 * Provides common utility functions for script operations
 */

/**
 * Formats a given string to camelCase
 * @param {string} str - The string to format
 * @returns {string} The camelCase formatted string
 */
function toCamelCase(str) {
  return str
    .split(/[\s-_]+/)
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed JSON or default value
 */
function safeParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`JSON parse error: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Delays execution for a given number of milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates if a value is a non-empty string
 * @param {any} value - Value to validate
 * @returns {boolean}
 */
function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Groups an array of objects by a specified key
 * @param {Array<Object>} items - Array of objects to group
 * @param {string} key - The key to group by
 * @returns {Object} Object with grouped items
 */
function groupBy(items, key) {
  return items.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Finds the nearest directory containing a .git folder by walking up from the starting directory
 * @param {string} startDir - Directory to start searching from (defaults to process.cwd())
 * @returns {string} Path to the directory containing .git, or startDir if not found
 */
function findGitRoot(startDir = process.cwd()) {
  const fs = require('fs');
  const path = require('path');

  let currentDir = startDir;

  // Walk up the directory tree
  while (true) {
    const gitPath = path.join(currentDir, '.git');

    if (fs.existsSync(gitPath)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);

    // If we've reached the root of the filesystem, stop
    if (parentDir === currentDir) {
      return startDir; // Fallback to starting directory
    }

    currentDir = parentDir;
  }
}

// Export utilities for use in other scripts
module.exports = {
  toCamelCase,
  safeParse,
  delay,
  isValidString,
  groupBy,
  findGitRoot
};
