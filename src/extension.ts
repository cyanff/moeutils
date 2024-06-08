import * as vsc from "vscode";
import { initDevCMD } from "./commands/dev";
import { initDifSelectionWithClipboardCMD } from "./commands/diff-selection-with-clipboard";

export function activate(context: vsc.ExtensionContext) {
  initDifSelectionWithClipboardCMD(context);
  initDevCMD(context);
}

export function deactivate() {}
