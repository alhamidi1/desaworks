"use client";

import { useState, useCallback } from "react";
import ProgressUpdateForm from "./ProgressUpdateForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatDateShort } from "@/lib/i18n";

export interface AssignmentCardProps {
  assignment: {
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
  };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "bg-[#10b981]/10", text: "text-[#059669]", border: "border-[#10b981]/20" },
  confirmed: { bg: "bg-[#3b82f6]/10", text: "text-[#2563eb]", border: "border-[#3b82f6]/20" },
  pending: { bg: "bg-[#f59e0b]/10", text: "text-[#d97706]", border: "border-[#f59e0b]/20" },
  completed: { bg: "bg-[#f1f3f5]", text: "text-[#495057]", border: "border-[#e9ecef]" },
  void: { bg: "bg-[#f43f5e]/10", text: "text-[#e11d48]", border: "border-[#f43f5e]/20" },
};

function getProgressColor(pct: number): string {
  if (pct >= 80) return "from-[#10b981] to-[#059669]";
  if (pct >= 50) return "from-[#05c8ae] to-[#058074]";
  if (pct >= 25) return "from-[#f59e0b] to-[#d97706]";
  return "from-[#adb5bd] to-[#868e96]";
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const { t, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(assignment.current_progress);

  const statusStyle = STATUS_STYLES[assignment.status] ?? STATUS_STYLES.pending;
  const isCompleted = assignment.status === "completed" || assignment.status === "void";
  const statusLabel = t(`status.${assignment.status}`);

  const handleUpdateSuccess = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <div className="rounded-2xl border border-[#e9ecef] bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="p-5 border-b border-[#f1f3f5]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-[#1a1d23] truncate">
              {assignment.project_name}
            </h2>
            {assignment.notes && (
              <p className="text-sm text-[#868e96] mt-1 line-clamp-2">{assignment.notes}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Dates Row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-[#868e96]">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-[#adb5bd]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {t('date.start')}: {formatDateShort(assignment.project_start_date, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-[#adb5bd]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {t('date.end')}: {formatDateShort(assignment.project_end_date, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-[#adb5bd]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {assignment.total_hours_worked.toFixed(1)} {t('assignment.hrs')}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#495057]">{t('progress.title')}</span>
          <span className="text-sm font-bold text-[#1a1d23]">{currentProgress}%</span>
        </div>
        <div className="w-full bg-[#f1f3f5] rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(currentProgress)} transition-all duration-500`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Latest Update */}
        {assignment.latest_description && (
          <div className="mt-3 rounded-xl bg-[#f8f9fa] p-3.5 border border-[#f1f3f5]">
            <p className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-wider mb-1">{t('progress.latestUpdate')}</p>
            <p className="text-sm text-[#495057] line-clamp-2">{assignment.latest_description}</p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {!isCompleted && (
        <div className="border-t border-[#f1f3f5]">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#05c8ae] hover:bg-[#effefb] active:bg-[#c7fff4] transition-colors touch-target"
          >
            {isExpanded ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
                {t('progress.hideForm')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t('progress.submitUpdate')}
              </>
            )}
          </button>

          {isExpanded && (
            <div className="px-5 pb-5 border-t border-[#f1f3f5]">
              <ProgressUpdateForm
                assignmentId={assignment.id}
                currentProgress={currentProgress}
                onSuccess={handleUpdateSuccess}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}