import * as vscode from 'vscode';
import { DatabricksFileSystemProvider } from './databricksFileSystemProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Databricks Sync extension is now active!');

    const databricksProvider = new DatabricksFileSystemProvider();

    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('databricks', databricksProvider, { isCaseSensitive: true }));

    context.subscriptions.push(vscode.commands.registerCommand('databricksSync.openWorkspace', async () => {
        // Check configuration
        const config = vscode.workspace.getConfiguration('databricksSync');
        const host = config.get<string>('host');
        const token = config.get<string>('token');

        if (!host || !token) {
            const setConfig = await vscode.window.showErrorMessage(
                'Databricks Host or Token is not configured. Please configure them in Settings.',
                'Open Settings'
            );
            if (setConfig === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'databricksSync');
            }
            return;
        }

        // Try to guess the user's home directory
        let defaultPath = '/';
        try {
             // We need a temporary instance to fetch the user
             // Note: In a real app, we should probably share the instance or make it static properly,
             // but since databricksProvider is initialized with 'new DatabricksApi()', we can access it via the provider if we expose it,
             // or just create a new one here as it's cheap (just config read).
             // However, databricksProvider.api is private.
             // Let's just instantiate a temporary api helper.
             const api = new (require('./databricksApi').DatabricksApi)(); 
             const userHome = await api.getCurrentUser();
             if (userHome) {
                 defaultPath = userHome;
             }
        } catch (e) {
            console.warn('Failed to auto-detect user home', e);
        }

        const path = await vscode.window.showInputBox({
            prompt: 'Enter the Databricks folder path to open',
            value: defaultPath,
            placeHolder: '/Users/me/project'
        });

        if (path !== undefined) {
            const uri = vscode.Uri.parse(`databricks:${path}`);
            const name = `Databricks: ${path}`;
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, 0, { uri, name });
        }
    }));
}

export function deactivate() {}
