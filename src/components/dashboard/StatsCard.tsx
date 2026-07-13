'use client';

import type { ReactNode } from 'react';

export type StatsAccent = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  hint?: string;
  accent?: StatsAccent;
  icon?: ReactNode;
  className?: string;
}

const accentText: Record<StatsAccent, string> = {
  primary: 'text-primary-700',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-ink',
};

export function StatsCard({ title, value, description, hint, accent = 'neutral', icon, className = '' }: StatsCardProps) {
  const valueStr = String(value);
  const fontSizeClass = valueStr.length > 14
    ? 'text-lg sm:text-xl lg:text-2xl'
    : valueStr.length > 10
      ? 'text-xl sm:text-2xl lg:text-3xl'
      : 'text-2xl sm:text-3xl';

  return (
    <article className={`nm-raised p-3.5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft sm:text-xs">{title}</p>
        {icon ? <span className="shrink-0 text-primary-600">{icon}</span> : null}
      </div>
      <p className={`mt-2 font-bold tracking-tight ${fontSizeClass} ${accentText[accent]} truncate`} title={valueStr}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs font-medium text-ink-soft">{hint}</p> : null}
      {description ? <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">{description}</p> : null}
    </article>
  );
}
