import * as vscode from 'vscode';
import { DatabricksApi, DatabricksObject } from './databricksApi';

export class DatabricksFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;

    private api: DatabricksApi;

    constructor() {
        this.api = new DatabricksApi();
    }

    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        // Polling or real-time events not implemented efficiently, so we ignore for now.
        // In a real extension, we might poll or just rely on manual refresh.
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        try {
            const path = uri.path;
            // Root check
            if (path === '/' || path === '') {
                 return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
            }

            const object = await this.api.getStatus(path);
            return this.toFileStat(object);
        } catch (error) {
             throw vscode.FileSystemError.FileNotFound(uri);
        }
    }

    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const items = await this.api.list(uri.path);
        return items.map(item => {
            const name = item.path.split('/').pop() || item.path;
            const type = this.toFileType(item.object_type);
            return [name, type];
        });
    }

    async createDirectory(uri: vscode.Uri): Promise<void> {
        await this.api.mkdirs(uri.path);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Created, uri }]);
    }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const content = await this.api.export(uri.path);
        return content;
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Promise<void> {
        await this.api.import(uri.path, content, options.overwrite);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    async delete(uri: vscode.Uri, options: { recursive: boolean; }): Promise<void> {
        // Safety: Deletion is disabled to prevent accidental data loss in Databricks.
        // Users should only use this extension for editing/creating.
        // To delete files, they must use the Databricks UI.
        throw vscode.FileSystemError.NoPermissions('Deletion is disabled in this extension for safety. Please delete files via Databricks UI.');
    }

    async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): Promise<void> {
        // Basic rename via export/import/delete is risky without transactions, avoiding for now.
        throw vscode.FileSystemError.Unavailable('Rename not supported in this version.');
    }

    private toFileType(objectType: string): vscode.FileType {
        if (objectType === 'DIRECTORY') {
            return vscode.FileType.Directory;
        }
        return vscode.FileType.File;
    }

    private toFileStat(object: DatabricksObject): vscode.FileStat {
        return {
            type: this.toFileType(object.object_type),
            ctime: 0, // Not provided by basic list/get-status
            mtime: 0, // Not provided by basic list/get-status
            size: 0   // Not provided by basic list/get-status, can be fetched via export but that's expensive
        };
    }
}
