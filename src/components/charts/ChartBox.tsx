'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Fixed-height wrapper for a Recharts chart.
 * Renders the ResponsiveContainer only after mount, so the container always
 * measures a laid-out parent — this avoids Recharts' noisy dev warning
 * ("The width(-1) and height(-1) of chart should be greater than 0") that
 * fires when it measures a 0×0 box during React StrictMode's double render.
 */
export function ChartBox({ height, children }: { height: number; children: ReactElement }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ width: '100%', height }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
