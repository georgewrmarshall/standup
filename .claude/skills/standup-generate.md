# Standup Generate

Generate a formatted daily standup message for Slack based on todos, GitHub PRs, and Jira tickets.

## Purpose

Automatically create standup messages following the team's standard format:

1. What you worked on/completed yesterday ✅
2. What you plan to work on/will complete today 💻
3. Blockers 🚫

## Data Sources

### 1. Yesterday's Todos

- Read yesterday's todo file (`public/standups/YYYY-MM-DD.md`)
- Extract completed items (marked with ✅ or checked checkboxes)
- Link to relevant PRs or Jira tickets mentioned

### 2. GitHub Pull Requests

Use GitHub MCP to check:

- **Merged PRs** (last 24 hours)
  - Include PR title and link
  - Note if it addresses a specific issue or feature
- **Open PRs** with recent activity
  - Reviews received
  - Changes made
  - Current status

### 3. Jira Tickets

Use Atlassian MCP to check:

- Tickets moved to "Done" yesterday
- Tickets currently in "In Progress"
- Tickets blocked or needing attention

## Output Format

```markdown
**Yesterday** ✅

- [Completed task from todo] (#PR-link if applicable)
- Merged PR #123: Feature description (DSYS-456)
- Moved DSYS-789 to Done: Ticket description

**Today** 💻

- [Planned task from today's todos]
- Continue work on PR #234: Feature in progress
- Review feedback on DSYS-890

**Blockers** 🚫

- PR #123 waiting on review from @teammate
- DSYS-456 blocked by infrastructure issue
- [Any other blockers identified]
```

## Usage Instructions

1. **Timing**: Best run in the morning before standup
2. **Review**: Always review the generated message for accuracy
3. **Customize**: Add context or clarification where needed
4. **Copy**: Copy the formatted message to Slack thread

## Tips

- Be concise but specific
- Include ticket/PR numbers for traceability
- Highlight urgent items or dependencies
- Mention cross-team coordination needs
- Note if you're OOO or have limited availability

## Automation

This skill should:

1. Automatically detect the current date
2. Find relevant data from last 24 hours
3. Group related items together
4. Format with proper markdown and emojis
5. Prioritize by importance/urgency
6. Identify actual blockers vs. normal waiting states
