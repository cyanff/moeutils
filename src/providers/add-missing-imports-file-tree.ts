import { on } from "events";
import * as vs from "vscode";
import { collapseBackslashes } from "../lib/utils";

interface FileTreeProvider extends vs.TreeDataProvider<Node> {
  refresh(): void;
}

interface Node extends vs.TreeItem {
  children: Node[];
}

function createNode(label: string, children: Node[] = []): Node {
  return { label, children };
}

/**
 * Stores tree data for the tree view
 */
let root: Node = { children: [] };

const _onChangeTreeDataEv: vs.EventEmitter<Node | undefined | null | void> = new vs.EventEmitter<
  Node | undefined | null | void
>();
const onDidChangeTreeData: vs.Event<Node | undefined | null | void> = _onChangeTreeDataEv.event;

onDidChangeTreeData(() => {
  console.log("Tree data changed");
});

export const addMissingImportsFileTreeProvider: FileTreeProvider = {
  async getTreeItem(e: Node): Promise<Node> {
    return e;
  },
  async getChildren(e?: Node): Promise<Node[]> {
    // Return root if no element is passed
    if (!e) return root.children;
    if (!e.children) return [];
    return e.children;
  },
  refresh() {
    _onChangeTreeDataEv.fire();
  }
};

export function displayIncludedFiles(files: vs.Uri[]) {
  const segments2D: string[][] = [];
  for (let { authority, path } of files) {
    path = collapseBackslashes(path);
    segments2D.push([authority, ...path.split("/")].filter(Boolean));
  }

  root = treeFromSegments2D(segments2D);
}

/**
 * Construct a tree from a 2D array of path segments.
 *
 * 1. Start at the root node.
 * 2. For each path (array of segments):
 *    a. Set the cursor to the root.
 *    b. For each segment in the path:
 *       i. Check if the segment already exists as a child of the cursor.
 *       ii. If it exists, move the cursor to this child.
 *       iii. If it does not exist, create a new node, add it as a child of the cursor, and move the cursor to this new node.
 *
 * Examples:
 * Given the following paths:
 * - /src/providers/add-missing-imports-file-tree.ts
 * - /src/providers/another-file.ts
 * - /src/utils/helper.ts
 *
 * The 2D array of segments would look like this:
 * [
 *   ["src", "providers", "add-missing-imports-file-tree.ts"],
 *   ["src", "providers", "another-file.ts"],
 *   ["src", "utils", "helper.ts"]
 * ]
 *
 * The resulting tree structure would be:
 *
 * root
 * └── src
 *     ├── providers
 *     │   ├── add-missing-imports-file-tree.ts
 *     │   └── another-file.ts
 *     └── utils
 *         └── helper.ts
 *
 */
function treeFromSegments2D(segments2D: string[][]): Node {
  let root: Node = createNode("");
  let cursor: Node = root;

  for (const segments of segments2D) {
    for (const segment of segments) {
      let extant = cursor.children.find((n) => n.label === segment);
      // If the path segment does not exist, create a new node
      if (!extant) {
        const node = createNode(segment);
        cursor.children.push(node);
        extant = node;
      }
      // Move the cursor down the path segment
      cursor = extant;
    }
    // Reset the cursor back to the root of the tree
    cursor = root;
  }
  return root;
}
