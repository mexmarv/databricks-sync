import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface DatabricksObject {
    object_type: 'NOTEBOOK' | 'DIRECTORY' | 'LIBRARY' | 'FILE';
    path: string;
    object_id: number;
    language?: string;
}

export class DatabricksApi {
    private axiosInstance: AxiosInstance | undefined;

    constructor() {
        this.updateConnection();
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('databricksSync')) {
                this.updateConnection();
            }
        });
    }

    private updateConnection() {
        const config = vscode.workspace.getConfiguration('databricksSync');
        const host = config.get<string>('host');
        const token = config.get<string>('token');

        if (host && token) {
            this.axiosInstance = axios.create({
                baseURL: host.replace(/\/$/, ''),
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } else {
            this.axiosInstance = undefined;
        }
    }

    private getClient(): AxiosInstance {
        if (!this.axiosInstance) {
            throw new Error('Databricks configuration missing. Please set host and token.');
        }
        return this.axiosInstance;
    }

    private handleError(error: any, path: string): never {
        if (error.response) {
            if (error.response.status === 404) {
                throw vscode.FileSystemError.FileNotFound(path);
            }
            const data = error.response.data;
            const message = data && (data.message || data.error_code) 
                ? `${data.error_code ? data.error_code + ': ' : ''}${data.message}`
                : error.message;
            throw new Error(`Databricks API Error: ${message} (Status: ${error.response.status})`);
        }
        throw error;
    }

    async list(path: string): Promise<DatabricksObject[]> {
        try {
            const response = await this.getClient().get('/api/2.0/workspace/list', {
                params: { path }
            });
            return response.data.objects || [];
        } catch (error: any) {
            this.handleError(error, path);
        }
    }

    async getStatus(path: string): Promise<DatabricksObject> {
        try {
            const response = await this.getClient().get('/api/2.0/workspace/get-status', {
                params: { path }
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error, path);
        }
    }

    async export(path: string): Promise<Uint8Array> {
        try {
            // Try AUTO format first to handle both Notebooks and Workspace Files correctly
            const response = await this.getClient().get('/api/2.0/workspace/export', {
                params: { path, format: 'AUTO' }
            });
            const content = response.data.content; // Base64
            if (content === null || content === undefined) {
                 return new Uint8Array(0);
            }
            return Buffer.from(content, 'base64');
        } catch (error: any) {
            // If AUTO fails (e.g. older API version), fallback to SOURCE
             if (error.response && error.response.status === 400) {
                 try {
                    const response = await this.getClient().get('/api/2.0/workspace/export', {
                        params: { path, format: 'SOURCE' }
                    });
                    const content = response.data.content;
                    if (content === null || content === undefined) {
                        return new Uint8Array(0);
                   }
                   return Buffer.from(content, 'base64');
                 } catch (fallbackError) {
                     // Ignore fallback error and throw original or handle
                 }
             }
            this.handleError(error, path);
        }
    }

    async import(path: string, content: Uint8Array, overwrite: boolean = true): Promise<void> {
        const base64Content = Buffer.from(content).toString('base64');
        try {
            // Use AUTO to support both Notebooks and Workspace Files (e.g. .yaml, .txt)
            await this.getClient().post('/api/2.0/workspace/import', {
                path,
                content: base64Content,
                format: 'AUTO',
                overwrite
            });
        } catch (error: any) {
             this.handleError(error, path);
        }
    }

    async mkdirs(path: string): Promise<void> {
        try {
            await this.getClient().post('/api/2.0/workspace/mkdirs', { path });
        } catch (error: any) {
            this.handleError(error, path);
        }
    }

    async delete(path: string, recursive: boolean = false): Promise<void> {
        try {
            await this.getClient().post('/api/2.0/workspace/delete', { path, recursive });
        } catch (error: any) {
             this.handleError(error, path);
        }
    }

    async getCurrentUser(): Promise<string | undefined> {
        try {
            // Try to get current user info using SCIM Me endpoint
            const response = await this.getClient().get('/api/2.0/preview/scim/v2/Me');
            const userName = response.data.userName;
            if (userName) {
                return `/Users/${userName}`;
            }
        } catch (error) {
            // Fallback or ignore if endpoint not available/permitted
            console.warn('Could not fetch current user:', error);
        }
        return undefined;
    }
}
