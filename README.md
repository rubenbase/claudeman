# ClaudeMan - Claude Configuration Manager

A lightweight VS Code/Cursor extension for managing Claude AI configuration files.

## Features

- **Global Configuration**: Manage your global Claude settings (`~/.claude/settings.json`)
- **Project Configuration**: Create and edit per-project `CLAUDE.md` instruction files
- **Skills & MCP Management**: Organize and manage Claude skills and MCP servers
- **File Management**: Create, rename, and delete folders and files directly from the tree view
- **Activity Bar View**: Quick access to all configuration types
- **File Templates**: Auto-generated templates for new configuration files
- **Tree View Navigation**: Hierarchical view of all Claude-related files and folders

## Commands

- `Claude: Open Configuration Manager` - Open the main view
- `Claude: Edit Project Configuration` - Edit or create CLAUDE.md for current workspace
- `Claude: Edit Global Configuration` - Edit or create global Claude config

## Usage

### Basic Navigation
1. Open the Claude Config activity bar icon (sidebar)
2. Click on "Global Configuration" or "Project Configuration" to edit
3. If files don't exist, the extension will offer to create them from templates

### File Management
Right-click on any folder in the tree view to:
- **New Folder**: Create a new subfolder
- **New File**: Create a new file and open it for editing
- **Rename**: Rename folders or files
- **Delete**: Delete folders or files (moved to trash for safety)

### Skills & MCP Organization
- Navigate to the Skills or MCP folders in either global (`~/.claude/`) or project (`.claude/`) locations
- Use the context menu to create new skill folders or MCP configurations
- Copy skill names by right-clicking on skill folders

## Project Configuration (CLAUDE.md)

The `CLAUDE.md` file lives in your project root and provides Claude with:
- Project overview and tech stack
- Code style preferences
- Testing conventions
- AI-specific instructions

## Global Configuration

Located at `~/.claude/settings.json`, this stores:
- Permissions (allow/deny lists)
- Environment variables
- Global skills and MCP servers

## Development

```bash
pnpm install
pnpm run dev    # Watch mode
pnpm run build  # Production build
```

## Publishing

To publish a new version to the VSCode Marketplace:

1. Create a `.env` file in the project root (see `.env.example`)
2. Add your VSCE Personal Access Token:
   ```
   VSCE_PAT=your-token-here
   ```
3. Run the release command:
   ```bash
   pnpm run release
   ```

**Note**: Never commit your `.env` file. It's already in `.gitignore` to prevent accidental leaks.

## Installation

### From VSCode Marketplace

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "Claudeman"
4. Click Install

Or visit: [Claudeman on VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=gobrand.claudeman)

### From Source

1. Clone this repository
2. Run `pnpm install`
3. Run `pnpm run build`
4. Press F5 in VS Code to launch Extension Development Host
5. Or package with `vsce package` and install the .vsix file

## Future Plans

- Support for additional AI assistant configurations
- Templates library
- Configuration validation
- Multi-workspace support
- JetBrains IDE support

## License

ISC
