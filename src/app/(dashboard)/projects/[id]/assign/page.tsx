import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getWorkerRecommendations } from '@/lib/queries/recommendations';
import { AssignWorkersPanel } from '@/components/projects/AssignWorkersPanel';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { createT, type Locale } from '@/lib/i18n';
import type { Skill, Project, ProjectSkillRequirement } from '@/lib/types/database';

interface AssignWorkersPageProps {
  params: Promise<{ id: string }>;
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function AssignLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl border border-neutral-200 bg-neutral-100" />
      <div className="h-64 rounded-2xl border border-neutral-200 bg-neutral-100" />
    </div>
  );
}

function AssignError({ message, locale }: { message: string; locale: Locale }) {
  const t = createT(locale);
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-800">{t('project.assignErrorTitle')}</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}

async function AssignWorkersContent({ id, locale }: { id: string; locale: Locale }) {
  const t = createT(locale);
  
  if (!uuidRegex.test(id)) {
    return <AssignError message={t('project.invalidProjectId')} locale={locale} />;
  }

  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <AssignError message={t('project.sessionNotFound')} locale={locale} />;

  const [projectRes, skillsRes, existingAssignmentsRes, recommendationsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*, skill_requirements:project_skill_requirements(*, skill:skills(*))')
      .eq('id', id)
      .single(),
    supabase.from('skills').select('*').order('category').order('name'),
    supabase
      .from('assignments')
      .select('resident_id, status, id, resident:profiles!resident_id(full_name, email)')
      .eq('project_id', id)
      .neq('status', 'void'),
    getWorkerRecommendations(id, { availability: 'all' }),
  ]);

  if (projectRes.error || !projectRes.data) {
    if (projectRes.error?.code === 'PGRST116') notFound();
    return <AssignError message={projectRes.error?.message ?? 'Proyek tidak ditemukan'} locale={locale} />;
  }

  if (!recommendationsResult.success) {
    return <AssignError message={recommendationsResult.error} locale={locale} />;
  }

  const project = projectRes.data as Project & { skill_requirements: (ProjectSkillRequirement & { skill: Skill })[] };
  const skills = (skillsRes.data ?? []) as Skill[];
  const existingAssignments = (existingAssignmentsRes.data ?? []) as any[];

  // IDs of residents already assigned (not voided)
  const alreadyAssignedIds = existingAssignments.map((a) => a.resident_id as string);

  // Filter out already-assigned from recommendations
  const availableWorkers = recommendationsResult.data.filter(
    (w) => !alreadyAssignedIds.includes(w.profile.id)
  );

  return (
    <div className="space-y-5">
      {/* Project summary card */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('project.title')}</p>
            <h1 className="mt-1 text-lg font-bold text-ink">{project.name}</h1>
            <p className="text-sm text-ink-soft mt-0.5">
              {t('project.projectRequirementSummary', { workers: project.workers_needed, skills: project.skill_requirements.length })}
            </p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
      </section>

      {/* Already assigned workers */}
      {existingAssignments.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink mb-3">
            {t('project.alreadyAssignedTitle', { count: existingAssignments.length })}
          </h2>
          <ul className="space-y-2">
            {existingAssignments.map((a: any) => (
              <li key={a.id} className="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-2.5">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {a.resident?.full_name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{a.resident?.full_name}</p>
                  <p className="text-xs text-ink-soft truncate">{a.resident?.email}</p>
                </div>
                <span className="text-xs font-semibold text-primary-500">✓ {t('project.assignedStatus')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Assignment panel with filtered workers */}
      <AssignWorkersPanel
        projectId={project.id}
        projectName={project.name}
        workersNeeded={project.workers_needed}
        totalRequirements={project.skill_requirements.length}
        workers={availableWorkers}
        skills={skills}
      />
    </div>
  );
}

export default async function AssignWorkersPage({ params }: AssignWorkersPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = (cookieStore.get('desaworks_locale')?.value as Locale) || 'id';
  const t = createT(locale);

  return (
    <main className="mx-auto max-w-4xl animate-fade-in">
      <header className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-primary-500 transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t('project.backToProjectDetail')}
        </Link>
      </header>

      <Suspense fallback={<AssignLoading />}>
        <AssignWorkersContent id={id} locale={locale} />
      </Suspense>
    </main>
  );
}
