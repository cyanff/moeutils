/**
 * Compares the currently selected text in the active editor with the clipboard contents and opens a diff view.
 * The diff view will show the selected text as "old" changes and the clipboard content as "new"
 */

import * as vsc from "vscode";
import { Command } from "../lib/types";
import { URI_SCHEME, setText, textProvider } from "../providers/text";

export const initDifSelectionWithClipboardCMD = (context: vsc.ExtensionContext) => {
  let disposableCMD = vsc.commands.registerCommand(cmd.name, cmd.fn);
  context.subscriptions.push(disposableCMD);
  let disposableTextProvider = vsc.workspace.registerTextDocumentContentProvider(URI_SCHEME, textProvider);
  context.subscriptions.push(disposableTextProvider);
};

const cmd: Command = {
  name: "moe.diffSelectionWithClipboard",
  fn: async () => {
    const editor = vsc.window.activeTextEditor;

    if (!editor) {
      vsc.window.showInformationMessage("No active editor found");
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vsc.window.showInformationMessage("No text selected");
      return;
    }

    const selectedText = editor.document.getText(selection);
    const oldURI = setText(selectedText);

    const clipboardText = await vsc.env.clipboard.readText();
    const newURI = setText(clipboardText);

    // The VS Code built-in command "vscode.diff" compares two URIs
    // The text provider serves the text requested by "vscode.diff" through the URI
    vsc.commands.executeCommand("vscode.diff", oldURI, newURI, "Diff: Selection ↔ Clipboard");
  }
};
