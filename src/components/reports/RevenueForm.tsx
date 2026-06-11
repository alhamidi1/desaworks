"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  revenueRecordSchema,
  type RevenueRecordInput,
} from '@/lib/validations/monitoring';
import {
  submitRevenueRecord,
  type RevenueActionResult,
  type RevenueWarning,
} from '@/lib/actions/revenue';

interface RevenueFormProps {
  projects: { id: string; name: string }[];
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function RevenueForm({ projects }: RevenueFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<RevenueWarning | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RevenueRecordInput>({
    resolver: zodResolver(revenueRecordSchema),
    defaultValues: {
      projectId: '',
      amount: undefined,
      description: '',
      recordDate: getTodayString(),
    },
  });

  async function onSubmit(data: RevenueRecordInput) {
    setServerError(null);
    setSuccessMessage(null);
    setWarning(null);

    const result: RevenueActionResult = await submitRevenueRecord(data);

    if (!result.ok) {
      if (result.validationErrors) {
        for (const [field, messages] of Object.entries(result.validationErrors)) {
          if (messages && messages.length > 0) {
            setError(field as keyof RevenueRecordInput, {
              message: messages[0],
            });
          }
        }
      }

      setServerError(result.message);
      return;
    }

    if (result.warning) {
      setWarning(result.warning);
    } else {
      setSuccessMessage('Revenue record saved successfully.');
      reset({
        projectId: '',
        amount: undefined,
        description: '',
        recordDate: getTodayString(),
      });
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Record Revenue</h3>
      <p className="mt-1 text-sm text-slate-500">
        Add a new revenue entry for a project.
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {warning && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <div>
              <p className="font-medium">Budget Warning</p>
              <p className="mt-1">{warning.message}</p>
              <p className="mt-1 text-xs text-amber-600">
                Projected total revenue:{' '}
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(warning.projectedTotalRevenue)}{' '}
                / Budget:{' '}
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(warning.budget)}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* Project Select */}
        <div>
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-slate-700"
          >
            Project
          </label>
          <select
            id="projectId"
            {...register('projectId')}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">Select a project…</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-700"
          >
            Amount (IDR)
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            placeholder="0"
            {...register('amount', { valueAsNumber: true })}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Describe this revenue entry…"
            {...register('description')}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Record Date */}
        <div>
          <label
            htmlFor="recordDate"
            className="block text-sm font-medium text-slate-700"
          >
            Date
          </label>
          <input
            id="recordDate"
            type="date"
            {...register('recordDate')}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {errors.recordDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.recordDate.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            'Record Revenue'
          )}
        </button>
      </form>
    </section>
  );
}
