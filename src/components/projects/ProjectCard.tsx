import Link from 'next/link';
import type { Project } from '@/lib/types/database';
import { ProjectStatusBadge } from './ProjectStatusBadge';

interface ProjectCardProps {
  project: Project;
  skillCount?: number;
  href?: string;
}

function formatDate(date: string | null): string {
  if (!date) return '—';
  return date;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectCard({ project, skillCount, href }: ProjectCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
          {project.description}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500">Timeline</dt>
          <dd className="font-medium text-zinc-800">
            {formatDate(project.start_date)} → {formatDate(project.end_date)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Workers needed</dt>
          <dd className="font-medium text-zinc-800">{project.workers_needed}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Budget</dt>
          <dd className="font-medium text-zinc-800">
            {formatCurrency(project.budget)}
          </dd>
        </div>
        {skillCount !== undefined && (
          <div>
            <dt className="text-zinc-500">Skill requirements</dt>
            <dd className="font-medium text-zinc-800">{skillCount}</dd>
          </div>
        )}
      </dl>
    </>
  );

  const className =
    'block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:shadow-md';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
