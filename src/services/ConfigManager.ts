import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';

export class ConfigManager {
  private globalConfigDir: string;
  private globalSettingsPath: string;

  constructor() {
    // Official Claude Code uses ~/.claude/ for user-level config
    this.globalConfigDir = path.join(os.homedir(), '.claude');
    this.globalSettingsPath = path.join(this.globalConfigDir, 'settings.json');
  }

  getGlobalConfigDir(): string {
    return this.globalConfigDir;
  }

  getGlobalConfigPath(): string {
    return this.globalSettingsPath;
  }

  async ensureGlobalConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.globalConfigDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create global config directory:', error);
    }
  }

  getGlobalConfigTemplate(): string {
    return JSON.stringify({
      "permissions": {
        "allow": [],
        "deny": []
      },
      "env": {}
    }, null, 2);
  }

  getProjectConfigTemplate(): string {
    return `# Claude Project Configuration

Add your project-specific instructions for Claude here.

## Project Overview
- Describe your project
- Tech stack
- Important conventions

## Code Style
- Formatting preferences
- Naming conventions
- Testing approach

## AI Instructions
- How Claude should help with this project
- What to avoid
- Preferred patterns
`;
  }

  async getProjectConfigPath(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }

    // Check for CLAUDE.md in root first, then .claude/CLAUDE.md
    const rootPath = path.join(workspaceFolder.uri.fsPath, 'CLAUDE.md');
    try {
      await fs.access(rootPath);
      return rootPath;
    } catch {
      return path.join(workspaceFolder.uri.fsPath, '.claude', 'CLAUDE.md');
    }
  }

  async getProjectClaudeDir(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    return path.join(workspaceFolder.uri.fsPath, '.claude');
  }

  async hasProjectConfig(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    // Check for CLAUDE.md in root or .claude/CLAUDE.md
    const rootPath = path.join(workspaceFolder.uri.fsPath, 'CLAUDE.md');
    const dotClaudePath = path.join(workspaceFolder.uri.fsPath, '.claude', 'CLAUDE.md');

    try {
      await fs.access(rootPath);
      return true;
    } catch {
      try {
        await fs.access(dotClaudePath);
        return true;
      } catch {
        return false;
      }
    }
  }

  async hasProjectClaudeFolder(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const claudeDir = path.join(workspaceFolder.uri.fsPath, '.claude');
    try {
      const stats = await fs.stat(claudeDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async hasGlobalConfig(): Promise<boolean> {
    try {
      await fs.access(this.globalSettingsPath);
      return true;
    } catch {
      return false;
    }
  }

  async hasGlobalClaudeFolder(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.globalConfigDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async ensureProjectClaudeDir(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open');
    }

    const claudeDir = path.join(workspaceFolder.uri.fsPath, '.claude');
    try {
      await fs.mkdir(claudeDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create project .claude directory:', error);
      throw error;
    }
  }

  async hasProjectSkills(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const skillsDir = path.join(workspaceFolder.uri.fsPath, '.claude', 'skills');
    try {
      const stats = await fs.stat(skillsDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async hasProjectMcp(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const mcpDir = path.join(workspaceFolder.uri.fsPath, '.claude', 'mcp');
    try {
      const stats = await fs.stat(mcpDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async ensureProjectSkillsDir(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open');
    }

    const skillsDir = path.join(workspaceFolder.uri.fsPath, '.claude', 'skills');
    try {
      await fs.mkdir(skillsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create project skills directory:', error);
      throw error;
    }
  }

  async ensureProjectMcpDir(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open');
    }

    const mcpDir = path.join(workspaceFolder.uri.fsPath, '.claude', 'mcp');
    try {
      await fs.mkdir(mcpDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create project mcp directory:', error);
      throw error;
    }
  }

  async getProjectSkillsDir(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    return path.join(workspaceFolder.uri.fsPath, '.claude', 'skills');
  }

  async getProjectMcpDir(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    return path.join(workspaceFolder.uri.fsPath, '.claude', 'mcp');
  }

  async hasGlobalSkills(): Promise<boolean> {
    const skillsDir = path.join(this.globalConfigDir, 'skills');
    try {
      const stats = await fs.stat(skillsDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async hasGlobalMcp(): Promise<boolean> {
    const mcpDir = path.join(this.globalConfigDir, 'mcp');
    try {
      const stats = await fs.stat(mcpDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async getGlobalSkillsDir(): Promise<string | undefined> {
    const skillsDir = path.join(this.globalConfigDir, 'skills');
    try {
      const stats = await fs.stat(skillsDir);
      if (stats.isDirectory()) {
        return skillsDir;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  async getGlobalMcpDir(): Promise<string | undefined> {
    const mcpDir = path.join(this.globalConfigDir, 'mcp');
    try {
      const stats = await fs.stat(mcpDir);
      if (stats.isDirectory()) {
        return mcpDir;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  async ensureGlobalSkillsDir(): Promise<void> {
    const skillsDir = path.join(this.globalConfigDir, 'skills');
    try {
      await fs.mkdir(skillsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create global skills directory:', error);
      throw error;
    }
  }

  async ensureGlobalMcpDir(): Promise<void> {
    const mcpDir = path.join(this.globalConfigDir, 'mcp');
    try {
      await fs.mkdir(mcpDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create global mcp directory:', error);
      throw error;
    }
  }
}
