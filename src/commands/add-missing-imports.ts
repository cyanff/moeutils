import * as vs from "vscode";
import { Command } from "../lib/types";
import { addMissingImportsFileTreeProvider, displayIncludedFiles } from "../providers/add-missing-imports-file-tree";

export const initAddMissingImportsCMD = (context: vs.ExtensionContext) => {
  let disposableCMD = vs.commands.registerCommand(cmd.name, cmd.fn);
  context.subscriptions.push(disposableCMD);
  vs.window.registerTreeDataProvider("moe.addMissingImportsFileTree", addMissingImportsFileTreeProvider);
  vs.window.createTreeView("moe.addMissingImportsFileTree", {
    treeDataProvider: addMissingImportsFileTreeProvider
  });
};

const cmd: Command = {
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

    const files = matches.flat();
    vs.window.showInformationMessage(`Found ${files.length} files matching "${includes}"`);
    displayIncludedFiles(files);
    addMissingImportsFileTreeProvider.refresh();
  }
};
