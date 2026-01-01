# Baseline Observations: Planning Without Rule Checking

## Expected Behavior Pattern

When agents write plans with file contents WITHOUT the updated skill, they typically:

### 1. Skip Rule Checking Entirely

**Behavior:**
- Write code examples directly in plan file
- Never invoke file-writing-rules tools
- Don't mention checking standards

**Rationalization:**
- "Planning is about structure and approach"
- "Details and standards come during implementation"
- "The plan is a draft - we'll refine it later"

### 2. Violate Rules Unknowingly

**Behavior:**
- Use default exports when rules require named exports
- Skip error handling when rules require it
- Use patterns that conflict with project conventions

**Rationalization:**
- "I'll check rules when actually implementing"
- "This is just example code for the plan"
- "The implementation phase is where standards matter"

### 3. False Sense of Completeness

**Behavior:**
- Present plan as "ready to implement"
- User discovers violations during implementation
- Requires rewriting code that was "planned"

**Impact:**
- Wasted effort planning non-compliant approach
- Implementation requires different patterns than planned
- User loses confidence in plans

## Key Insight

**The problem:** Agents treat planning and implementation as separate phases with different standards.

**The reality:** Code in plans IS real code that will be implemented. If it violates rules, the plan is wrong.

## Required Discipline

**Before writing file contents to plan:**
1. Identify the file pathname
2. Check rules for that pathname
3. Ensure planned code complies
4. ONLY THEN write to plan file

This must happen file-by-file, inline with plan writing.
