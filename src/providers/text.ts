/**
 * To diff two text snippets using vscode.diff, you must pass it a textURI.
 * This module allows you to set text, and have them be served when the URI is requested.
 */

import { randomUUID } from "crypto";
import * as vs from "vscode";
import { ProviderResult, TextDocumentContentProvider, Uri } from "vscode";
import { createLRU } from "../lib/lru";

const TEXT_LRU_CAPACITY = 100;

export const URI_SCHEME = "moeutils";
const lru = createLRU(TEXT_LRU_CAPACITY);

/**
 * Sets the text for a unique URI and returns the URI.
 * @param text - The text to be associated with the URI.
 * @returns The URI that the text could be requested from
 */
export function setText(text: string): Uri {
  const k = randomUUID();
  lru.set(k, text);
  const uriStr = `${URI_SCHEME}:text/${k}`;
  return vs.Uri.parse(uriStr);
}

/**
 * Serves the text associated with a URI.
 * If no content is found for the key, an empty string is returned.
 * Example URI: "moeutils:text/${key}"
 */
export const textProvider: TextDocumentContentProvider = {
  provideTextDocumentContent: (uri, _token): ProviderResult<string> => {
    const k = _keyFromURI(uri);
    return lru.get(k) || "";
  }
};

/**
 * Extracts the text key from the given URI path.
 * The key is the param that comes after "text" in the URI.
 * Example URI: "moeutils:text/${key}"
 * @param uri - The URI to extract the key from.
 * @returns The extracted key from the URI path.
 */
const _keyFromURI = (uri: vs.Uri): string => uri.path.match(/^text\/([a-z\d-]+)/)![1];
