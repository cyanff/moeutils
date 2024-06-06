/**
 * A place to put code to trigger during development
 */

import vs from "vscode";
import { Command } from "../lib/types";
import { addMissingImportsFileTreeProvider } from "../providers/add-missing-imports-file-tree";

export function initDevCMD(context: vs.ExtensionContext) {
  let disposableCMD = vs.commands.registerCommand(cmd.name, cmd.fn);
  context.subscriptions.push(disposableCMD);
}

const cmd: Command = {
  name: "moe.dev",
  fn: async () => {
    console.log("Dev command triggered");
    vs.window.showInformationMessage("Dev command triggered");
    addMissingImportsFileTreeProvider.refresh();
  }
};
