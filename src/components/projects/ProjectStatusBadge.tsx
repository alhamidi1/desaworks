'use client';

import type { ProjectStatus } from '@/lib/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-neutral-200 text-neutral-600',
  open: 'bg-info-soft text-info',
  in_progress: 'bg-warning-soft text-warning',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-danger-soft text-danger',
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${STATUS_STYLES[status]} ${className}`}>
      {t(`status.${status}`)}
    </span>
  );
}
