# Generate Daily Standup

Generate today's standup message based on todos, GitHub activity, and Jira tickets.

## Steps

1. **Gather Yesterday's Completed Items**
   - Check completed todos from yesterday's markdown file
   - List merged/closed PRs from tracked repos:
     - MetaMask/metamask-design-system
     - MetaMask/metamask-extension
     - MetaMask/metamask-mobile
   - Check completed Jira tickets (status changed to Done yesterday)

2. **Identify Today's Work**
   - Review today's todo list (pending items)
   - Check open PRs that need work
   - List Jira tickets in progress or planned for today

3. **Identify Blockers**
   - PRs waiting for review
   - Blocked Jira tickets
   - Dependencies on other team members
   - Technical issues from PR comments or failed CI

4. **Format Standup Message**
   ```
   Team Standup Reply:

   **Yesterday** ✅
   - [Completed todo items]
   - Merged PR: #[number] - [title] ([repo-short-name])
   - Completed DSYS-[number]: [title]

   **Today** 💻
   - [Today's planned todos]
   - Continue PR: #[number] - [title]
   - Work on DSYS-[number]: [title]

   **Blockers** 🚫
   - [List any blockers, or "None" if clear]
   - Waiting for review on PR #[number]
   - DSYS-[number] blocked by [reason]
   ```

## MCP Usage

Use these MCP tools:
- `mcp__atlassian__searchJiraIssuesUsingJql` - Find relevant tickets
- `mcp__atlassian__getJiraIssue` - Get ticket details
- GitHub MCP tools for PR information

## Output

Save generated standup to `/standups/YYYY-MM-DD.md` and display to user for copying to Slack.