import { upsertItems } from './libraryRepo';
import type { LibraryItem, LibraryType } from './types';

/** Shape of a node coming from the tree (same as your case 1 / case 2 JSON). */
export interface TreeFile {
  id: string;
  name: string;
  url: string;
  ext?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  url: string;
  parent?: string;
  folders?: TreeNode[];
  files?: TreeFile[];
}

export interface AddResult {
  added: number;
  skippedNoFiles: number; // checked folders that had no files
  skippedNotVideo: number; // subtitles, images, etc.
  skippedUnknownType: number; // path has neither Movies nor TV-Series
}

const VIDEO_EXT = new Set(['mp4', 'mkv', 'avi', 'mov', 'm4v', 'webm', 'ts', 'wmv', 'flv', 'mpg', 'mpeg']);
const TYPE_BY_SEGMENT: Record<string, LibraryType> = {
  movies: 'Movies',
  'tv-series': 'TV-Series',
};

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const extOf = (f: TreeFile) => (f.ext ?? f.name.split('.').pop() ?? '').toLowerCase();
const stripExt = (name: string) => name.replace(/\.[^.]+$/, '');

/** 'http://host/Movies/Arabic/2013/X/f.mp4' -> ['Movies','Arabic','2013','X','f.mp4'] (from the type segment on) */
function pathFromType(url: string): { type: LibraryType; segs: string[] } | null {
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    /* keep raw */
  }
  const segs = path.split('/').filter(Boolean).map(safeDecode);
  const idx = segs.findIndex(s => TYPE_BY_SEGMENT[s.toLowerCase()]);
  if (idx === -1) return null;
  return { type: TYPE_BY_SEGMENT[segs[idx].toLowerCase()], segs: segs.slice(idx) };
}

/** Flatten checked nodes (and their loaded sub-folders) into [folderNode, file] pairs. */
function collectFiles(nodes: TreeNode[], out: { node: TreeNode; file: TreeFile }[], stats: AddResult) {
  for (const node of nodes) {
    if (node.files?.length) {
      for (const file of node.files) out.push({ node, file });
    } else if (!node.folders?.length) {
      stats.skippedNoFiles++; // nothing here -> skip
    }
    if (node.folders?.length) collectFiles(node.folders, out, stats);
  }
}

/**
 * Builds the dataset for upsertItems from the nodes the user checked in the tree.
 * Rules:
 *  - TV-Series: language = segment after 'TV-Series' without the '-TV-Series' suffix,
 *    series_title = series folder, title = 'Episode N', season/episode from SxxExx.
 *  - Movies: language = segment after 'Movies', title = movie folder name,
 *    year from '[YYYY]' (or the year folder), series fields null.
 */
export function buildLibraryItems(
  selected: TreeNode[],
  serverId: string,
): { items: LibraryItem[]; stats: AddResult } {
  const stats: AddResult = { added: 0, skippedNoFiles: 0, skippedNotVideo: 0, skippedUnknownType: 0 };
  const pairs: { node: TreeNode; file: TreeFile }[] = [];
  collectFiles(selected, pairs, stats);

  const byUrl = new Map<string, LibraryItem>(); // also de-dupes overlapping selections
  const epCounter = new Map<string, number>(); // fallback episode numbering per folder

  for (const { node, file } of pairs) {
    const ext = extOf(file);
    if (!VIDEO_EXT.has(ext)) {
      stats.skippedNotVideo++;
      continue;
    }

    const parsed = pathFromType(file.url);
    if (!parsed) {
      stats.skippedUnknownType++;
      continue;
    }
    const { type, segs } = parsed;
    // segs: [type, language, ...folders, fileName]
    const language = segs[1]?.replace(/-TV-Series$/i, '').replace(/-Movies$/i, '') || null;
    const folders = segs.slice(2, -1);

    if (type === 'Movies') {
      const movieFolder = folders[folders.length - 1];
      const isYearOnly = !movieFolder || /^\d{4}$/.test(movieFolder);
      const title = isYearOnly ? stripExt(file.name) : movieFolder;
      const year =
        Number(/\[(\d{4})\]/.exec(title)?.[1]) ||
        Number(folders.find(f => /^\d{4}$/.test(f))) ||
        null;

      byUrl.set(file.url, {
        id: file.id,
        server_id: serverId,
        type,
        language,
        title,
        series_title: null,
        season: null,
        episode: null,
        year,
        ext,
        url: file.url,
      });
      continue;
    }

    // TV-Series
    const seriesTitle = folders[0] ?? stripExt(file.name);
    const m = /S(\d{1,2})\s*E(\d{1,3})/i.exec(file.name);
    const seasonFolder = folders.find(f => /season|^s\d+$/i.test(f));
    const season =
      (m && Number(m[1])) || Number(/(\d+)/.exec(seasonFolder ?? '')?.[1]) || null;

    let episode: number;
    if (m) {
      episode = Number(m[2]);
    } else {
      const key = node.url || folders.join('/');
      episode = (epCounter.get(key) ?? 0) + 1;
      epCounter.set(key, episode);
    }

    byUrl.set(file.url, {
      id: file.id,
      server_id: serverId,
      type,
      language,
      title: `Episode ${episode}`,
      series_title: seriesTitle,
      season,
      episode,
      year: null,
      ext,
      url: file.url,
    });
  }

  const items = [...byUrl.values()];
  stats.added = items.length;
  return { items, stats };
}

/** One call from the UI: checked tree nodes -> dataset -> upsertItems. */
export async function addSelectedToLibrary(selected: TreeNode[], serverId: string): Promise<AddResult> {
  const { items, stats } = buildLibraryItems(selected, serverId);
  await upsertItems(items);
  return stats;
}