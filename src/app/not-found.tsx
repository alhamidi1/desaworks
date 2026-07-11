import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface p-6">
      <div className="nm-raised max-w-md p-8 text-center">
        <p className="text-5xl font-bold text-primary-600">404</p>
        <h1 className="mt-3 text-lg font-bold text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-ink-soft">Page not found — the page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="nm-raised-sm nm-pressable mt-5 inline-block rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
