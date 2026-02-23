# Todo Review

Review and organize daily todos for optimal workflow and productivity.

## Purpose

Help maintain a clean, prioritized, and actionable todo list by:

- Reviewing incomplete items
- Identifying stale or outdated tasks
- Suggesting priority adjustments
- Linking todos to PRs and Jira tickets
- Archiving completed work

## Review Process

### 1. Daily Review

Check today's todo list (`public/standups/YYYY-MM-DD.md`) for:

- **Clarity**: Are tasks clearly defined and actionable?
- **Priority**: Are P0-P3 priorities correctly assigned?
- **Status**: Are completed items marked correctly?
- **Links**: Are related PRs and tickets linked?

### 2. Priority Guidelines

**P0 - Critical/Blocking**

- Blocks other team members
- Production issues
- Security vulnerabilities
- Due today with hard deadline

**P1 - High Priority**

- Important feature work
- Due this week
- Committed deliverables
- High-impact bugs

**P2 - Medium Priority**

- Normal feature development
- Planned refactoring
- Documentation updates
- Technical debt

**P3 - Low Priority**

- Nice-to-have improvements
- Exploratory work
- Future considerations
- Learning tasks

### 3. Stale Task Detection

Identify tasks that have been:

- Pending for >3 days without progress
- Repeatedly moved between days
- Blocked by external dependencies
- No longer relevant or needed

### 4. Linking and Context

For each todo, ensure:

- GitHub PR links are included (if applicable)
- Jira ticket references are present (e.g., DSYS-123)
- Sufficient context for picking up later
- Clear acceptance criteria or completion definition

## Suggested Actions

### High-Value Tasks

- Break down large tasks into smaller, actionable steps
- Move blocked tasks to a "Blocked" section
- Archive completed work to maintain focus
- Suggest delegation for tasks better suited to others

### Organization

- Group related tasks together
- Separate work by project/repository
- Mark dependencies between tasks
- Highlight urgent deadlines

### Cross-Reference

- Link todos to relevant PRs in GitHub
- Connect to Jira sprint items
- Reference related documentation
- Note team dependencies

## Output Format

Provide a summary with:

```markdown
## Todo Review Summary

**Completed Today** ✅

- [List completed items]

**In Progress**

- [P0] Critical task description (PR #123, DSYS-456)
- [P1] High priority task

**Blocked** 🚫

- Task blocked by [reason] - Action needed: [next step]

**Recommendations**

- Consider breaking down [large task] into smaller steps
- Task X has been pending for 5 days - needs attention
- Link DSYS-789 to related PR

**Tomorrow's Focus**

- [Suggested top 3 priorities for tomorrow]
```

## Automation Features

1. **Auto-detection** of PR/issue numbers in task descriptions
2. **Priority suggestions** based on:
   - Due dates
   - Blocking relationships
   - Team dependencies
   - Sprint commitments
3. **Progress tracking** across multiple days
4. **Completion rate** metrics and patterns

## Best Practices

- Review todos at end of day and morning before standup
- Keep list to 5-8 active items per day
- Move aspirational items to backlog
- Update task descriptions with learnings
- Celebrate completed work before moving on
