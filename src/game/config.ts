import type { Color, Project, Shape } from './types';
export const SIZE = 8;
export const TRAY_SIZE = 3;
export const COLORS: readonly Color[] = ['mint', 'blue', 'coral', 'gold', 'purple'];
export const ECONOMY = {
  pointsPerSquare: 10,
  pointsPerLine: 100,
  comboPointsPerLine: 25,
  bricksPerLine: 3,
  comboBricksPerExtraLine: 1,
  testAdBricks: 3,
} as const;
export const SHAPES: readonly Shape[] = [
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
];
export const PROJECTS: readonly Project[] = [
  {
    id: 'bakery',
    name: 'Corner bakery',
    cost: 3,
    description: 'Warm bread. A very happy neighbourhood.',
  },
  {
    id: 'garden',
    name: 'Community garden',
    cost: 5,
    description: 'A little colour for every neighbour.',
  },
  {
    id: 'library',
    name: 'Little library',
    cost: 8,
    description: 'Big adventures in a little building.',
  },
  {
    id: 'cafe',
    name: 'Town café',
    cost: 10,
    description: 'Your town’s new favourite meeting spot.',
  },
  {
    id: 'windmill',
    name: 'Sunny windmill',
    cost: 12,
    description: 'A gentle breeze, a brighter skyline.',
  },
  {
    id: 'park',
    name: 'Lakeside park',
    cost: 15,
    description: 'The perfect place to watch the world go by.',
  },
];
