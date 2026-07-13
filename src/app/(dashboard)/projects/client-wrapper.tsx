"use client";

import Link from 'next/link';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Project } from '@/lib/types/database';

interface Props {
  projects: Project[];
  error?: string;
}

export function ProjectsPageClient({ projects, error }: Props) {
  const { t } = useLanguage();

  const { query, setQuery, pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(projects, {
    pageSize: 10,
    searchFields: (p) => [p.name, p.description],
  });

  return (
    <main className="mx-auto max-w-4xl animate-fade-in">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">{t('project.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {t('project.subtitle')}
          </p>
        </div>
        <Link
          href="/projects/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all touch-target"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('project.createProject')}
        </Link>
      </header>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="font-bold text-danger">{t('project.failedToLoad')}</p>
          <p className="mt-1 text-sm text-danger">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center bg-white">
          <svg className="mx-auto h-14 w-14 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
          </svg>
          <p className="mt-4 font-bold text-ink">{t('project.noProjects')}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {t('project.noProjectsDesc')}
          </p>
          <Link
            href="/projects/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-all touch-target"
          >
            {t('project.createProject')}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <SearchInput value={query} onChange={setQuery} placeholder={t('project.searchPlaceholder')} />
          </div>
          {total === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-10 text-center">
              <p className="text-sm text-ink-soft">{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pageItems.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  href={`/projects/${project.id}`}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} total={total} from={from} to={to} onPage={setPage} />
        </>
      )}
    </main>
  );
}
