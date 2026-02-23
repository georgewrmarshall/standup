# Standup App - AI-First Daily Standup Assistant

An AI-powered standup app built with MetaMask Design System components to help track todos, GitHub PRs, Jira tickets, and generate daily standup messages for Slack.

## Features

- **Todo Management**: Track daily todos with priority levels (P0-P3) and markdown export
- **GitHub Integration**: Monitor PRs across MetaMask repositories
- **Jira Board**: Track DSYS project tickets in kanban view
- **Standup Generator**: Automatically generate formatted Slack standup messages
- **AI-Powered**: Uses Claude Code with MCP servers for intelligent assistance

## Tech Stack

- React 18 with TypeScript
- MetaMask Design System components
- Tailwind CSS with MetaMask preset
- Vite for build tooling
- React Router for navigation
- Date-fns for date handling

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 4.x
- Claude Code with MCP servers configured:
  - GitHub MCP for PR tracking
  - Atlassian MCP for Jira integration

## Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at http://localhost:3000

## Project Structure

```
standup/
├── .claude/               # Claude Code configuration
│   └── skills/           # AI skills for standup workflow
├── public/               # Static assets
│   └── fonts/           # MetaMask font files
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── stores/         # State management
│   └── main.tsx        # App entry point
├── todos/              # Markdown todo storage
├── standups/           # Generated standup messages
└── CLAUDE.md           # AI assistant instructions
```

## MCP Configuration

This app works best with the following MCP servers:

### GitHub MCP

Tracks PRs across these repositories:

- MetaMask/metamask-design-system
- MetaMask/metamask-extension
- MetaMask/metamask-mobile

### Atlassian MCP

Connects to Consensys Software Jira:

- Project: DSYS
- Board: https://consensyssoftware.atlassian.net/jira/software/c/projects/DSYS

## Usage

### Daily Workflow

1. **Morning Setup**

   - Open the Todos page and review yesterday's items
   - Mark completed tasks
   - Add new todos for today

2. **Check PR Status**

   - Navigate to Pull Requests page
   - Review open PRs and their review status
   - Address any changes requested

3. **Update Jira Board**

   - Go to Jira Board page
   - Move tickets through workflow states
   - Check sprint progress

4. **Generate Standup**
   - Click on Standup Generator
   - Review the auto-generated message
   - Copy and paste to Slack thread

### AI Skills

The app includes several AI skills in `.claude/skills/`:

- `standup-generate`: Generates daily standup message
- `todo-review`: Reviews and organizes todos
- `pr-status`: Checks PR status across repos
- `jira-sync`: Syncs Jira ticket information

## Development

### Prerequisites

- Node.js 20+ (LTS recommended)
- Yarn 4.x via [Corepack](https://github.com/nodejs/corepack?tab=readme-ov-file#how-to-install)
- If using [nvm](https://github.com/creationix/nvm#installation), run `nvm use` to select the correct Node version

### Setup

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts

- `yarn dev` - Start development server at http://localhost:3000
- `yarn build` - Build production bundle
- `yarn preview` - Preview production build locally
- `yarn test` - Run tests once
- `yarn test:watch` - Run tests in watch mode
- `yarn lint` - Check code quality
- `yarn lint:fix` - Fix linting issues automatically

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure tests pass
4. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Quality

- All code must pass linting and tests before merging
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
