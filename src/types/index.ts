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

export interface ApiFile {
  id: string;
  name: string;
  url: string;
  ext: string;
}

export interface DirNode {
  id: string;
  name: string;
  url: string;            // folder url
  parent?: string | null;
  folders?: DirNode[];
  files?: ApiFile[];     // files directly inside this folder
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