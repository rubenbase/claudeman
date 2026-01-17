# ClaudeMan - Claude Configuration Manager

A lightweight VS Code/Cursor extension for managing Claude AI configuration files.

## Features

- **Global Configuration**: Manage your global Claude settings (`~/.config/claude/config.json`)
- **Project Configuration**: Create and edit per-project `CLAUDE.md` instruction files
- **Activity Bar View**: Quick access to both configuration types
- **File Templates**: Auto-generated templates for new configuration files

## Commands

- `Claude: Open Configuration Manager` - Open the main view
- `Claude: Edit Project Configuration` - Edit or create CLAUDE.md for current workspace
- `Claude: Edit Global Configuration` - Edit or create global Claude config

## Usage

1. Open the Claude Config activity bar icon (sidebar)
2. Click on "Global Configuration" or "Project Configuration" to edit
3. If files don't exist, the extension will offer to create them from templates

## Project Configuration (CLAUDE.md)

The `CLAUDE.md` file lives in your project root and provides Claude with:
- Project overview and tech stack
- Code style preferences
- Testing conventions
- AI-specific instructions

## Global Configuration

Located at `~/.config/claude/config.json`, this stores:
- API keys
- Default model preferences
- Token limits
- Temperature settings

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
