# Skills Created for File Writing Rules Plugin

## Summary

Following the TDD methodology from `superpowers:writing-skills`, I created **three new skills** for this plugin using the RED-GREEN-REFACTOR cycle.

## Created Skill 1: managing-file-writing-rules

**Location:** `skills/managing-file-writing-rules/`
**Files:** `SKILL.md` (1225 words), `rules-engine.js` (bundled script)

**Purpose:** Provides interactive rule management - helps users retrieve, update, and delete rules through conversation.

### Why This Skill Was Needed

**The Problem (RED Phase):**
Without this skill, agents would:
- Try to use commands but couldn't access them as tools
- Recognize moments when users need help with rules but lack working patterns
- Want to help manage rules but have no reliable way to do so

Baseline testing showed agents had the right instinct ("I should check the rules") but no working implementation.

**The Solution (GREEN Phase):**
Created a unified skill that:
- Provides direct Bash access to rules-engine.js script (bundled in skill directory)
- Includes complete command examples for all operations (get, list, set, delete, add)
- Defines clear interaction patterns for common scenarios
- Explains when to get user confirmation (deletions, updates)

**Key Design Decisions:**
1. **Bundled Script**: Copied `rules-engine.js` into skill directory so skill is self-contained
2. **Direct Bash Execution**: Uses `${CLAUDE_PLUGIN_ROOT}/skills/managing-file-writing-rules/rules-engine.js` for reliable access
3. **Comprehensive Examples**: Three detailed interaction patterns showing complete workflows
4. **Safety Guidelines**: Explicit rules about user confirmation for destructive operations

### Testing Results

**Before skill (baseline):**
- Agents tried multiple tool names to access commands
- Failed to execute commands reliably
- Recognized appropriate moments but couldn't act

**After skill (verification):**

**Test 1 - Rule Inquiry:**
- Agent correctly used bundled rules-engine.js script with full path
- Provided exact Bash command: `node ${CLAUDE_PLUGIN_ROOT}/skills/managing-file-writing-rules/rules-engine.js get-rules --pathname "src/components"`
- Explained how to present results clearly with hierarchy and metadata
- Offered appropriate follow-up actions

**Test 2 - Rule Update:**
- Used get-rules to find the specific outdated rule first
- Showed complete rule content before suggesting changes
- Offered 3 options: Update, Delete, or Refine
- Required explicit user confirmation for changes
- Provided correct set-rule-by-id command with full path
- Showed before/after comparison
- Suggested follow-up actions (check conflicting rules, add new rules)

### Usage

This skill triggers when user:
- Asks about coding standards for a directory
- Mentions a rule is outdated or needs updating
- Wants to browse all rules for a file type
- Needs to delete obsolete rules
- Asks to see what conventions apply

The skill provides working Bash commands and interaction patterns for all five operations:
1. **get-rules** - Retrieve applicable rules
2. **list-file-types** - See which types have rules
3. **set-rule-by-id** - Update existing rules
4. **delete-rule-by-id** - Remove rules
5. **add-rule** - Create new rules

### Why Bundled Script?

The `rules-engine.js` script is copied into the skill directory because:
- **Self-contained**: Skill works without external dependencies
- **Reliable access**: Uses `${CLAUDE_PLUGIN_ROOT}` which works in marketplace installations
- **Version control**: Skill and script stay synchronized
- **Clear documentation**: Script usage is right in the skill examples

### Integration with Other Skills

- **Complements `file-writing-rules`**: That skill enforces rules automatically; this one enables interactive management
- **Complements `enforcing-file-writing-rules`**: That skill prevents violations; this one manages the rules themselves
- **Complements `validating-file-writing-rules`**: Validation reveals which rules need updating
- **Complete workflow**: User creates rules → Management → Enforcement → Validation

---

## Created Skill 2: enforcing-file-writing-rules

**Location:** `skills/enforcing-file-writing-rules/`
**Files:** `SKILL.md` (1884 words), `rules-engine.js` (bundled script)

**Purpose:** Mandatory skill invoked before every Write/Edit tool call to retrieve applicable rules, validate content, fix violations, and ensure all written code adheres to project standards.

### Why This Skill Was Needed

**The Problem (RED Phase):**
Without this skill, agents would:
- Want to fix violations (good instinct)
- Fix them manually rather than systematically
- Risk missing violations across hierarchical rule levels
- Potentially skip checking under time pressure

Baseline testing showed agents had the right intentions but lacked a mandatory systematic enforcement process.

**The Solution (GREEN Phase):**
Created a mandatory skill that MUST be invoked before every Write/Edit:
- Retrieves all applicable rules hierarchically (root → deepest)
- Returns original content unchanged if no rules exist
- Provides systematic violation detection patterns
- Includes examples for common violation types (error handling, types, naming)
- Makes enforcement automatic, not optional

**Key Design Decisions:**
1. **MANDATORY invocation**: Skill MUST be invoked before every Write/Edit tool call (not optional)
2. **Bundled Script**: Copied `rules-engine.js` into skill directory for reliable access
3. **Hierarchical Rule Application**: ALL levels of rules apply (root → deepest), not just deepest
4. **No-Rules Handling**: Returns original content unchanged when no rules exist
5. **Example-Driven**: Concrete patterns for fixing common violations

**Bulletproofing (REFACTOR Phase):**
Added explicit counters for rationalizations found during testing:
- "This change is trivial" → "Trivial changes can violate rules. Check anyway."
- "Checking would slow me down" → "Checking takes 2 seconds. Review delays take hours."
- "No time to run the script" → "Taking 2 seconds doesn't cause delays. Violations do."
- "Under time pressure" → "Emergency pressure is when you most need the skill."
- Plus 8 other common rationalizations
- Added "Red Flags" section with 12 warning signs of rationalization

### Testing Results

**Before skill (baseline):**
- Agents wanted to fix violations (good instinct)
- Fixed violations manually rather than systematically
- Lacked structured enforcement process
- Potential to miss hierarchical rules

**After skill (GREEN verification):**

**Test 1 - File with Violations:**
- Agent correctly retrieved rules for src/api/ with TypeScript
- Applied all 3 hierarchical rule levels (root, src/, src/api/)
- Generated code satisfying ALL rules (copyright header, strict types, error handling)
- Communicated which rules were applied

**Test 2 - No Rules Scenario:**
- Agent correctly identified empty rule set
- Returned original content unchanged
- Proceeded with professional standards (fallback behavior)

**Test 3 - Trivial Change Test:**
- Agent correctly invoked skill even for "trivial" one-line change
- Recognized rationalization trap ("this is too simple to check")
- Followed "EVERY single time" mandate

**Test 4 - Hierarchical Rules:**
- Agent retrieved and applied ALL THREE levels of rules
- Not just deepest rule, but root → src → src/components
- Final code satisfied all three rule levels simultaneously

**After skill (REFACTOR verification - maximum pressure):**
- Production emergency scenario with urgent language
- Agent correctly identified ALL rationalization red flags
- Still invoked skill despite time pressure
- Explained why skill is MOST important under pressure
- No rationalization bypass attempts

### Usage

This skill triggers **BEFORE EVERY Write OR Edit TOOL CALL**:
- Mandatory, not optional
- Even for "trivial" changes
- Even under time pressure
- Even when no rules exist (to confirm)

The skill provides:
1. **Systematic workflow**: Extract filepath → Get rules → Analyze → Fix → Verify → Write
2. **Hierarchical application**: All rule levels from root to deepest
3. **Common violation patterns**: Error handling, type safety, naming, imports, exports
4. **Example fixes**: Concrete before/after code for each pattern type
5. **Rationalization counters**: 12 excuses explicitly refuted
6. **Red flags list**: 12 warning signs when rationalizing

### Why Bundled Script?

The `rules-engine.js` script is copied into the skill directory because:
- **Self-contained**: Skill works without external dependencies
- **Reliable access**: Uses `${CLAUDE_PLUGIN_ROOT}` which works in marketplace installations
- **Consistent with other skills**: Same pattern as managing-file-writing-rules
- **Enforcement guarantee**: Script always available when skill is invoked

### Integration with Other Skills

- **Complements `managing-file-writing-rules`**: That skill helps users update rules; this enforces current ones
- **Complements `validating-file-writing-rules`**: That skill detects existing violations; this prevents new ones
- **Final gate before Write/Edit**: This is the mandatory checkpoint that prevents violations
- **Complete workflow**: User creates rules → Management → **Enforcement (prevent)** ← YOU ARE HERE → Validation (detect)

---

## Created Skill 3: validating-file-writing-rules

**Location:** `skills/validating-file-writing-rules/`
**Files:** `SKILL.md` (1450 words approx), `rules-engine.js` (bundled script)

**Purpose:** Validates files or directories against project rules to identify existing violations, with systematic reporting of compliance status and specific rule violations for each file.

### Why This Skill Was Needed

**The Problem (RED Phase):**
Without this skill, agents would:
- Try to manually validate files (good instinct)
- Lack systematic validation workflow
- Not know how to interpret --deep/--shallow flags
- Ask about recursion but without standard guidance
- Use inconsistent reporting formats

Baseline testing showed agents wanted to validate correctly but needed explicit workflow and flag interpretation guidance.

**The Solution (GREEN Phase):**
Created a technique skill that provides:
- Systematic validation workflow (parse → list files → check rules → report)
- Explicit flag interpretation (--deep = recursive, --shallow = top-level only, no flag = ask user)
- Structured reporting format with ✓/✗ indicators
- Batch file processing
- Clear violation details (rule, issue, location)

**Key Design Decisions:**
1. **Ask when ambiguous**: If no --deep/--shallow flag, always ask user about recursion depth
2. **Infer from flags**: --deep and --shallow have explicit meanings
3. **Bundled Script**: Copied `rules-engine.js` into skill directory for reliable access
4. **Structured Reports**: Consistent format with summary counts, per-file status, violation details
5. **Technique skill**: Not discipline-enforcing - used on-demand when user requests validation

### Testing Results

**Before skill (baseline):**

**Test 1 - Single File:**
- Agent tried to read rules file ✓
- Would manually analyze ✓
- Lacked systematic workflow ⚠️

**Test 2 - Directory without Flag:**
- Agent asked about recursive ✓✓ (excellent instinct!)
- Would use Glob + Read + manual inspection ✓
- Lacked consistent reporting format ⚠️

**Test 3 - Directory with --deep Flag:**
- Agent asked what --deep means ⚠️
- Didn't infer recursive from flag ⚠️
- Lacked flag interpretation guidance ⚠️

**Test 4 - Multiple Files:**
- Created structured report with ✓/✗ ✓
- Good natural reporting format ✓

**After skill (GREEN verification):**

**Test 1 - Directory without Flag:**
- Agent followed skill's explicit guidance to ask user ✓
- Explained options clearly (recursive vs top-level only) ✓
- Would generate structured report ✓

**Test 2 - Directory with --deep Flag:**
- Agent (when given skill docs) correctly interpreted --deep as recursive ✓
- Did NOT ask user (unambiguous) ✓
- Proceeded with recursive validation ✓

**Test 3 - Applying Skill Guidance:**
- Agent correctly applied flag interpretation table ✓
- Understood difference between ambiguous and explicit cases ✓

### Usage

This skill triggers when user asks to:
- "Check if [file/directory] follows our rules"
- "Validate [path] against project standards"
- "Audit [directory] for rule violations"
- "Are there any rule violations in [path]?"

The skill provides:
1. **Systematic workflow**: Parse pathname → Determine scope → List files → Validate each → Report
2. **Flag interpretation**: --deep (recursive), --shallow (top-level), no flag (ask user)
3. **Structured reporting**: Summary counts, ✓/✗ indicators, violation details
4. **Batch processing**: Handle multiple files efficiently
5. **Clear violations**: Which rule, what issue, where (line numbers)

### Why Bundled Script?

The `rules-engine.js` script is copied into the skill directory because:
- **Self-contained**: Skill works without external dependencies
- **Reliable access**: Uses `${CLAUDE_PLUGIN_ROOT}` which works in marketplace installations
- **Consistent pattern**: Same approach as managing-file-writing-rules and enforcing-file-writing-rules
- **Validation guarantee**: Script always available when skill is invoked

### Integration with Other Skills

- **Complements `enforcing-file-writing-rules`**: That skill prevents violations before writing; this detects existing violations in written code
- **Complements `managing-file-writing-rules`**: Validation shows which rules are effective and need updating
- **Complete workflow**: User creates rules → Management → Enforcement (prevent) → **Validation (detect)** ← YOU ARE HERE

---

## Skills Summary

| Skill | Type | Purpose | Words |
|-------|------|---------|-------|
| `managing-file-writing-rules` | Reference/Technique | Interactive rule management with bundled script | 1225 words |
| `enforcing-file-writing-rules` | Discipline-enforcing | Mandatory pre-Write/Edit enforcement with violation fixing | 1884 words |
| `validating-file-writing-rules` | Technique | Systematic validation of existing files with structured reporting | ~1450 words |

All three skills follow TDD methodology with documented baseline behavior and verification testing.
