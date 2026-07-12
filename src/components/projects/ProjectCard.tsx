'use client';

import Link from 'next/link';
import type { Project } from '@/lib/types/database';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { formatCurrency, formatDateShort } from '@/lib/i18n';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ProjectCardProps {
  project: Project;
  skillCount?: number;
  href?: string;
}

export function ProjectCard({ project, skillCount, href }: ProjectCardProps) {
  const { t, locale } = useLanguage();

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-ink sm:text-lg">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>

      {project.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{project.description}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('table.timeline')}</dt>
          <dd className="mt-0.5 font-semibold text-ink-soft">
            {formatDateShort(project.start_date, locale)} → {formatDateShort(project.end_date, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('table.workers')}</dt>
          <dd className="mt-0.5 font-semibold text-ink-soft">{project.workers_needed}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('project.budget')}</dt>
          <dd className="mt-0.5 font-semibold text-ink-soft">{formatCurrency(project.budget)}</dd>
        </div>
        {skillCount !== undefined ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('register.skills')}</dt>
            <dd className="mt-0.5 font-semibold text-ink-soft">{skillCount}</dd>
          </div>
        ) : null}
      </dl>
    </>
  );

  const className = 'block nm-raised p-5 transition-all duration-200 hover:-translate-y-0.5';

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
