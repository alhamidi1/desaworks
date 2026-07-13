// Clarity chart palette.
// Recharts needs literal color values (it can't read CSS custom properties),
// so these mirror the design tokens in globals.css. Keep them in sync if the
// tokens change — this is the single source of truth for chart colors.

export const chartPalette = {
  primary: '#00a18f', // --color-primary-600
  primaryLight: '#51f7db', // --color-primary-300
  grid: '#e6e9ee', // --color-border
  axis: '#667085', // --color-ink-soft
  ref: '#98a2b3', // --color-ink-mute (reference lines)
  pieStroke: '#ffffff', // --color-card (gap between donut slices)
} as const;

// Project-status donut colors (map to the semantic tokens).
export const statusColors: Record<string, string> = {
  draft: '#98a2b3', // ink-mute
  open: '#2563eb', // info
  in_progress: '#00a18f', // primary-600
  completed: '#0f9d76', // success
  cancelled: '#d11d43', // danger
};
export const statusFallback = '#868e96';

// Shared Recharts tooltip style — flat white card with a hairline border.
export const chartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e6e9ee',
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(16,24,40,0.08)',
  fontSize: '12px',
} as const;
