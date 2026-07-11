'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ProjectHealth } from '@/lib/queries/reports';

const cfg: Record<ProjectHealth, { bg: string; text: string; dot: string }> = {
  on_track: { bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' },
  at_risk: { bg: 'bg-warning-soft', text: 'text-warning', dot: 'bg-warning' },
  delayed: { bg: 'bg-danger-soft', text: 'text-danger', dot: 'bg-danger' },
  completed: { bg: 'bg-primary-100', text: 'text-primary-700', dot: 'bg-primary-500' },
  inactive: { bg: 'bg-neutral-200', text: 'text-neutral-600', dot: 'bg-neutral-400' },
};

export function HealthBadge({ health, className = '' }: { health: ProjectHealth; className?: string }) {
  const { t } = useLanguage();
  const c = cfg[health];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text} ${className}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
      {t(`health.${health}`)}
    </span>
  );
}
