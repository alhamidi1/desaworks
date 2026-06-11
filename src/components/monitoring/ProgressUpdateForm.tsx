"use client";

import { useState } from "react";
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

interface ProgressUpdateFormProps {
  assignmentId: string;
  currentProgress?: number;
  onSuccess?: () => void;
}

export default function ProgressUpdateForm({
  assignmentId,
  currentProgress = 0,
  onSuccess,
}: ProgressUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<ProgressDuplicateWarning | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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

  const progressValue = watch("progressPercentage");

  function clearMessages() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDuplicateWarning(null);
  }

  function handleResult(result: ProgressActionResult, wasForceDuplicate: boolean) {
    if (result.ok) {
      const msg = result.duplicateDetected
        ? "Progress update saved (duplicate override)."
        : "Progress update saved successfully!";
      setSuccessMessage(msg);
      setErrorMessage(null);
      setDuplicateWarning(null);
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

    // Handle failure
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
          message: `Progress cannot go below current value (${currentProgress}%).`,
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
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForceDuplicate() {
    const values = watch() as ProgressUpdateInput;
    // Ensure assignmentId is set (watch() may not return hidden fields reliably)
    values.assignmentId = assignmentId;
    await onSubmit(values, true);
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, false))}
      className="space-y-5 pt-5"
    >
      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !duplicateWarning && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning with Force Option */}
      {duplicateWarning && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Duplicate update detected</p>
              <p className="text-sm text-amber-700 mt-1">
                A progress update with {duplicateWarning.submittedPercentage}% was already
                submitted today. Do you want to submit anyway?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleForceDuplicate}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Anyway"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDuplicateWarning(null);
                setErrorMessage(null);
              }}
              className="inline-flex items-center rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input type="hidden" {...register("assignmentId")} />

      {/* Progress Percentage */}
      <div>
        <label htmlFor="progressPercentage" className="block text-sm font-medium text-gray-700 mb-1">
          Progress (%)
        </label>
        <div className="flex items-center gap-4">
          <input
            id="progressPercentage"
            type="range"
            min={0}
            max={100}
            step={5}
            {...register("progressPercentage", { valueAsNumber: true })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={isSubmitting}
          />
          <span className="w-12 text-center text-sm font-semibold text-gray-900 tabular-nums">
            {progressValue ?? 0}%
          </span>
        </div>
        {currentProgress > 0 && (
          <p className="text-xs text-gray-500 mt-1">Current progress: {currentProgress}%</p>
        )}
        {errors.progressPercentage && (
          <p className="text-sm text-red-600 mt-1">{errors.progressPercentage.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && (
          <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
        )}
      </div>

      {/* Hours Worked */}
      <div>
        <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-700 mb-1">
          Hours Worked
        </label>
        <input
          id="hoursWorked"
          type="number"
          step="0.5"
          min="0"
          {...register("hoursWorked", { valueAsNumber: true })}
          disabled={isSubmitting}
          placeholder="e.g. 2.5"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
        />
        {errors.hoursWorked && (
          <p className="text-sm text-red-600 mt-1">{errors.hoursWorked.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          disabled={isSubmitting}
          placeholder="Describe what you worked on..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors resize-none"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {isSubmitting ? "Submitting..." : "Submit Update"}
      </button>
    </form>
  );
}