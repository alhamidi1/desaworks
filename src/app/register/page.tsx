import RegistrationForm from '@/components/residents/RegistrationForm';
import Link from 'next/link';

export const metadata = {
  title: 'Pendaftaran Warga — DesaWorks',
  description: 'Formulir pendaftaran warga untuk sistem manajemen BUMDes DesaWorks.',
};

export default function PublicRegisterPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:py-12">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary-500/8 blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-info/8 blur-[60px] translate-x-1/2 translate-y-1/2 animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-lg animate-fade-in">
        {/* Logo + branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">DesaWorks</h1>
          <p className="mt-1 text-sm text-ink-soft">Sistem Manajemen BUMDes</p>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-ink">Formulir Pendaftaran Warga</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Isi data diri Anda dengan lengkap dan benar. Data ini akan digunakan untuk mendaftarkan Anda ke program kerja desa.
            </p>
          </div>

          <RegistrationForm isPublic={true} />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          Formulir ini dikelola oleh BUMDes setempat melalui sistem DesaWorks.
          <br />
          Jika ada pertanyaan, hubungi petugas desa Anda.
        </p>
      </div>
    </main>
  );
}
