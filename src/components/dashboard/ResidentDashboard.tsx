'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  activeAssignments: ResidentAssignment[];
  completedAssignmentsCount: number;
  totalHoursWorked: number;
  notifications: ResidentNotification[];
}

export default function ResidentDashboard({
  userName,
  activeAssignments,
  completedAssignmentsCount,
  totalHoursWorked,
  notifications: initialNotifications,
}: ResidentDashboardProps) {
  const router = useRouter();
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.12)] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-10 h-32 w-32 bg-blue-500/10 blur-2xl rounded-full" />

        <div className="relative z-10 space-y-2">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
            Resident Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {userName}!
          </h1>
          <p className="max-w-xl text-sm text-slate-400 leading-relaxed">
            Review your community project assignments, update your work progress, and stay updated with village enterprise notifications.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-medium text-slate-500">Active Assignments</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950">{activeCount}</span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Currently assigned and active</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-medium text-slate-500">Completed Projects</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950">{completedAssignmentsCount}</span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Successfully finalized</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-medium text-slate-500">Total Hours Logged</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950">{totalHoursWorked}</span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Accumulated across all tasks</p>
        </article>
      </div>

      {/* Core Layout: Assignments + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Assignments Section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Assignments</h2>
            <Link href="/my-assignments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
              View All
            </Link>
          </div>

          {activeAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 px-6 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No active projects</h3>
              <p className="mt-1 text-xs text-slate-500">You are not currently assigned to any active projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeAssignments.map((assignment) => (
                <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{assignment.project_name}</h3>
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                        {assignment.status}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-500">
                      <div>
                        <span className="font-medium text-slate-400 block">Start Date</span>
                        <span>{assignment.project_start_date ? new Date(assignment.project_start_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-400 block">End Date</span>
                        <span>{assignment.project_end_date ? new Date(assignment.project_end_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Reported Progress</span>
                        <span>{assignment.current_progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full transition-all duration-300" style={{ width: `${assignment.current_progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Total logged: <strong>{assignment.total_hours_worked} hrs</strong>
                    </span>
                    <Link
                      href="/my-assignments"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Log Work
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Notifications</h2>
            {unreadNotifications.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {unreadNotifications.length} new
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] max-h-[420px] overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-3.5 rounded-xl border transition-all text-xs space-y-1 relative ${
                  notif.read
                    ? 'bg-slate-50/40 border-slate-100 text-slate-500'
                    : 'bg-teal-50/20 border-teal-100/60 text-slate-800 font-medium'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">{notif.message}</p>
                  
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="mt-2 text-[10px] font-bold text-teal-600 hover:text-teal-700 transition-colors block"
                    >
                      Mark as read
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
