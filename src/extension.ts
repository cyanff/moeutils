import * as vsc from "vscode";
import { initAddMissingImportsCMD } from "./commands/add-missing-imports";
import { initDevCMD } from "./commands/dev";
import { initDifSelectionWithClipboardCMD } from "./commands/diff-selection-with-clipboard";

export function activate(context: vsc.ExtensionContext) {
  initDifSelectionWithClipboardCMD(context);
  initAddMissingImportsCMD(context);
  initDevCMD(context);
}

export function deactivate() {}
