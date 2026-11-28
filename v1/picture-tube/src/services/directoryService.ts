const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'ts']);
const FETCH_TIMEOUT_MS = 15000;

export interface DirFolder { id: string; name: string; url: string }
export interface DirFile { id: string; name: string; url: string; ext: string }
export interface DirListing {
  id: string;
  name: string;
  url: string;
  parent: string | null;
  folders: DirFolder[];
  files: DirFile[];
}

const ensureSlash = (u: string) => (u.endsWith('/') ? u : u + '/');
const originOf = (u: string) => u.match(/^https?:\/\/[^/]+/)?.[0] ?? '';

function safeDecode(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function parentOf(url: string): string | null {
  const dir = ensureSlash(url);
  const origin = originOf(dir);
  const parts = dir.slice(origin.length).split('/').filter(Boolean);
  if (parts.length === 0) return null;
  parts.pop();
  return origin + '/' + (parts.length ? parts.join('/') + '/' : '');
}

function resolveHref(base: string, href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return originOf(base) + href;
  return base + href;
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 404) throw new Error('Directory not found');
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
    return await res.text();
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('The server took too long to respond');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function parseDirectory(baseUrl: string, html: string) {
  const base = ensureSlash(baseUrl);
  const folders = new Map<string, DirFolder>();
  const files = new Map<string, DirFile>();
  const hrefRe = /<a\s+[^>]*?href\s*=\s*["']([^"']+)["']/gi;

  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || /^(\?|#|javascript:|mailto:)/i.test(href)) continue;
    if (['../', '..', './', '/'].includes(href)) continue;

    const clean = resolveHref(base, href).split(/[?#]/)[0];

    // keep only direct children of the current directory
    if (!clean.startsWith(base) || clean === base) continue;
    const relative = clean.slice(base.length);
    if (relative.replace(/\/$/, '').includes('/')) continue;

    const name = safeDecode(relative.replace(/\/$/, ''));

    if (clean.endsWith('/')) {
      folders.set(clean, { id: clean, name, url: clean });
    } else {
      const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
      if (VIDEO_EXTENSIONS.has(ext)) files.set(clean, { id: clean, name, url: clean, ext });
    }
  }

  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase());

  return {
    folders: [...folders.values()].sort(byName),
    files: [...files.values()].sort(byName),
  };
}

export async function browseDirectory(url: string): Promise<DirListing> {
  if (!/^https?:\/\/.+/i.test(url)) throw new Error('Enter a valid http(s) link');
  const dir = ensureSlash(url);
  const html = await fetchHtml(dir);
  const { folders, files } = parseDirectory(dir, html);
  const segments = dir.slice(originOf(dir).length).split('/').filter(Boolean);
  const name = segments.length ? safeDecode(segments[segments.length - 1]) : originOf(dir);

  return { id: dir, name, url: dir, parent: parentOf(dir), folders, files };
}