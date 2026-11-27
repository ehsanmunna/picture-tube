import { DirNode, MediaItem } from '../types';

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: '3 Idiots',
    year: 2009,
    language: 'Hindi',
    size: '2.1 GB',
    url: 'http://fs.ebox.live/Movies/Indian-Hindi/2009/3%20Idiots%20%282009%29/3.Idiots.2009_1080p_%5BE-BOX%5D.mp4',
  },
  // Replace these urls with your real links (placeholders)
  { id: '2', title: 'Monsoon Nights', year: 2021, language: 'Bangla', size: '980 MB', url: 'http://fs.ebox.live/REPLACE_ME/monsoon-nights.mp4' },
  { id: '3', title: 'Last Train', year: 2023, language: 'Hindi', size: '2.1 GB', url: 'http://fs.ebox.live/REPLACE_ME/last-train.mp4' },
  { id: '4', title: 'Silent Hills', year: 2020, language: 'English', size: '1.1 GB', url: 'http://fs.ebox.live/REPLACE_ME/silent-hills.mp4' },
];
export const YEARS = ['All', '2023', '2022', '2021', '2020'];
export const LANGUAGES = ['All', 'English', 'Bangla', 'Hindi'];

// export const MOCK_TREE: DirNode[] = [
//   {
//     id: 'd1', name: 'Movies', path: '/Movies', checked: false, expanded: false,
//     children: [
//       { id: 'd1-1', name: 'Action', path: '/Movies/Action', checked: false, expanded: false, children: [] },
//       { id: 'd1-2', name: 'Drama', path: '/Movies/Drama', checked: false, expanded: false, children: [] },
//     ],
//   },
//   {
//     id: 'd2', name: 'Series', path: '/Series', checked: false, expanded: false,
//     children: [{ id: 'd2-1', name: 'Season 1', path: '/Series/Season 1', checked: false, expanded: false, children: [] }],
//   },
//   { id: 'd3', name: 'Music', path: '/Music', checked: false, expanded: false, children: [] },
// ];

const mk = (parent: string, name: string): DirNode => ({
  id: `${parent}/${name}`,
  name,
  url: `${parent}/${name}`,
  checked: false,
  expanded: false,
});

export const MOCK_TREE: DirNode[] = ['Movies', 'Series', 'Music'].map((n) => mk('', n));

const MOCK_CHILDREN: Record<string, DirNode[]> = {
  '/Movies': [mk('/Movies', 'Action'), mk('/Movies', 'Drama')],
  '/Movies/Action': [mk('/Movies/Action', '2022'), mk('/Movies/Action', '2023')],
  '/Series': [mk('/Series', 'Season 1'), mk('/Series', 'Season 2')],
};

// Phase 3: replace with a real request to the server
export const fetchChildren = (path: string): Promise<DirNode[]> =>
  new Promise((resolve) => setTimeout(() => resolve(MOCK_CHILDREN[path] ?? []), 800));