import { DirNode, MediaItem } from '../types';

export const MOCK_MEDIA: MediaItem[] = [
  { id: '1', title: 'Ocean Deep', year: 2022, language: 'English', size: '1.4 GB' },
  { id: '2', title: 'Monsoon Nights', year: 2021, language: 'Bangla', size: '980 MB' },
  { id: '3', title: 'Last Train', year: 2023, language: 'Hindi', size: '2.1 GB' },
  { id: '4', title: 'Silent Hills', year: 2020, language: 'English', size: '1.1 GB' },
];

export const YEARS = ['All', '2023', '2022', '2021', '2020'];
export const LANGUAGES = ['All', 'English', 'Bangla', 'Hindi'];

export const MOCK_TREE: DirNode[] = [
  {
    id: 'd1', name: 'Movies', path: '/Movies', checked: false, expanded: false,
    children: [
      { id: 'd1-1', name: 'Action', path: '/Movies/Action', checked: false, expanded: false, children: [] },
      { id: 'd1-2', name: 'Drama', path: '/Movies/Drama', checked: false, expanded: false, children: [] },
    ],
  },
  {
    id: 'd2', name: 'Series', path: '/Series', checked: false, expanded: false,
    children: [{ id: 'd2-1', name: 'Season 1', path: '/Series/Season 1', checked: false, expanded: false, children: [] }],
  },
  { id: 'd3', name: 'Music', path: '/Music', checked: false, expanded: false, children: [] },
];
