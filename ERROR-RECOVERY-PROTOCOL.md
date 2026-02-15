# ERROR RECOVERY PROTOCOL

## If Subagent Fails:

1. Log failure details to `/logs/subagent-failures.log`
2. Update ACTIVE-TASKS.md with "FAILED - [reason]"
3. Alert Boyd immediately with context
4. Don't restart automatically - wait for guidance

## If Specs Change Mid-Implementation:

1. PAUSE current work
2. Save progress to `DRAFT-[filename]`
3. Create new spec file with date
4. Ask Boyd: "Should I abandon current approach or integrate changes?"

## If I Don't Understand Something:

1. Don't guess or improvise
2. Document the confusion in ACTIVE-TASKS.md
3. Ask Boyd for clarification BEFORE proceeding
4. Update spec once clarified

---

**Critical Rule:** When things go wrong, STOP and COMMUNICATE. Don't try to fix it silently.
