"use client";

import AssignmentCard from "@/components/monitoring/AssignmentCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CardData {
  id: string;
  status: string;
  assigned_at: string;
  notes: string | null;
  project_name: string;
  project_start_date: string | null;
  project_end_date: string | null;
  project_status: string;
  current_progress: number;
  total_hours_worked: number;
  latest_description: string | null;
}

interface Props {
  cardData: CardData[];
  error?: string;
}

export function MyAssignmentsClientWrapper({ cardData, error }: Props) {
  const { t } = useLanguage();

  const activeCount = cardData.filter(
    (c) => c.status === "active" || c.status === "confirmed"
  ).length;
  const completedCount = cardData.filter((c) => c.status === "completed").length;
  const pendingCount = cardData.filter((c) => c.status === "pending").length;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1d23]">{t('assignment.title')}</h1>
        <div className="mt-4 rounded-2xl border border-[#f43f5e]/20 bg-[#f43f5e]/5 p-5">
          <p className="font-bold text-[#e11d48] text-sm">{t('project.failedToLoad')}</p>
          <p className="text-xs text-[#f43f5e] mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1a1d23]">{t('assignment.title')}</h1>
      <p className="text-sm text-[#868e96] mt-1 mb-6">
        {t('assignment.subtitle')}
      </p>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl bg-[#3b82f6]/8 border border-[#3b82f6]/15 p-4 text-center">
          <p className="text-2xl font-bold text-[#2563eb]">{cardData.length}</p>
          <p className="text-[10px] font-bold text-[#3b82f6] mt-1 uppercase tracking-wider">{t('assignment.total')}</p>
        </div>
        <div className="rounded-2xl bg-[#10b981]/8 border border-[#10b981]/15 p-4 text-center">
          <p className="text-2xl font-bold text-[#059669]">{activeCount}</p>
          <p className="text-[10px] font-bold text-[#10b981] mt-1 uppercase tracking-wider">{t('assignment.active')}</p>
        </div>
        <div className="rounded-2xl bg-[#f1f3f5] border border-[#e9ecef] p-4 text-center">
          <p className="text-2xl font-bold text-[#495057]">{completedCount}</p>
          <p className="text-[10px] font-bold text-[#868e96] mt-1 uppercase tracking-wider">{t('assignment.completed')}</p>
        </div>
        <div className="rounded-2xl bg-[#f59e0b]/8 border border-[#f59e0b]/15 p-4 text-center">
          <p className="text-2xl font-bold text-[#d97706]">{pendingCount}</p>
          <p className="text-[10px] font-bold text-[#f59e0b] mt-1 uppercase tracking-wider">{t('assignment.pending')}</p>
        </div>
      </div>

      {/* Assignment Cards */}
      {cardData.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-[#e9ecef] rounded-2xl bg-white animate-fade-in">
          <svg
            className="mx-auto h-14 w-14 text-[#dee2e6]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.251 2.251 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
            />
          </svg>
          <h3 className="mt-4 text-base font-bold text-[#1a1d23]">{t('assignment.noAssignments')}</h3>
          <p className="mt-2 text-sm text-[#868e96] max-w-sm mx-auto">
            {t('assignment.noAssignmentsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cardData.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}
