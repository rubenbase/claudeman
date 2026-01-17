import * as vscode from 'vscode';
import { ConfigTreeProvider } from './providers/ConfigTreeProvider';
import { ConfigManager } from './services/ConfigManager';

export function activate(context: vscode.ExtensionContext) {
  const configManager = new ConfigManager();
  const treeProvider = new ConfigTreeProvider(configManager);

  const treeView = vscode.window.createTreeView('claudeman.configView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: false
  });

  // Update badge on tree data changes
  treeProvider.onDidChangeTreeData(() => {
    treeView.badge = treeProvider.badge;
  });

  // Initial badge update
  treeProvider.updateBadge().then(() => {
    treeView.badge = treeProvider.badge;
  });

  context.subscriptions.push(treeView);

  // Watch for CLAUDE.md changes in workspace (both root and .claude/)
  const claudeMdWatcher = vscode.workspace.createFileSystemWatcher('**/CLAUDE.md');
  claudeMdWatcher.onDidCreate(() => treeProvider.refresh());
  claudeMdWatcher.onDidDelete(() => treeProvider.refresh());
  claudeMdWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(claudeMdWatcher);

  // Watch for .claude directory changes
  const claudeDirWatcher = vscode.workspace.createFileSystemWatcher('**/.claude/**');
  claudeDirWatcher.onDidCreate(() => treeProvider.refresh());
  claudeDirWatcher.onDidDelete(() => treeProvider.refresh());
  claudeDirWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(claudeDirWatcher);

  // Watch for workspace folder changes to update badge
  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    treeProvider.refresh();
  });

  // Watch for global ~/.claude directory changes
  const globalClaudeDir = configManager.getGlobalConfigDir();
  const globalWatcher = vscode.workspace.createFileSystemWatcher(`${globalClaudeDir}/**`);
  globalWatcher.onDidCreate(() => treeProvider.refresh());
  globalWatcher.onDidDelete(() => treeProvider.refresh());
  globalWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(globalWatcher);

  // Watch for project skills folder changes
  const projectSkillsWatcher = vscode.workspace.createFileSystemWatcher('**/.claude/skills/**');
  projectSkillsWatcher.onDidCreate(() => treeProvider.refresh());
  projectSkillsWatcher.onDidDelete(() => treeProvider.refresh());
  projectSkillsWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(projectSkillsWatcher);

  // Watch for project MCP folder changes
  const projectMcpWatcher = vscode.workspace.createFileSystemWatcher('**/.claude/mcp/**');
  projectMcpWatcher.onDidCreate(() => treeProvider.refresh());
  projectMcpWatcher.onDidDelete(() => treeProvider.refresh());
  projectMcpWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(projectMcpWatcher);

  // Watch for global skills folder changes
  const globalSkillsWatcher = vscode.workspace.createFileSystemWatcher(`${globalClaudeDir}/skills/**`);
  globalSkillsWatcher.onDidCreate(() => treeProvider.refresh());
  globalSkillsWatcher.onDidDelete(() => treeProvider.refresh());
  globalSkillsWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(globalSkillsWatcher);

  // Watch for global MCP folder changes
  const globalMcpWatcher = vscode.workspace.createFileSystemWatcher(`${globalClaudeDir}/mcp/**`);
  globalMcpWatcher.onDidCreate(() => treeProvider.refresh());
  globalMcpWatcher.onDidDelete(() => treeProvider.refresh());
  globalMcpWatcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(globalMcpWatcher);

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.openSettings', () => {
      vscode.window.showInformationMessage('Claude Config Manager');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.editProjectConfig', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }

      const configPath = vscode.Uri.joinPath(workspaceFolder.uri, 'CLAUDE.md');

      try {
        await vscode.workspace.fs.stat(configPath);
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
      } catch {
        const create = await vscode.window.showInformationMessage(
          'CLAUDE.md not found. Create it?',
          'Create',
          'Cancel'
        );

        if (create === 'Create') {
          const template = configManager.getProjectConfigTemplate();
          await vscode.workspace.fs.writeFile(configPath, Buffer.from(template, 'utf8'));
          const doc = await vscode.workspace.openTextDocument(configPath);
          await vscode.window.showTextDocument(doc);
          treeProvider.refresh();
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.editGlobalConfig', async () => {
      const globalConfigPath = configManager.getGlobalConfigPath();

      try {
        const doc = await vscode.workspace.openTextDocument(globalConfigPath);
        await vscode.window.showTextDocument(doc);
      } catch {
        const create = await vscode.window.showInformationMessage(
          'Global Claude config not found. Create it?',
          'Create',
          'Cancel'
        );

        if (create === 'Create') {
          const template = configManager.getGlobalConfigTemplate();
          await configManager.ensureGlobalConfigDir();
          await vscode.workspace.fs.writeFile(
            vscode.Uri.file(globalConfigPath),
            Buffer.from(template, 'utf8')
          );
          const doc = await vscode.workspace.openTextDocument(globalConfigPath);
          await vscode.window.showTextDocument(doc);
          treeProvider.refresh();
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.refresh', () => {
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createProjectClaudeFolder', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }

      const hasFolder = await configManager.hasProjectClaudeFolder();
      if (hasFolder) {
        vscode.window.showInformationMessage('Project .claude/ folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create .claude/ folder in project root?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureProjectClaudeDir();
          vscode.window.showInformationMessage('Created .claude/ folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create .claude/ folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createGlobalClaudeFolder', async () => {
      const hasFolder = await configManager.hasGlobalClaudeFolder();
      if (hasFolder) {
        vscode.window.showInformationMessage('Global ~/.claude folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create ~/.claude folder in your home directory?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureGlobalConfigDir();
          vscode.window.showInformationMessage('Created ~/.claude folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create ~/.claude folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createProjectSkills', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }

      const hasSkills = await configManager.hasProjectSkills();
      if (hasSkills) {
        vscode.window.showInformationMessage('Skills folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create .claude/skills/ folder?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureProjectSkillsDir();
          vscode.window.showInformationMessage('Created .claude/skills/ folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create skills folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createProjectMcp', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }

      const hasMcp = await configManager.hasProjectMcp();
      if (hasMcp) {
        vscode.window.showInformationMessage('MCP folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create .claude/mcp/ folder?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureProjectMcpDir();
          vscode.window.showInformationMessage('Created .claude/mcp/ folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create MCP folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createGlobalSkills', async () => {
      const hasSkills = await configManager.hasGlobalSkills();
      if (hasSkills) {
        vscode.window.showInformationMessage('Global skills folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create ~/.claude/skills/ folder?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureGlobalSkillsDir();
          vscode.window.showInformationMessage('Created ~/.claude/skills/ folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create global skills folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.createGlobalMcp', async () => {
      const hasMcp = await configManager.hasGlobalMcp();
      if (hasMcp) {
        vscode.window.showInformationMessage('Global MCP folder already exists');
        return;
      }

      const create = await vscode.window.showInformationMessage(
        'Create ~/.claude/mcp/ folder?',
        'Create',
        'Cancel'
      );

      if (create === 'Create') {
        try {
          await configManager.ensureGlobalMcpDir();
          vscode.window.showInformationMessage('Created ~/.claude/mcp/ folder');
          treeProvider.refresh();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create global MCP folder: ${error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeman.openFile', async (uri?: vscode.Uri) => {
      if (uri) {
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
      }
    })
  );
}

export function deactivate() {}
