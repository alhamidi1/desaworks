"use client";

import React, { useState } from 'react';

export default function AvailabilityToggle({ residentId, initial }: { residentId: string; initial: 'available' | 'unavailable' }) {
  const [availability, setAvailability] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = availability === 'available' ? 'unavailable' : 'available';
    setLoading(true);
    try {
      const res = await fetch(`/api/residents/${residentId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: next }),
      });
      if (!res.ok) throw new Error('Failed');
      setAvailability(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="px-3 py-1 rounded border">
      {loading ? 'Saving...' : availability === 'available' ? 'Available' : 'Unavailable'}
    </button>
  );
}
