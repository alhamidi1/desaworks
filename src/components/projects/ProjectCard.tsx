import Link from 'next/link';
import type { Project } from '@/lib/types/database';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { formatCurrency, formatDateShort, type Locale } from '@/lib/i18n';

interface ProjectCardProps {
  project: Project;
  skillCount?: number;
  href?: string;
}

export function ProjectCard({ project, skillCount, href }: ProjectCardProps) {
  // Default to 'id' locale for server-rendered card
  const locale: Locale = 'id';

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold text-[#1a1d23]">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[#868e96] leading-relaxed">
          {project.description}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-wider">Timeline</dt>
          <dd className="font-semibold text-[#495057] mt-0.5">
            {formatDateShort(project.start_date, locale)} → {formatDateShort(project.end_date, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-wider">Pekerja</dt>
          <dd className="font-semibold text-[#495057] mt-0.5">{project.workers_needed}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-wider">Anggaran</dt>
          <dd className="font-semibold text-[#495057] mt-0.5">
            {formatCurrency(project.budget)}
          </dd>
        </div>
        {skillCount !== undefined && (
          <div>
            <dt className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-wider">Keahlian</dt>
            <dd className="font-semibold text-[#495057] mt-0.5">{skillCount}</dd>
          </div>
        )}
      </dl>
    </>
  );

  const className =
    'block rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#c7fff4] hover:shadow-md hover:-translate-y-0.5';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
