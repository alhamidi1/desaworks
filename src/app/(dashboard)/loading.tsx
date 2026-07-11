export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600" />
        <p className="text-sm text-ink-soft">Memuat…</p>
      </div>
    </div>
  );
}
