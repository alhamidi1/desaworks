"use client";

import { useState, useCallback } from "react";
import ProgressUpdateForm from "./ProgressUpdateForm";

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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
  void: { bg: "bg-red-100", text: "text-red-700", label: "Void" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getProgressColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-blue-500";
  if (pct >= 25) return "bg-yellow-500";
  return "bg-gray-400";
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(assignment.current_progress);

  const statusStyle = STATUS_STYLES[assignment.status] ?? STATUS_STYLES.pending;
  const isCompleted = assignment.status === "completed" || assignment.status === "void";

  const handleUpdateSuccess = useCallback(() => {
    // We don't have the exact new value, but the form submitted successfully
    // In a real app you'd revalidate. For now, just close the form.
    setIsExpanded(false);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {assignment.project_name}
            </h2>
            {assignment.notes && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{assignment.notes}</p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.label}
          </span>
        </div>

        {/* Dates Row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Start: {formatDate(assignment.project_start_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            End: {formatDate(assignment.project_end_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {assignment.total_hours_worked.toFixed(1)}h worked
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{currentProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(currentProgress)}`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Latest Update */}
        {assignment.latest_description && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Latest update</p>
            <p className="text-sm text-gray-700 line-clamp-2">{assignment.latest_description}</p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {!isCompleted && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {isExpanded ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
                Hide Update Form
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Submit Progress Update
              </>
            )}
          </button>

          {isExpanded && (
            <div className="px-5 pb-5 border-t border-gray-100">
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