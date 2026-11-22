import { DirNode } from '../types';

export const updateNode = (
  nodes: DirNode[],
  id: string,
  patch: (n: DirNode) => DirNode
): DirNode[] =>
  nodes.map((n) =>
    n.id === id
      ? patch(n)
      : { ...n, children: n.children ? updateNode(n.children, id, patch) : n.children }
  );

export const collectChecked = (nodes: DirNode[]): string[] =>
  nodes.flatMap((n) => [
    ...(n.checked ? [n.path] : []),
    ...(n.children ? collectChecked(n.children) : []),
  ]);
