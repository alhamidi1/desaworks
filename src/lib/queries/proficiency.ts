import type { ProficiencyLevel } from '@/lib/types/database';

const PROFICIENCY_RANK: Record<ProficiencyLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function meetsProficiency(
  residentLevel: ProficiencyLevel | null,
  requiredLevel: ProficiencyLevel
): boolean {
  if (residentLevel === null) return false;
  return PROFICIENCY_RANK[residentLevel] >= PROFICIENCY_RANK[requiredLevel];
}
