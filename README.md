# Databricks Sync for VS Code

> **"Because scrolling in a browser is vertically challenging."** — *Marvin Nahmias*

This extension allows you to synchronize folders and files from your Databricks workspace directly into VS Code (or Trae/Cursor), edit them locally, and sync changes back automatically on save.

**Works with:** VS Code, Trae, Cursor, and any VS Code-compatible editor.

## Features

- **Browse Databricks Workspace**: View your Databricks folders and notebooks as a file system in your editor.
- **Edit & Sync**: Open notebooks and files, edit them as source code, and save to update them in Databricks instantly.
- **Safe Mode**: Deletion is **disabled** from the extension to prevent accidental data loss. You can create and edit files, but you must use the Databricks UI to delete them.
- **Notebook Support**: Databricks notebooks are automatically exported as source code (Python, Scala, SQL, R) for editing.
- **Auto-User Detection**: Automatically detects your home folder (`/Users/you@example.com`) for quick access.

## Requirements

- A Databricks Workspace.
- A Personal Access Token (PAT).

## Installation

### From Marketplace

Search for `Databricks Sync` in the Extensions view (`Cmd+Shift+X`).

### From VSIX (Local Install)

1.  Download the `.vsix` file.
2.  Open your editor (VS Code, Trae, etc.).
3.  Open the **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`).
4.  Run **Extensions: Install from VSIX...**.
5.  Select the downloaded `.vsix` file.

## Configuration

Before using the extension, you must configure your Databricks credentials:

1.  Open **Settings** (`Cmd+,` or via the menu).
2.  Search for `Databricks Sync`.
3.  Set **Databricks Sync: Host** (e.g., `https://adb-1234567890123456.7.azuredatabricks.net`).
4.  Set **Databricks Sync: Token** (your PAT).

## Usage

1.  Open the **Command Palette** (`Cmd+Shift+P`).
2.  Run the command **Databricks: Open Workspace**.
3.  It will try to default to your user folder (e.g., `/Users/marvin@example.com`). Press **Enter**.
4.  A new workspace folder will be added, displaying your Databricks files.

## Safety & Limitations

- **No Deletion**: To prevent accidents, you cannot delete files or folders from within VS Code. Please use the Databricks web UI for cleanup.
- **Renaming**: Renaming is currently not supported via the extension.
- **Large Files**: Very large files may hit API limits.

## About the Author

**Marvin Nahmias**  
*Lover of Databricks & Coding Tools*

This project is released into the **Public Domain**. Use it, fork it, share it, break it. It's yours.

### 🍷 Buy Me a Wine

If this tool saved you from the "vertical scrolling hell" of the Databricks UI and you want to say thanks:

**Send money to buy a wine glass to:** `mexmarv@gmail.com`

---

