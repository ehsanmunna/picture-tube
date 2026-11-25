import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DirNode, MediaItem } from '../types';

// Android emulator reaches your Windows host via 10.0.2.2.
// For a real phone / Android TV, use your PC's LAN IP (run `ipconfig`).
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE = `http://${DEV_HOST}:8000`;

async function request<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  const res = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type BrowseItem = { 
  id: string;
  name: string;
  url: string;
  folders: BrowseItem[];
  checked: boolean;
  expanded: boolean;
  loading?: boolean;
};


// Tree view: GET /api/browse?url=<directory url>
export const browse = (url: string) =>
  request<BrowseItem>('/api/browse', { url });

// Library list: GET /api/library?link=<server link>&search=&year=&language=
export const getLibrary = async (
  link: string,
  filters: { search?: string; year?: string; language?: string } = {},
): Promise<MediaItem[]> =>
  request<MediaItem[]>('/api/library', { link, ...filters });

// Saved servers
const KEY = 'servers';
export type Server = { link: string; addedAt: number };

export const loadServers = async (): Promise<Server[]> =>
  JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');

export async function addServer(rawLink: string): Promise<DirNode> {
  const url = rawLink.trim().replace(/\/?$/, '/');
  if (!/^https?:\/\//i.test(url)) throw new Error('Enter a valid http(s) link');
  return await browse(url); // validates that the backend can list the root
  // const servers = await loadServers();
  // const existing = servers.find(s => s.link === url);
  // if (existing) return existing;
  // const server = { link: url, addedAt: Date.now() };
  // await AsyncStorage.setItem(KEY, JSON.stringify([...servers, server]));
  // return server;
}