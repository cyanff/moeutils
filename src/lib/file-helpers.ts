import * as vs from "vscode";

interface FileDiagnostics {
  uri: vs.Uri;
  diagnostics: vs.Diagnostic[];
}

export async function getEntireFileRange(file: vs.Uri) {
  const doc = await vs.workspace.openTextDocument(file);
  const start = new vs.Position(0, 0);
  const end = doc.lineAt(doc.lineCount - 1).range.end;
  const range = new vs.Range(start, end);
  return range;
}
