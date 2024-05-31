/**
 * VSCode commands.
 * These commands are to be registered in extension.ts and package.json.
 * The command's "name" field must match the command name in package.json
 */

import * as vscode from "vscode";
import { setText } from "./text-provider";

interface Command {
  name: string;
  fn: () => Promise<void>;
}

/**
 * Compares the currently selected text in the active editor with the clipboard contents and opens a diff view.
 * The diff view will show the selected text as "old" changes and the clipboard content as ""
 */
export const diffSelectionWithClipboard: Command = {
  name: "diffSelectionWithClipboard.diff",
  fn: async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showInformationMessage("No active editor found");
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage("No text selected");
      return;
    }

    const selectedText = editor.document.getText(selection);
    const oldURI = setText(selectedText);

    const clipboardText = await vscode.env.clipboard.readText();
    const newURI = setText(clipboardText);

    // vscode.diff diffs two URIs
    // text-provider serves the text requested by vscode.diff through the URI
    vscode.commands.executeCommand(
      "vscode.diff",
      oldURI,
      newURI,
      "Diff: Selection ↔ Clipboard"
    );
  },
};
