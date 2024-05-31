import * as vscode from "vscode";
import { diffSelectionWithClipboard } from "./commands";
import { URI_SCHEME, textProvider } from "./text-provider";

export function activate(context: vscode.ExtensionContext) {
  let disposableCMD = vscode.commands.registerCommand(
    diffSelectionWithClipboard.name,
    diffSelectionWithClipboard.fn
  );

  let disposableText = vscode.workspace.registerTextDocumentContentProvider(
    URI_SCHEME,
    textProvider
  );

  context.subscriptions.push(disposableCMD);
  context.subscriptions.push(disposableText);
}

export function deactivate() {}
