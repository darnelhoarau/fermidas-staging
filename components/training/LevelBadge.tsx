import { courseLevelLabel } from '@/lib/training-utils';

const toneByLevel: Record<string, string> = {
  beginner: 'bg-leaf-50 text-leaf-800 ring-leaf-200',
  intermediate: 'bg-gold/10 text-brand ring-gold/30',
  advanced: 'bg-brand text-brand-foreground ring-brand',
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneByLevel[level] || toneByLevel.beginner}`}
    >
      {courseLevelLabel(level)}
    </span>
  );
}
