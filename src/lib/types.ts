export type Result<T, E extends Error> = { kind: "ok"; value: T } | { kind: "err"; error: E };

/**
 * Editor commands
 * These commands are to be registered in extension.ts and package.json.
 * The command's "name" field must match the command name in package.json
 */
export interface Command {
  name: string;
  fn: () => Promise<void>;
}
