export const ASPECT_RATIO_OPTIONS = [
  '21:9',
  '16:9',
  '3:2',
  '4:3',
  '5:4',
  '1:1',
  '4:5',
  '3:4',
  '2:3',
  '9:16',
] as const;

export type AspectRatio = (typeof ASPECT_RATIO_OPTIONS)[number];

export const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1';

