export const CATEGORIES = [
  'AI Skills',
  // 'Safety Guide',
  'Language',
  'Other',
  // 'Health',
] as const;

export type CategoryType = typeof CATEGORIES[number];
