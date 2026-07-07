"use client";

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  totalProjects: number;
  activeProjects: number;
  projectNames: { id: string; name: string }[];
}

export function ReportsPageClient({ totalProjects, activeProjects, projectNames }: Props) {
  const { t } = useLanguage();

  const reportCards = [
    {
      title: t('report.performance'),
      description: t('report.performanceDesc'),
      href: '/reports/performance',
      iconColor: 'text-[#05c8ae]',
      iconBg: 'bg-[#05c8ae]/10',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
    {
      title: t('report.revenueReport'),
      description: t('report.revenueDesc'),
      href: '/reports/revenue',
      iconColor: 'text-[#f43f5e]',
      iconBg: 'bg-[#f43f5e]/10',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      title: t('report.projectAnalytics'),
      description: t('report.analyticsDesc'),
      href: '#',
      iconColor: 'text-[#3b82f6]',
      iconBg: 'bg-[#3b82f6]/10',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#05c8ae]">
          {t('nav.reports')}
        </p>
        <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#1a1d23]">
          {t('report.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#868e96]">
          {t('report.subtitle')}
        </p>
      </div>

      {/* Quick stats */}
      <div className="mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#adb5bd]">
            {t('report.totalProjects')}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1a1d23]">
            {totalProjects}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#adb5bd]">
            {t('report.activeProjects')}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#05c8ae]">
            {activeProjects}
          </p>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => {
          const isLink = card.href !== '#';

          const content = (
            <div className="group flex h-full flex-col rounded-2xl border border-[#e9ecef] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#c7fff4] hover:-translate-y-0.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
              <h2 className="mt-4 text-base sm:text-lg font-bold text-[#1a1d23] group-hover:text-[#05c8ae] transition-colors">
                {card.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#868e96]">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#05c8ae]">
                {isLink ? t('report.viewReport') : t('report.selectProject')}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          );

          if (isLink) {
            return (
              <Link key={card.title} href={card.href} className="block">
                {content}
              </Link>
            );
          }

          return (
            <div key={card.title}>
              {content}
              {projectNames.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {projectNames.map((p) => (
                    <li key={p.id}>
                      <Link
                        href="/reports/performance"
                        className="block rounded-xl px-3 py-2 text-sm text-[#495057] transition-colors hover:bg-[#effefb] hover:text-[#05c8ae] touch-target"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
