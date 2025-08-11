export const WATCHER_CONFIG = {
  STABILITY_THRESHOLD_MS: 2000,
  POLL_INTERVAL_MS: 100,
} as const;

export const FILE_TYPE_EXTENSIONS: Record<string, string[]> = {
  page: ['page.tsx'],
  layout: ['layout.tsx'],
  error: ['error.tsx'],
  loading: ['loading.tsx'],
  default: ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx'],
} as const;

export const RESERVED_PATTERN_NAMES = ['page', 'layout', 'loading', 'error'] as const;

export const PATTERN_SEPARATORS = ['.', ':'] as const;
