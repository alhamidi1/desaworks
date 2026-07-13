'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { voidAssignment } from '@/lib/actions/projects';
import type { Profile, Assignment } from '@/lib/types/database';

type AssignmentWithResident = Assignment & { resident: Profile };

interface AssignedWorkersProps {
  projectId: string;
  assignments: AssignmentWithResident[];
  workersNeeded: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-[#effefb] text-[#05c8ae]',
  confirmed: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-[#f8f9fa] text-[#868e96]',
};

const statusLabel: Record<string, string> = {
  confirmed: 'Dikonfirmasi',
  active: 'Aktif',
  pending: 'Menunggu',
  completed: 'Selesai',
};

export function AssignedWorkers({ projectId, assignments, workersNeeded }: AssignedWorkersProps) {
  const router = useRouter();
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVoid(assignmentId: string, residentName: string) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan penugasan ${residentName}?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setVoidingId(assignmentId);
    setError(null);

    const result = await voidAssignment({ assignment_id: assignmentId });

    if (!result.success) {
      setError(result.error);
      setVoidingId(null);
      return;
    }

    router.refresh();
    setVoidingId(null);
  }

  if (assignments.length === 0) {
    return (
      <div className="mt-4 rounded-xl border-2 border-dashed border-[#e9ecef] p-6 text-center">
        <p className="text-sm text-[#868e96]">Belum ada pekerja ditugaskan.</p>
        <p className="text-xs text-[#adb5bd] mt-1">Klik "+ Tugaskan Pekerja" untuk mencocokkan warga dengan proyek ini.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}
      {assignments.map((a) => (
        <div
          key={a.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {a.resident.full_name?.charAt(0) ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1d23]">{a.resident.full_name}</p>
              <p className="text-xs text-[#868e96]">{a.resident.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[a.status] ?? 'bg-[#f1f3f5] text-[#868e96]'}`}>
              {statusLabel[a.status] ?? a.status}
            </span>
            {a.status !== 'completed' && (
              <button
                onClick={() => handleVoid(a.id, a.resident.full_name ?? 'pekerja ini')}
                disabled={voidingId === a.id}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#adb5bd] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-200"
                title="Batalkan penugasan"
              >
                {voidingId === a.id ? '...' : 'Batalkan'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
