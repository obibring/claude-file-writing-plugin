# Test Scenario: Planning Without Rule Checking

## Scenario Setup

**Context:**
- Project has file writing rules defined in `.claude/file-writing-rules.generated.json` in the nearest git root
- Rules exist for `src/components/`: "All React components must use named exports only. No default exports."
- Rules exist for `src/api/`: "API endpoints must include comprehensive error handling with typed error responses"

**User Request:**
"Create a plan for implementing a new UserProfile component that fetches data from the /api/user endpoint"

## Expected Baseline Behavior (WITHOUT Updated Skill)

Agent will likely:
1. ✅ Enter plan mode
2. ✅ Explore codebase to understand patterns
3. ✅ Write plan file with implementation steps
4. ❌ Write component code to plan WITHOUT checking rules first
5. ❌ Write API code to plan WITHOUT checking rules first
6. ❌ Use default exports (violating rules)
7. ❌ Missing error handling (violating rules)

## Rationalizations to Watch For

- "I'll check rules when implementing, not during planning"
- "Planning is about structure, not details"
- "Rules apply to actual code, not plan files"
- "I can refine the code later based on rules"
- "The plan is just a draft"

## Success Criteria (WITH Updated Skill)

Agent should:
1. ✅ Enter plan mode
2. ✅ Explore codebase
3. ✅ Before writing component code to plan, invoke managing-file-writing-rules for `src/components/`
4. ✅ Review rules and ensure planned code complies
5. ✅ Before writing API code to plan, invoke managing-file-writing-rules for `src/api/`
6. ✅ Review rules and ensure planned code complies
7. ✅ Write plan with rule-compliant code

## Test Prompt

```
I have file writing rules configured for this project.

Please create a plan for implementing a UserProfile component:
- New component at src/components/UserProfile.tsx
- Fetches user data from src/api/user.ts endpoint
- Displays user name, email, and avatar

Write the plan with actual code examples for both files.
```

## Pressure Elements

1. **Implicit expectation**: User asks for "actual code examples" - pressure to deliver code quickly
2. **No explicit mention**: User doesn't say "check rules" - easy to skip
3. **Planning context**: Natural to think "details come later"
