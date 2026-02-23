# Sync Jira Tickets

Synchronize and track Jira tickets from the DSYS project board.

## Jira Configuration

- **Board**: Consensys Software - DSYS Project
- **URL**: https://consensyssoftware.atlassian.net/jira/software/c/projects/DSYS

## Sync Operations

### 1. Fetch Assigned Tickets

Query tickets assigned to current user:

```
project = DSYS AND assignee = currentUser() AND status != Done ORDER BY priority DESC, updated DESC
```

### 2. Fetch Recently Updated

Get tickets updated in last 24 hours:

```
project = DSYS AND (assignee = currentUser() OR reporter = currentUser()) AND updated >= -1d
```

### 3. Fetch Sprint Tickets

Current sprint items:

```
project = DSYS AND sprint in openSprints() AND (assignee = currentUser() OR assignee is EMPTY)
```

## Ticket Information to Track

For each ticket, capture:

- **Key**: DSYS-XXX
- **Summary**: Title/description
- **Status**: To Do, In Progress, In Review, Done
- **Priority**: Highest, High, Medium, Low
- **Sprint**: Current sprint name
- **Links**: Related PRs (from description or comments)
- **Blockers**: From comments or linked issues
- **Due Date**: If set

## Create Local Ticket Cache

Store in `/jira/tickets.json`:

```json
{
  "lastSync": "2024-02-20T10:00:00Z",
  "tickets": [
    {
      "key": "DSYS-123",
      "summary": "Update Button component props",
      "status": "In Progress",
      "priority": "High",
      "sprint": "Sprint 42",
      "relatedPRs": ["metamask-design-system#123"],
      "blockers": [],
      "dueDate": null
    }
  ]
}
```

## MCP Usage

Use Atlassian MCP tools:

- `mcp__atlassian__searchJiraIssuesUsingJql` - Search with JQL
- `mcp__atlassian__getJiraIssue` - Get full ticket details
- `mcp__atlassian__createJiraIssue` - Create new tickets
- `mcp__atlassian__transitionJiraIssue` - Update ticket status

## Automation Features

1. **Auto-link PRs to Tickets**

   - Scan PR descriptions for DSYS-XXX references
   - Update ticket with PR links

2. **Status Sync**

   - When PR is merged, suggest moving ticket to "Done"
   - When starting work, move ticket to "In Progress"

3. **Daily Summary**
   - List tickets by status
   - Highlight stale tickets (no update >3 days)
   - Identify missing estimates or descriptions
