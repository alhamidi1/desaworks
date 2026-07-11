'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface p-6">
      <div className="nm-raised max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger-soft text-danger" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="mt-3 text-lg font-bold text-ink">Terjadi kesalahan</h1>
        <p className="mt-1 text-sm text-ink-soft">Something went wrong. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="nm-raised-sm nm-pressable mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
