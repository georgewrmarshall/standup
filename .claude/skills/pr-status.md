# Check PR Status

Monitor pull request status across MetaMask repositories for standup reporting.

## Tracked Repositories

- MetaMask/metamask-design-system
- MetaMask/metamask-extension
- MetaMask/metamask-mobile

## Information to Gather

### Your PRs

For user `georgewrmarshall`:

1. **Open PRs**

   - PR number, title, and status
   - Review status (approved, changes requested, pending)
   - CI/CD status (passing, failing, pending)
   - Days since last update
   - Blockers or review comments

2. **Recently Merged** (last 24-48 hours)

   - PR number and title
   - Merge time
   - Associated Jira tickets

3. **Awaiting Your Review**
   - PRs where you're requested as reviewer
   - Priority based on age and author

### Format Output

```markdown
## PR Status Report

### Your Open PRs

- **metamask-design-system**

  - #123: Add new Button variant (✅ Approved, waiting for CI)
  - #124: Fix type definitions (⏳ Awaiting review - 2 days)

- **metamask-extension**
  - #4567: Update confirmation flow (🔄 Changes requested)

### Recently Merged (Last 24h)

- metamask-design-system #122: Update color tokens
- metamask-mobile #890: Fix Android build issue

### Awaiting Your Review

- metamask-extension #4568 by @teammate (High priority - 3 days old)
- metamask-design-system #125 by @otherdev (New - submitted today)

### Blockers

- PR #123: CI failing on unrelated test
- PR #4567: Need clarification on design requirement
```

## GitHub MCP Integration

Use GitHub MCP tools to:

- List PRs by author
- Check PR review status
- Get PR comments and reviews
- Check CI/CD status via checks API

## Automation

This skill should:

1. Automatically check all three repos
2. Highlight urgent items (old PRs, failed CI)
3. Link to Jira tickets mentioned in PR descriptions
4. Identify patterns (e.g., multiple PRs blocked by same issue)
