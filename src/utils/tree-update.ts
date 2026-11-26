import { ApiFolder, DirNode } from "../types";

export interface FileNode {
  id: string;
  name: string;
  url: string;
}

export interface FolderNode {
  id: string;
  name: string;
  url: string;
  parent?: string | null;
  folders?: FolderNode[];
  files?: FileNode[];
}

/** Keep already-loaded children (with their subtrees); add any new ones. */
function mergeChildren(
  existing: FolderNode[] = [],
  incoming: FolderNode[] = []
): FolderNode[] {
  const byUrl = new Map(existing.map((f) => [f.url, f]));
  return incoming.map((f) => byUrl.get(f.url) ?? f);
}

/**
 * Returns a new tree with `listing` merged into the node whose url matches.
 * Branches that don't contain the target are returned untouched.
 */
export function mergeListing(
  tree: FolderNode,
  listing: FolderNode
): FolderNode {
  // Found the target node: fill in parent, folders, files
  if (tree.url === listing.url) {
    return {
      ...tree, // keeps original id, name, url
      parent: listing.parent,
      folders: mergeChildren(tree.folders, listing.folders),
      files: listing.files ?? tree.files,
    };
  }

  // Only descend into branches that can contain the target (hierarchical urls)
  if (!tree.folders?.length || !listing.url.startsWith(tree.url)) {
    return tree;
  }

  return {
    ...tree,
    folders: tree.folders.map((child) => mergeListing(child, listing)),
  };
}

/** Keep already-loaded children (with their subtrees); add new ones. */
export const mergeFolders = (
  existing: DirNode[] = [],
  incoming: ApiFolder[] = [],
  inheritChecked = false
): DirNode[] => {
  const byPath = new Map(existing.map((n) => [n.url, n]));
  return incoming.map((f) => byPath.get(f.url) ?? toDirNode(f, inheritChecked));
};

export const toDirNode = (f: ApiFolder, checked = false): DirNode => ({
  id: f.id,
  name: f.name,
  url: f.url,
  checked,
  expanded: false,
  loaded: false,
});