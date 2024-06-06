import fsp from "fs/promises";
import * as vscode from "vscode";

// =========================================================
//  Result Utilities
// =========================================================
import { PathLike } from "fs";
import { Result } from "./types";

export function ok<T, E extends Error>(value: T): Result<T, E> {
  return { kind: "ok", value };
}
export function err<T, E extends Error>(error: E | string): Result<T, E> {
  if (error instanceof Error) {
    return { kind: "err", error };
  }
  return { kind: "err", error: new Error(error) as E };
}

export function isOk<T, E extends Error>(result: Result<T, E>): result is { kind: "ok"; value: T } {
  return result.kind === "ok";
}
export function isErr<T, E extends Error>(result: Result<T, E>): result is { kind: "err"; error: E } {
  return result.kind === "err";
}

export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.kind === "ok") {
    return result.value;
  } else {
    throw new Error(`Unwrap called on an err value: ${result.error}`);
  }
}

/**
 * Checks if a file exists and is accessible at the specified path.
 * @param path - The path to the file.
 * @returns A promise that resolves to a boolean indicating whether the file exists and is accessible.
 */
export async function attainable(path: PathLike): Promise<boolean> {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Collapse multiple continous / with a single /
 * @param s The string to process
 * @example
 * collapseBackslashes("a//b") // "a/b"
 * collapseBackslashes("a///b/c") // "a/b/c"
 */
export function collapseBackslashes(s: string) {
  return s.replace(/\/+/g, "/");
}
