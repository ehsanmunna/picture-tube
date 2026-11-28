import { DirNode } from "../types";


export type CheckState = 'checked' | 'partial' | 'unchecked';

export const updateNode = (
  nodes: DirNode[],
  id: string,
  patch: (n: DirNode) => DirNode
): DirNode[] =>
  nodes.map((n) =>
    n.id === id
      ? patch(n)
      : { ...n, folders: n.folders ? updateNode(n.folders, id, patch) : n.folders }
  );

const hasCheckedDescendant = (n: DirNode): boolean =>
  !!n.folders?.some((c) => c.checked || hasCheckedDescendant(c));

// 'partial' = not fully checked, but something below it is checked
export const getCheckState = (n: DirNode): CheckState =>
  n.checked ? 'checked' : hasCheckedDescendant(n) ? 'partial' : 'unchecked';

// Rule 1: checking a parent checks (or unchecks) every loaded child
const setDeep = (n: DirNode, value: boolean): DirNode => ({
  ...n,
  checked: value,
  folders: n.folders?.map((c) => setDeep(c, value)),
});

// Rule 2: a parent is checked only when all of its children are checked
const syncParents = (nodes: DirNode[]): DirNode[] =>
  nodes.map((n) => {
    if (!n.folders) return n;
    const children = syncParents(n.folders);
    const checked = children.length > 0 ? children.every((c) => c.checked) : n.checked;
    return { ...n, folders: children, checked };
  });

export const toggleChecked = (nodes: DirNode[], id: string, value: boolean): DirNode[] =>
  syncParents(updateNode(nodes, id, (n) => setDeep(n, value)));

// A fully checked folder is returned once; its children are covered by it
export const collectChecked = (nodes: DirNode[]): string[] =>
  nodes.flatMap((n) => (n.checked ? [n.url] : n.folders ? collectChecked(n.folders) : []));