# Databricks Sync for VS Code

**Databricks Sync** allows you to edit and sync files directly from your Databricks Workspace in VS Code. It creates a virtual file system, so you can open, edit, and save files (Notebooks, Python scripts, YAML, Shell scripts, etc.) without manually downloading or uploading them.

## Features

- **Virtual File System:** Browse and edit Databricks files as if they were local.
- **Auto-Format Support:** Automatically handles both Databricks Notebooks (`SOURCE`) and Workspace Files (`AUTO` format for `.yaml`, `.sh`, `.txt`, etc.).
- **Direct Sync:** Saving a file in VS Code immediately updates it in the Databricks Workspace.
- **Secure:** Uses your Databricks Personal Access Token (PAT).

## Installation

1.  Download the latest `.vsix` release (e.g., `databricks-sync-0.0.4.vsix`).
2.  Open VS Code.
3.  Go to the **Extensions** view (`Cmd+Shift+X`).
4.  Click the **...** (Views and More Actions) menu -> **Install from VSIX...**.
5.  Select the `.vsix` file.
6.  **Reload** the window.

## Configuration

Before using the extension, you must configure your Databricks credentials:

1.  Open VS Code **Settings** (`Cmd+,`).
2.  Search for `Databricks Sync`.
3.  Set the following:
    *   **Host:** Your Databricks Workspace URL (e.g., `https://adb-123456789.0.azuredatabricks.net`).
    *   **Token:** Your Personal Access Token (PAT).
        *   *To generate a token: Go to Databricks -> Settings -> Developer -> Access Tokens -> Manage -> Generate New Token.*

## Usage

1.  Open the **Command Palette** (`Cmd+Shift+P`).
2.  Run the command: **`Databricks: Open Workspace`**.
3.  Enter the path you want to open (defaults to your user home, e.g., `/Users/your.email@example.com`).
4.  The folder will open in your VS Code workspace. You can now browse and edit files!

## Troubleshooting

### "400 Bad Request" when saving
*   This usually happens if the file format is not compatible with the API mode.
*   **Fix:** Ensure you are using version **0.0.4** or later, which uses `format: 'AUTO'` to support all file types (YAML, Shell, etc.).

### "File Not Found"
*   Ensure the path is correct and exists in your Databricks Workspace.
*   Ensure your Token has permissions to access that path.

## Development

### Build
```bash
npm install
npm run compile
```

### Package
```bash
npx vsce package
```

---
**Disclaimer:** This is a community-developed extension and is not officially affiliated with Databricks.
