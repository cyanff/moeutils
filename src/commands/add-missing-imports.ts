import { text } from "stream/consumers";
import * as vs from "vscode";
import { Command } from "../lib/types";
import { addMissingImportsFileTreeProvider, displayIncludedFiles } from "../providers/add-missing-imports-file-tree";

const IMPORT_DIAGNOSTIC_CODES = new Set([2552, 2304]);
const IMPORT_FIX_NAME = "import";
const FIX_ALL_COMMAND = "_typescript.applyFixAllCodeAction";

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

const applyMissingImportsCMD: Command = {
  name: "moe.applyAddMissingImports",
  fn: async () => {
    vs.window.showInformationMessage(`Applying missing imports to ${files.length} files`);

    const importDiagnostics = await getImportDiagnostics(files);
    for (const { uri, diagnostics } of importDiagnostics) {
      const textEdits: vs.TextEdit[] = [];

      for (const d of diagnostics) {
        const actions = await vs.commands.executeCommand<vs.CodeAction[]>(
          "vscode.executeCodeActionProvider",
          uri,
          d.range
        );
        for (const a of actions) {
          if (a.edit && a.command?.arguments?.[0]?.action?.fixName === IMPORT_FIX_NAME) {
            textEdits.push(...a.edit.get(uri));
          }
        }
      }
      const combinedEdits = new vs.WorkspaceEdit();
      combinedEdits.set(uri, textEdits);
      vs.workspace.applyEdit(combinedEdits);
    }
  }
};

// =========================================================
//  Helpers
// =========================================================
interface FileDiagnostics {
  uri: vs.Uri;
  diagnostics: vs.Diagnostic[];
}

interface ApplyFixAllCodeActionArg {
  action: { fixName: any };
}

function getImportDiagnostics(files: vs.Uri[]): FileDiagnostics[] {
  const ret: FileDiagnostics[] = [];
  for (const file of files) {
    const diagnostics = vs.languages.getDiagnostics(file);
    const importDiagnostic: vs.Diagnostic[] = diagnostics.filter(
      (d) => typeof d.code === "number" && IMPORT_DIAGNOSTIC_CODES.has(d.code)
    );
    ret.push({ uri: file, diagnostics: importDiagnostic });
  }
  return ret;
}
