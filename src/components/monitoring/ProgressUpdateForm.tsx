"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  progressUpdateSchema,
  type ProgressUpdateInput,
} from "@/lib/validations/monitoring";
import {
  submitProgressUpdate,
  type ProgressActionResult,
  type ProgressDuplicateWarning,
} from "@/lib/actions/progress";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProgressUpdateFormProps {
  assignmentId: string;
  currentProgress?: number;
  onSuccess?: () => void;
}

const DRAFT_KEY_PREFIX = "desaworks_draft_progress_";

function getDraftKey(assignmentId: string) {
  return `${DRAFT_KEY_PREFIX}${assignmentId}`;
}

interface DraftData {
  progressPercentage: number;
  status: string;
  description: string;
  hoursWorked: number;
  savedAt: string;
}

function saveDraft(assignmentId: string, data: Partial<ProgressUpdateInput>) {
  try {
    const draft: DraftData = {
      progressPercentage: data.progressPercentage ?? 0,
      status: data.status ?? "not_started",
      description: data.description ?? "",
      hoursWorked: data.hoursWorked ?? 0,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(getDraftKey(assignmentId), JSON.stringify(draft));
  } catch {
    // localStorage might be full or unavailable
  }
}

function loadDraft(assignmentId: string): DraftData | null {
  try {
    const raw = localStorage.getItem(getDraftKey(assignmentId));
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function clearDraft(assignmentId: string) {
  try {
    localStorage.removeItem(getDraftKey(assignmentId));
  } catch {
    // silently ignore
  }
}

export default function ProgressUpdateForm({
  assignmentId,
  currentProgress = 0,
  onSuccess,
}: ProgressUpdateFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<ProgressDuplicateWarning | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProgressUpdateInput>({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      assignmentId,
      progressPercentage: currentProgress,
      status: currentProgress === 0 ? "not_started" : "in_progress",
      description: "",
      hoursWorked: 0,
    },
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft(assignmentId);
    if (draft && draft.description) {
      setValue("progressPercentage", draft.progressPercentage);
      setValue("status", draft.status as ProgressUpdateInput["status"]);
      setValue("description", draft.description);
      setValue("hoursWorked", draft.hoursWorked);
      setDraftRestored(true);
      const timer = setTimeout(() => setDraftRestored(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [assignmentId, setValue]);

  // Auto-save draft on form value changes (debounced 1s)
  const formValues = watch();
  const debouncedSave = useCallback(
    (data: ProgressUpdateInput) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        if (data.description || data.hoursWorked > 0 || data.progressPercentage !== currentProgress) {
          saveDraft(assignmentId, data);
        }
      }, 1000);
    },
    [assignmentId, currentProgress]
  );

  useEffect(() => {
    debouncedSave(formValues);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formValues, debouncedSave]);

  const progressValue = watch("progressPercentage");

  function clearMessages() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDuplicateWarning(null);
  }

  function handleResult(result: ProgressActionResult, wasForceDuplicate: boolean) {
    if (result.ok) {
      const msg = result.duplicateDetected
        ? t('progress.savedDuplicate')
        : t('progress.savedSuccess');
      setSuccessMessage(msg);
      setErrorMessage(null);
      setDuplicateWarning(null);
      setDraftRestored(false);
      clearDraft(assignmentId);
      reset({
        assignmentId,
        progressPercentage: result.update.progress_percentage,
        status: result.update.status,
        description: "",
        hoursWorked: 0,
      });
      onSuccess?.();
      return;
    }

    switch (result.code) {
      case "VALIDATION_ERROR":
        if (result.validationErrors) {
          const fieldMap: Record<string, keyof ProgressUpdateInput> = {
            progressPercentage: "progressPercentage",
            status: "status",
            description: "description",
            hoursWorked: "hoursWorked",
            assignmentId: "assignmentId",
          };
          for (const [field, messages] of Object.entries(result.validationErrors)) {
            const formField = fieldMap[field];
            if (formField && messages && messages.length > 0) {
              setError(formField, { message: messages[0] });
            }
          }
        }
        setErrorMessage(result.message);
        break;

      case "BACKWARD_PROGRESS":
        setError("progressPercentage", {
          message: t('progress.backwardError', { pct: currentProgress }),
        });
        setErrorMessage(result.message);
        break;

      case "DUPLICATE_SUBMISSION":
        setDuplicateWarning(result.duplicateWarning ?? null);
        setErrorMessage(result.message);
        break;

      default:
        setErrorMessage(result.message);
        break;
    }
  }

  async function onSubmit(data: ProgressUpdateInput, forceDuplicate = false) {
    clearMessages();
    setIsSubmitting(true);
    try {
      const result = await submitProgressUpdate(data, { forceDuplicate });
      handleResult(result, forceDuplicate);
    } catch {
      saveDraft(assignmentId, data);
      setErrorMessage(t('progress.errorSaved'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForceDuplicate() {
    const values = watch() as ProgressUpdateInput;
    values.assignmentId = assignmentId;
    await onSubmit(values, true);
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, false))}
      className="space-y-5 pt-5"
    >
      {/* Draft Restored Indicator */}
      {draftRestored && (
        <div className="rounded-xl bg-[#3b82f6]/8 border border-[#3b82f6]/15 p-3.5 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#3b82f6] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            <p className="text-xs font-semibold text-[#2563eb]">{t('progress.draftRestored')}</p>
            <button
              type="button"
              onClick={() => {
                setDraftRestored(false);
                clearDraft(assignmentId);
                reset({
                  assignmentId,
                  progressPercentage: currentProgress,
                  status: currentProgress === 0 ? "not_started" : "in_progress",
                  description: "",
                  hoursWorked: 0,
                });
              }}
              className="ml-auto text-xs font-bold text-[#3b82f6] hover:text-[#1d4ed8] transition-colors touch-target"
            >
              {t('progress.discard')}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-xl bg-[#10b981]/8 border border-[#10b981]/15 p-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#10b981] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm font-semibold text-[#059669]">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !duplicateWarning && (
        <div className="rounded-xl bg-[#f43f5e]/8 border border-[#f43f5e]/15 p-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#f43f5e] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-semibold text-[#e11d48]">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="rounded-xl bg-[#f59e0b]/8 border border-[#f59e0b]/15 p-4 space-y-3 animate-fade-in">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-[#f59e0b] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-[#d97706]">{t('progress.duplicateDetected')}</p>
              <p className="text-sm text-[#92400e] mt-1">
                {t('progress.duplicateMessage', { pct: duplicateWarning.submittedPercentage })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleForceDuplicate}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-xl bg-[#f59e0b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d97706] disabled:opacity-50 transition-colors touch-target"
            >
              {isSubmitting ? t('progress.submitting') : t('progress.submitAnyway')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDuplicateWarning(null);
                setErrorMessage(null);
              }}
              className="inline-flex items-center rounded-xl bg-white border border-[#dee2e6] px-4 py-2.5 text-sm font-semibold text-[#495057] hover:bg-[#f8f9fa] transition-colors touch-target"
            >
              {t('progress.cancel')}
            </button>
          </div>
        </div>
      )}

      <input type="hidden" {...register("assignmentId")} />

      {/* Progress Percentage */}
      <div>
        <label htmlFor="progressPercentage" className="block text-xs font-bold text-[#495057] uppercase tracking-wider mb-2">
          {t('progress.progressPercent')}
        </label>
        <div className="flex items-center gap-4">
          <input
            id="progressPercentage"
            type="range"
            min={0}
            max={100}
            step={5}
            {...register("progressPercentage", { valueAsNumber: true })}
            className="flex-1 h-2 bg-[#e9ecef] rounded-lg appearance-none cursor-pointer accent-[#05c8ae]"
            disabled={isSubmitting}
          />
          <span className="w-14 text-center text-sm font-bold text-[#1a1d23] tabular-nums bg-[#f1f3f5] rounded-lg py-1.5">
            {progressValue ?? 0}%
          </span>
        </div>
        {currentProgress > 0 && (
          <p className="text-xs text-[#adb5bd] mt-1.5">{t('progress.currentProgress')} {currentProgress}%</p>
        )}
        {errors.progressPercentage && (
          <p className="text-xs text-[#e11d48] mt-1 font-medium">{errors.progressPercentage.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-xs font-bold text-[#495057] uppercase tracking-wider mb-2">
          {t('progress.status')}
        </label>
        <select
          id="status"
          {...register("status")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-[#dee2e6] bg-white px-4 py-3 text-sm text-[#1a1d23] shadow-sm focus:border-[#05c8ae] focus:ring-2 focus:ring-[#05c8ae]/15 focus:outline-none disabled:bg-[#f1f3f5] disabled:text-[#868e96] transition-colors touch-target"
        >
          <option value="not_started">{t('progress.statusNotStarted')}</option>
          <option value="in_progress">{t('progress.statusInProgress')}</option>
          <option value="completed">{t('progress.statusCompleted')}</option>
        </select>
        {errors.status && (
          <p className="text-xs text-[#e11d48] mt-1 font-medium">{errors.status.message}</p>
        )}
      </div>

      {/* Hours Worked */}
      <div>
        <label htmlFor="hoursWorked" className="block text-xs font-bold text-[#495057] uppercase tracking-wider mb-2">
          {t('progress.hoursWorked')}
        </label>
        <input
          id="hoursWorked"
          type="number"
          step="0.5"
          min="0"
          {...register("hoursWorked", { valueAsNumber: true })}
          disabled={isSubmitting}
          placeholder={t('progress.hoursPlaceholder')}
          className="w-full rounded-xl border border-[#dee2e6] px-4 py-3 text-sm text-[#1a1d23] shadow-sm placeholder:text-[#adb5bd] focus:border-[#05c8ae] focus:ring-2 focus:ring-[#05c8ae]/15 focus:outline-none disabled:bg-[#f1f3f5] disabled:text-[#868e96] transition-colors touch-target"
        />
        {errors.hoursWorked && (
          <p className="text-xs text-[#e11d48] mt-1 font-medium">{errors.hoursWorked.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-xs font-bold text-[#495057] uppercase tracking-wider mb-2">
          {t('progress.descriptionRequired')}
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          disabled={isSubmitting}
          placeholder={t('progress.descriptionPlaceholder')}
          className="w-full rounded-xl border border-[#dee2e6] px-4 py-3 text-sm text-[#1a1d23] shadow-sm placeholder:text-[#adb5bd] focus:border-[#05c8ae] focus:ring-2 focus:ring-[#05c8ae]/15 focus:outline-none disabled:bg-[#f1f3f5] disabled:text-[#868e96] transition-colors resize-none"
        />
        {errors.description && (
          <p className="text-xs text-[#e11d48] mt-1 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#05c8ae] to-[#058074] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#05c8ae]/20 hover:from-[#00a18f] hover:to-[#0d534d] focus:outline-none focus:ring-2 focus:ring-[#05c8ae]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-target"
      >
        {isSubmitting && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {isSubmitting ? t('progress.submitting') : t('progress.submit')}
      </button>
    </form>
  );
}