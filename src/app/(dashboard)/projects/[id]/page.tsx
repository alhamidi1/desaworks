import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { AssignedWorkers } from "@/components/projects/AssignedWorkers";
import { RevenueForm } from "@/components/reports/RevenueForm";
import { createT, formatDate, formatCurrency, type Locale } from "@/lib/i18n";
import type {
  Assignment,
  Profile,
  Project,
  ProjectSkillRequirement,
  Skill,
} from "@/lib/types/database";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function ProjectDetailLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 rounded-2xl border border-neutral-200 bg-neutral-100" />
      <div className="h-32 rounded-2xl border border-neutral-200 bg-neutral-100" />
    </div>
  );
}

function ProjectDetailError({ message, locale }: { message: string; locale: Locale }) {
  const t = createT(locale);
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-800">{t("common.error")}</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      <Link
        href="/projects"
        className="mt-4 inline-block text-sm font-medium text-red-700 underline"
      >
        {t("project.backToProjects")}
      </Link>
    </div>
  );
}

type AssignmentWithResident = Assignment & { resident: Profile };
type ProjectWithFull = Project & {
  skill_requirements: (ProjectSkillRequirement & { skill: Skill })[];
  creator: Profile | null;
};

async function ProjectDetailContent({ id, locale }: { id: string; locale: Locale }) {
  const t = createT(locale);

  if (!uuidRegex.test(id)) {
    return <ProjectDetailError message="ID proyek tidak valid" locale={locale} />;
  }

  // Use a single supabase client for both queries to ensure consistent auth context
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return (
      <ProjectDetailError message="Sesi tidak ditemukan, silakan masuk kembali." locale={locale} />
    );

  const [projectRes, assignmentsRes, profileRes] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `
        *,
        skill_requirements:project_skill_requirements(*, skill:skills(*)),
        creator:profiles!projects_created_by_fkey(*)
      `,
      )
      .eq("id", id)
      .single(),
    supabase
      .from("assignments")
      .select("*, resident:profiles!resident_id(*)")
      .eq("project_id", id)
      .neq("status", "void")
      .order("assigned_at", { ascending: false }),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  if (projectRes.error || !projectRes.data) {
    if (projectRes.error?.code === "PGRST116") notFound();
    return (
      <ProjectDetailError
        message={projectRes.error?.message ?? "Proyek tidak ditemukan"}
        locale={locale}
      />
    );
  }

  const project = projectRes.data as ProjectWithFull;
  const assignments = (assignmentsRes.data ?? []) as AssignmentWithResident[];
  const isManager = profileRes.data?.role === "manager" || profileRes.data?.role === "admin";

  return (
    <div className="space-y-5">
      {/* Project header */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-sm leading-6 text-ink-soft">{project.description}</p>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("project.schedule")}
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {formatDate(project.start_date, locale)} → {formatDate(project.end_date, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("project.workersNeeded")}
            </dt>
            <dd className="mt-1 font-bold text-ink text-lg">{project.workers_needed}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("project.budget")}
            </dt>
            <dd className="mt-1 font-medium text-ink">{formatCurrency(project.budget)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("project.createdBy")}
            </dt>
            <dd className="mt-1 font-medium text-ink">{project.creator?.full_name ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {/* Skill requirements */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-ink">{t("project.skillRequirements")}</h2>
        {project.skill_requirements.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">{t("project.noRequirements")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {project.skill_requirements.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-ink">{req.skill.name}</span>
                <span className="text-ink-soft">
                  {t("project.min")} {req.min_proficiency} · {req.workers_needed}{" "}
                  {t("project.workers")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Assigned workers */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">{t("project.assignedWorkers")}</h2>
            {assignments.length > 0 && (
              <p className="text-xs text-ink-soft mt-0.5">
                {t("project.positionsFilled", {
                  filled: assignments.length,
                  total: project.workers_needed,
                })}
              </p>
            )}
          </div>
          <Link
            href={`/projects/${project.id}/assign`}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-ink-soft hover:border-primary-500 hover:text-primary-500 transition-colors shadow-sm"
          >
            {t("project.assignWorkerBtn")}
          </Link>
        </div>

        <AssignedWorkers
          projectId={project.id}
          assignments={assignments}
          workersNeeded={project.workers_needed}
        />
      </section>

      {/* Record Revenue (Managers/Admins only) */}
      {isManager && <RevenueForm projectId={project.id} />}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = (cookieStore.get("desaworks_locale")?.value as Locale) || "id";
  const t = createT(locale);

  return (
    <main className="mx-auto max-w-4xl animate-fade-in">
      <header className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-primary-500 transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          {t("project.backToProjects")}
        </Link>
      </header>

      <Suspense fallback={<ProjectDetailLoading />}>
        <ProjectDetailContent id={id} locale={locale} />
      </Suspense>
    </main>
  );
}
