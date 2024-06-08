import * as vs from "vscode";
import { getEntireFileRange } from "../lib/file-helpers";
import { Command } from "../lib/types";
import { addMissingImportsFileTreeProvider, displayIncludedFiles } from "../providers/add-missing-imports-file-tree";

export const initAddMissingImportsCMD = (context: vs.ExtensionContext) => {
  let d1 = vs.commands.registerCommand(addMissingImportsCMD.name, addMissingImportsCMD.fn);
  context.subscriptions.push(d1);
  let d2 = vs.commands.registerCommand(applyMissingImportsCMD.name, applyMissingImportsCMD.fn);
  context.subscriptions.push(d2);
  vs.window.registerTreeDataProvider("moe.addMissingImportsFileTree", addMissingImportsFileTreeProvider);
  vs.window.createTreeView("moe.addMissingImportsFileTree", {
    treeDataProvider: addMissingImportsFileTreeProvider
  });
};

// =========================================================
//  Main Command
// =========================================================
let files: vs.Uri[] = [];

const addMissingImportsCMD: Command = {
  name: "moe.addMissingImports",
  fn: async () => {
    let includes = await vs.window.showInputBox({
      prompt: "Enter include patterns separated by commas"
    });
    if (includes === undefined) return;
    if (includes === "") includes = "*";

    const patterns = includes
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const wss = vs.workspace.workspaceFolders || [];
    const matches: vs.Uri[][] = [];

    for (const ws of wss) {
      for (const pattern of patterns) {
        const relativePattern = new vs.RelativePattern(ws, pattern);
        const files = await vs.workspace.findFiles(relativePattern, undefined);
        matches.push(files);
      }
    }

    files = matches.flat();
    vs.window.showInformationMessage(`Found ${files.length} files matching "${includes}"`);
    displayIncludedFiles(files);
  }
};

/**
 * 
 * type ApplyCodeActionCommand_args = {
    readonly document: vscode.TextDocument;
    readonly diagnostic: vscode.Diagnostic;
    readonly action: Proto.CodeFixAction;
    readonly followupAction?: Command;
  };
 */

const applyMissingImportsCMD: Command = {
  name: "moe.applyAddMissingImports",
  fn: async () => {
    vs.window.showInformationMessage(`Applying missing imports to ${files.length} files`);

    for (const file of files) {
      const range = await getEntireFileRange(file);

      const actions = await vs.commands.executeCommand<vs.CodeAction[]>(
        "vscode.executeCodeActionProvider",
        file,
        range
      );
      const fixAll = actions?.find((a) => a.title === "Add all missing imports");
      if (fixAll && fixAll.command) {
        vs.commands.executeCommand(fixAll.command.command, ...(fixAll.command.arguments || []));
        break;
      }
    }
  }
};
