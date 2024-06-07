/**
 * A place to put code to trigger during development
 */

import ts from "typescript";
import vs, { Diagnostic, WorkspaceEdit } from "vscode";
import { Command } from "../lib/types";

export function initDevCMD(context: vs.ExtensionContext) {
  let disposableCMD = vs.commands.registerCommand(cmd.name, cmd.fn);
  context.subscriptions.push(disposableCMD);
}

const cmd: Command = {
  name: "moe.dev",
  fn: async () => {
    const commands = await vs.commands.getCommands(false);
    console.log(commands);

    console.log("==================================================");

    const tsCommands = commands.filter((c) => c.startsWith("_typescript"));

    console.log(tsCommands);
  }
};
