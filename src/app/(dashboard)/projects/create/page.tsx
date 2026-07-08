import Link from 'next/link';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { CreateProjectPanel } from '@/components/projects/CreateProjectPanel';
import { createT, type Locale } from '@/lib/i18n';
import type { Skill } from '@/lib/types/database';

function CreateProjectLoading({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <div className="space-y-4">
      <div className="h-64 animate-pulse rounded-lg border border-[#e9ecef] bg-zinc-100" />
      <p className="text-sm text-zinc-500">{t('project.loadingForm')}</p>
    </div>
  );
}

function CreateProjectError({ message, locale }: { message: string; locale: Locale }) {
  const t = createT(locale);
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-800">{t('project.failedToLoadCreateForm')}</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}

async function fetchSkills(): Promise<
  { skills: Skill[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    return { error: error.message };
  }

  return { skills: (data ?? []) as Skill[] };
}

async function CreateProjectContent({ locale }: { locale: Locale }) {
  const result = await fetchSkills();

  if ('error' in result) {
    return <CreateProjectError message={result.error} locale={locale} />;
  }

  return <CreateProjectPanel skills={result.skills} />;
}

export default async function CreateProjectPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('desaworks_locale')?.value as Locale) || 'id';
  const t = createT(locale);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← {t('project.backToProjects')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          {t('project.createProject')}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {t('project.createProjectDesc')}
        </p>
      </header>

      <Suspense fallback={<CreateProjectLoading locale={locale} />}>
        <CreateProjectContent locale={locale} />
      </Suspense>
    </main>
  );
}
