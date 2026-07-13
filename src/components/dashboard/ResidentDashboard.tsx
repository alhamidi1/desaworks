'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatDateShort } from '@/lib/i18n';
import AvailabilityToggle from '@/components/residents/AvailabilityToggle';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';

export interface ResidentAssignment {
  id: string;
  status: string;
  assigned_at: string;
  project_name: string;
  project_start_date: string | null;
  project_end_date: string | null;
  project_status: string;
  current_progress: number;
  total_hours_worked: number;
  latest_description: string | null;
}

export interface ResidentNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface ResidentDashboardProps {
  userName: string;
  residentId: string;
  availability: 'available' | 'unavailable';
  activeAssignments: ResidentAssignment[];
  completedAssignmentsCount: number;
  totalHoursWorked: number;
  notifications: ResidentNotification[];
}

export default function ResidentDashboard({
  userName,
  residentId,
  availability,
  activeAssignments,
  completedAssignmentsCount,
  totalHoursWorked,
  notifications: initialNotifications,
}: ResidentDashboardProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [notifications, setNotifications] = useState<ResidentNotification[]>(initialNotifications);

  async function markNotificationAsRead(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      router.refresh();
    }
  }

  const activeCount = activeAssignments.length;
  const unreadNotifications = notifications.filter(n => !n.read);

  // Searchable + paginated assignment list (10 per page).
  const assignments = usePaginatedSearch(activeAssignments, {
    pageSize: 10,
    searchFields: (a) => [a.project_name],
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#16191d] via-[#1a2332] to-[#0d534d] text-white p-5 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 h-48 w-48 bg-[#05c8ae]/15 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-12 h-36 w-36 bg-[#3b82f6]/10 blur-[60px] rounded-full" />
        <div className="absolute -left-8 top-1/2 h-28 w-28 bg-[#f59e0b]/8 blur-[50px] rounded-full" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#51f7db] bg-[#05c8ae]/15 border border-[#05c8ae]/20 px-2.5 py-1 rounded-full">
              {t('dashboard.residentPortal')}
            </span>
            <AvailabilityToggle residentId={residentId} initial={availability} />
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            {t('dashboard.welcomeBack', { name: userName })}
          </h1>
          <p className="max-w-xl text-sm text-white/60 leading-relaxed">
            {t('dashboard.residentSubtitle')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <article className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <p className="text-xs font-semibold text-[#868e96] uppercase tracking-wider">{t('stats.activeAssignments')}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1a1d23]">{activeCount}</span>
            <span className="text-xs text-[#adb5bd]">{t('stats.projects')}</span>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <p className="text-xs font-semibold text-[#868e96] uppercase tracking-wider">{t('stats.completedProjects')}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1a1d23]">{completedAssignmentsCount}</span>
            <span className="text-xs text-[#adb5bd]">{t('stats.projects')}</span>
          </div>
          <p className="mt-2 text-xs text-[#adb5bd]">{t('stats.successfullyFinalized')}</p>
        </article>

        <article className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <p className="text-xs font-semibold text-[#868e96] uppercase tracking-wider">{t('stats.totalHoursLogged')}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1a1d23]">{totalHoursWorked}</span>
            <span className="text-xs text-[#adb5bd]">{t('stats.hours')}</span>
          </div>
          <p className="mt-2 text-xs text-[#adb5bd]">{t('stats.accumulatedHours')}</p>
        </article>
      </div>

      {/* Core Layout: Assignments + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Assignments Section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a1d23] tracking-tight">{t('assignment.activeAssignments')}</h2>
            <Link href="/my-assignments" className="text-xs font-semibold text-[#05c8ae] hover:text-[#058074] transition-colors touch-target px-2 py-1">
              {t('assignment.viewAll')}
            </Link>
          </div>

          {activeAssignments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#e9ecef] bg-white py-12 px-6 text-center animate-fade-in">
              <svg className="mx-auto h-12 w-12 text-[#dee2e6]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              <h3 className="mt-4 text-sm font-bold text-[#1a1d23]">{t('assignment.noActiveProjects')}</h3>
              <p className="mt-1 text-xs text-[#868e96]">{t('assignment.noActiveProjectsDesc')}</p>
            </div>
          ) : (
            <>
              {activeAssignments.length > 5 && (
                <SearchInput value={assignments.query} onChange={assignments.setQuery} placeholder={t('project.searchPlaceholder')} />
              )}
              {assignments.total === 0 ? (
                <p className="rounded-2xl border-2 border-dashed border-[#e9ecef] bg-white py-10 text-center text-sm text-[#868e96]">{t('common.noResults')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assignments.pageItems.map((assignment) => (
                <article key={assignment.id} className="rounded-2xl border border-[#e9ecef] bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#1a1d23] text-sm sm:text-base leading-snug">{assignment.project_name}</h3>
                      <span className="inline-flex items-center rounded-full bg-[#effefb] px-2.5 py-0.5 text-[10px] font-bold text-[#058074] border border-[#c7fff4] whitespace-nowrap">
                        {t(`status.${assignment.status}`)}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-[#868e96]">
                      <div>
                        <span className="font-semibold text-[#adb5bd] block">{t('date.start')}</span>
                        <span>{formatDateShort(assignment.project_start_date, locale)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#adb5bd] block">{t('date.end')}</span>
                        <span>{formatDateShort(assignment.project_end_date, locale)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-[#495057]">
                        <span>{t('assignment.reportedProgress')}</span>
                        <span>{assignment.current_progress}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#f1f3f5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#05c8ae] to-[#058074] rounded-full transition-all duration-500"
                          style={{ width: `${assignment.current_progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#f1f3f5] flex items-center justify-between">
                    <span className="text-xs text-[#adb5bd]">
                      {t('assignment.totalLogged')} <strong className="text-[#495057]">{assignment.total_hours_worked} {t('assignment.hrs')}</strong>
                    </span>
                    <Link
                      href="/my-assignments"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#05c8ae] hover:text-[#058074] transition-colors touch-target px-2 py-1"
                    >
                      {t('assignment.logWork')}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  </div>
                </article>
                  ))}
                </div>
              )}
              <Pagination
                page={assignments.page}
                totalPages={assignments.totalPages}
                total={assignments.total}
                from={assignments.from}
                to={assignments.to}
                onPage={assignments.setPage}
              />
            </>
          )}
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a1d23] tracking-tight">{t('notification.title')}</h2>
            {unreadNotifications.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#3b82f6]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#3b82f6] border border-[#3b82f6]/20">
                {unreadNotifications.length} {t('notification.new')}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-sm max-h-[420px] overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-center py-8 text-[#adb5bd]">{t('notification.noNotifications')}</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-3.5 rounded-xl border transition-all text-xs space-y-1.5 ${
                  notif.read
                    ? 'bg-[#f8f9fa] border-[#f1f3f5] text-[#868e96]'
                    : 'bg-[#effefb] border-[#c7fff4] text-[#1a1d23]'
                }`}>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-sm">{notif.title}</span>
                    <span className="text-[10px] text-[#adb5bd] whitespace-nowrap">
                      {formatDateShort(notif.created_at, locale)}
                    </span>
                  </div>
                  <p className="text-[#868e96] leading-relaxed">{notif.message}</p>

                  {!notif.read && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="mt-1.5 text-[11px] font-bold text-[#05c8ae] hover:text-[#058074] transition-colors touch-target"
                    >
                      {t('notification.markAsRead')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
