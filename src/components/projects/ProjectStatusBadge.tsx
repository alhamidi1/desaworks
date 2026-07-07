import type { ProjectStatus } from '@/lib/types/database';

// Bilingual labels — Indonesian first
const STATUS_LABELS_ID: Record<ProjectStatus, string> = {
  draft: 'Draf',
  open: 'Terbuka',
  in_progress: 'Sedang Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-[#f1f3f5] text-[#495057] border-[#e9ecef]',
  open: 'bg-[#3b82f6]/10 text-[#2563eb] border-[#3b82f6]/20',
  in_progress: 'bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/20',
  completed: 'bg-[#10b981]/10 text-[#059669] border-[#10b981]/20',
  cancelled: 'bg-[#f43f5e]/10 text-[#e11d48] border-[#f43f5e]/20',
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABELS_ID[status]}
    </span>
  );
}
