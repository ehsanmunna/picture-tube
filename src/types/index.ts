export type ViewMode = 'list' | 'table';

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  language: string;
  size: string;
}

export interface MediaServer {
  id: string;
  name: string;
  url: string;
}

export interface DirNode {
  id: string;
  name: string;
  path: string;
  checked: boolean;
  expanded: boolean;
  children?: DirNode[];
}
