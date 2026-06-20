export const TRAINING_PRODUCT_SLUG = 'training';
export const TRAINING_PASS_PLAN_ID = 'plan-training-pass-monthly';

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TrainingResourceUrl {
  label: string;
  url: string;
}

export function formatDuration(totalSeconds?: number | null): string {
  const seconds = Math.max(0, totalSeconds || 0);
  if (seconds === 0) return 'Self-paced';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${Math.max(1, minutes)}m`;
}

export function formatPrice(currency: string, amountMinor?: number | null) {
  if (amountMinor === undefined || amountMinor === null) return 'Price pending';
  return `${currency} ${(amountMinor / 100).toLocaleString()}`;
}

export function courseLevelLabel(level: string): string {
  switch (level) {
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    default:
      return 'Beginner';
  }
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function textToStringList(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringListToText(value?: string[] | null): string {
  return Array.isArray(value) ? value.join('\n') : '';
}

export function resourcesToText(value?: TrainingResourceUrl[] | null): string {
  if (!Array.isArray(value)) return '';
  return value.map((item) => `${item.label} | ${item.url}`).join('\n');
}

export function textToResources(value: string): TrainingResourceUrl[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...urlParts] = line.split('|').map((part) => part.trim());
      const url = urlParts.join('|');
      return { label: label || 'Resource', url };
    })
    .filter((item) => item.url.length > 0);
}

export function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
