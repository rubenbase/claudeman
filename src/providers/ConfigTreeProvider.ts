import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConfigManager } from '../services/ConfigManager';

export class ConfigTreeProvider implements vscode.TreeDataProvider<ConfigItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ConfigItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private _badge: vscode.ViewBadge | undefined;

  constructor(private configManager: ConfigManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
    this.updateBadge();
  }

  async updateBadge(): Promise<void> {
    const isInWorkspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
    const hasProject = await this.configManager.hasProjectConfig();
    const hasProjectFolder = await this.configManager.hasProjectClaudeFolder();

    if (isInWorkspace && (!hasProject || !hasProjectFolder)) {
      const missing: string[] = [];
      if (!hasProject) missing.push('CLAUDE.md');
      if (!hasProjectFolder) missing.push('.claude/ folder');

      const count = missing.length;
      const tooltip = `Missing: ${missing.join(', ')}`;
      this._badge = { value: count, tooltip };
    } else {
      this._badge = undefined;
    }
  }

  get badge(): vscode.ViewBadge | undefined {
    return this._badge;
  }

  getTreeItem(element: ConfigItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ConfigItem): Promise<ConfigItem[]> {
    if (!element) {
      const hasGlobalFolder = await this.configManager.hasGlobalClaudeFolder();
      const hasGlobal = await this.configManager.hasGlobalConfig();
      const hasProject = await this.configManager.hasProjectConfig();
      const hasProjectFolder = await this.configManager.hasProjectClaudeFolder();
      const globalDir = this.configManager.getGlobalConfigDir();
      const projectDir = await this.configManager.getProjectClaudeDir();

      return [
        new ConfigItem(
          'Global ~/.claude Folder',
          hasGlobalFolder ? '✓ Exists' : '✗ Not found',
          'claudeman.createGlobalClaudeFolder',
          hasGlobalFolder ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'global-folder',
          'global-claude-folder',
          hasGlobalFolder ? vscode.Uri.file(globalDir) : undefined,
          'root-folder'
        ),
        new ConfigItem(
          'Global Configuration',
          hasGlobal ? '✓ Configured' : '✗ Not configured',
          'claudeman.editGlobalConfig',
          vscode.TreeItemCollapsibleState.None,
          'global-config',
          'config',
          undefined,
          'config'
        ),
        new ConfigItem(
          'Project CLAUDE.md',
          hasProject ? '✓ Exists' : '✗ Not found',
          'claudeman.editProjectConfig',
          vscode.TreeItemCollapsibleState.None,
          'project-md',
          'config',
          undefined,
          'config'
        ),
        new ConfigItem(
          'Project .claude/ Folder',
          hasProjectFolder ? '✓ Exists' : '✗ Not found',
          'claudeman.createProjectClaudeFolder',
          hasProjectFolder ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'project-folder',
          'project-claude-folder',
          hasProjectFolder && projectDir ? vscode.Uri.file(projectDir) : undefined,
          'root-folder'
        ),
      ];
    }

    // Handle children of Project .claude/ Folder
    if (element?.id === 'project-folder') {
      const hasSkills = await this.configManager.hasProjectSkills();
      const hasMcp = await this.configManager.hasProjectMcp();
      const skillsDir = await this.configManager.getProjectSkillsDir();
      const mcpDir = await this.configManager.getProjectMcpDir();

      return [
        new ConfigItem(
          'Skills',
          hasSkills ? '✓ Exists' : '✗ Not found',
          'claudeman.createProjectSkills',
          hasSkills ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'project-skills',
          'skills-folder',
          skillsDir ? vscode.Uri.file(skillsDir) : undefined,
          'skills'
        ),
        new ConfigItem(
          'MCP',
          hasMcp ? '✓ Exists' : '✗ Not found',
          'claudeman.createProjectMcp',
          hasMcp ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'project-mcp',
          'mcp-folder',
          mcpDir ? vscode.Uri.file(mcpDir) : undefined,
          'mcp'
        ),
      ];
    }

    // Handle children of Skills folder
    if (element?.id === 'project-skills') {
      const skillsDir = await this.configManager.getProjectSkillsDir();
      if (skillsDir) {
        return await this.getDirectoryChildren(skillsDir, true);
      }
    }

    // Handle children of MCP folder
    if (element?.id === 'project-mcp') {
      const mcpDir = await this.configManager.getProjectMcpDir();
      if (mcpDir) {
        return await this.getDirectoryChildren(mcpDir, false);
      }
    }

    // Handle children of Global .claude/ Folder
    if (element?.id === 'global-folder') {
      const hasSkills = await this.configManager.hasGlobalSkills();
      const hasMcp = await this.configManager.hasGlobalMcp();
      const skillsDir = await this.configManager.getGlobalSkillsDir();
      const mcpDir = await this.configManager.getGlobalMcpDir();

      return [
        new ConfigItem(
          'Skills',
          hasSkills ? '✓ Exists' : '✗ Not found',
          'claudeman.createGlobalSkills',
          hasSkills ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'global-skills',
          'skills-folder',
          skillsDir ? vscode.Uri.file(skillsDir) : undefined,
          'skills'
        ),
        new ConfigItem(
          'MCP',
          hasMcp ? '✓ Exists' : '✗ Not found',
          'claudeman.createGlobalMcp',
          hasMcp ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          'global-mcp',
          'mcp-folder',
          mcpDir ? vscode.Uri.file(mcpDir) : undefined,
          'mcp'
        ),
      ];
    }

    // Handle children of Global Skills folder
    if (element?.id === 'global-skills') {
      const skillsDir = await this.configManager.getGlobalSkillsDir();
      if (skillsDir) {
        return await this.getDirectoryChildren(skillsDir, true);
      }
    }

    // Handle children of Global MCP folder
    if (element?.id === 'global-mcp') {
      const mcpDir = await this.configManager.getGlobalMcpDir();
      if (mcpDir) {
        return await this.getDirectoryChildren(mcpDir, false);
      }
    }

    // Handle recursive folder/file children
    if (element?.contextValue === 'folder' || element?.contextValue === 'skill-folder') {
      const folderPath = element.resourceUri?.fsPath;
      if (folderPath) {
        // Don't pass isSkillsFolder=true for nested folders
        return await this.getDirectoryChildren(folderPath, false);
      }
    }

    return [];
  }

  private async getDirectoryChildren(dirPath: string, isSkillsFolder: boolean = false): Promise<ConfigItem[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items: ConfigItem[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();

        // Mark top-level folders in skills directory as 'skill-folder'
        const contextValue = isSkillsFolder && isDirectory ? 'skill-folder' : (isDirectory ? 'folder' : 'file');

        items.push(
          new ConfigItem(
            entry.name,
            '',
            'claudeman.openFile',
            isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            fullPath, // Use full path as unique ID
            contextValue,
            vscode.Uri.file(fullPath),
            isDirectory ? 'folder' : 'file'
          )
        );
      }

      return items.sort((a, b) => {
        // Folders first, then files, both alphabetically
        const aIsFolder = a.contextValue === 'folder' || a.contextValue === 'skill-folder';
        const bIsFolder = b.contextValue === 'folder' || b.contextValue === 'skill-folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.label.localeCompare(b.label);
      });
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  }
}

class ConfigItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly commandId: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id?: string,
    public readonly contextValue?: string,
    public readonly resourceUri?: vscode.Uri,
    public readonly itemType?: 'folder' | 'file' | 'config' | 'root-folder' | 'skills' | 'mcp'
  ) {
    super(label, collapsibleState);
    this.id = id;
    this.description = description;
    this.contextValue = contextValue;
    this.resourceUri = resourceUri;

    // Set icons based on type
    this.iconPath = this.getIcon(itemType, contextValue);

    // Set tooltip for better UX
    this.tooltip = this.getTooltip();

    // Make collapsible items clickable by removing command
    // This allows the entire row to expand/collapse
    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      // Only set command for non-collapsible items
      this.command = {
        command: commandId,
        title: label,
        arguments: [resourceUri]
      };
    }
  }

  private getIcon(itemType?: string, contextValue?: string): vscode.ThemeIcon | undefined {
    // Use ThemeIcon for consistent styling with VSCode themes
    if (itemType === 'root-folder' || itemType === 'folder' || contextValue === 'folder') {
      return new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.blue'));
    }
    if (itemType === 'skills') {
      return new vscode.ThemeIcon('symbol-method', new vscode.ThemeColor('charts.purple'));
    }
    if (itemType === 'mcp') {
      return new vscode.ThemeIcon('plug', new vscode.ThemeColor('charts.green'));
    }
    if (itemType === 'config') {
      return new vscode.ThemeIcon('gear', new vscode.ThemeColor('charts.orange'));
    }
    if (itemType === 'file' || contextValue === 'file') {
      return new vscode.ThemeIcon('file');
    }
    return undefined;
  }

  private getTooltip(): string {
    const baseTooltip = this.label;
    if (this.description) {
      return `${baseTooltip} - ${this.description}`;
    }
    if (this.resourceUri) {
      return `${baseTooltip}\n${this.resourceUri.fsPath}`;
    }
    return baseTooltip;
  }
}
