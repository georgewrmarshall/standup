# Review and Organize Todos

Review, organize, and maintain todo lists with automatic archiving and prioritization.

## Steps

1. **Load Current Todos**
   - Read today's todo file from `/todos/YYYY-MM-DD.md`
   - If doesn't exist, create from template
   - Parse markdown checklist format

2. **Organize by Priority**
   - P0: Blockers and urgent items
   - P1: Today's commitments
   - P2: This week's goals
   - P3: Backlog items

3. **Link Related Items**
   - Connect todos to GitHub PRs using format: `[DSYS-123]` or `[#PR-number]`
   - Link to Jira tickets where applicable
   - Group related tasks together

4. **Archive Completed Items**
   - Move completed items to `/archive/YYYY-MM-DD-completed.md`
   - Maintain completion timestamp
   - Keep reference links intact

5. **Suggest New Items**
   - Check for new PR reviews assigned
   - Look for updated Jira tickets
   - Identify follow-up tasks from completed items

## Format

Todo files use this markdown format:
```markdown
# Daily Todos - YYYY-MM-DD

## P0 - Urgent/Blockers
- [ ] Fix critical bug in PR #123
- [ ] Respond to blocker comment on DSYS-456

## P1 - Today's Goals
- [x] Complete component migration
- [ ] Review PR #789 from @teammate
- [ ] Update DSYS-234 status

## P2 - This Week
- [ ] Plan next sprint tasks
- [ ] Document new API changes

## P3 - Backlog
- [ ] Refactor old utility functions
- [ ] Investigate performance improvement
```

## Commands

- Review and organize current todos
- Archive yesterday's completed items
- Suggest new todos based on GitHub/Jira activity
- Generate weekly summary of completed work