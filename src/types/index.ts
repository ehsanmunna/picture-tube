import { BrowseItem } from "../api/client";

export type ViewMode = 'list' | 'table';

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  language: string;
  size: string;
  url: string; // direct video link
  thumb?: string;
}

export interface MediaServer {
  id: string;
  name: string;
  url: string;
}

// export interface DirNode {
//   id: string;
//   name: string;
//   path: string;
//   checked: boolean;
//   expanded: boolean;
//   loading?: boolean;
//   folders?: BrowseItem[]; // undefined = not loaded yet, [] = loaded but empty
// }


export interface DirNode {
  id: string;
  name: string;
  url: string;            // folder url
  parent?: string | null;
  folders?: DirNode[];
  checked?: boolean;
  expanded?: boolean;
  loaded?: boolean;        // true once its listing has been fetched
  loading?: boolean;
}

export interface ApiFolder {
  id: string;
  name: string;
  url: string;
}