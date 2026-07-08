'use client';

import { useState, useEffect } from 'react';
import RegistrationForm from '@/components/residents/RegistrationForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function RegisterPageClient() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'manual' | 'link'>('manual');
  const [copied, setCopied] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    const link = `${origin}/register`;
    setPublicLink(link);
    setWhatsappMsg(
      encodeURIComponent(
        `Halo! Silakan daftarkan diri Anda ke sistem DesaWorks melalui tautan berikut:\n${link}\n\nIsi formulir dengan data lengkap Anda. Terima kasih.`
      )
    );
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#05c8ae]">Manajemen Warga</p>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#1a1d23]">Daftar Warga Baru</h1>
        <p className="mt-1 text-sm text-[#868e96]">
          Tambahkan warga secara manual atau kirimkan tautan pendaftaran melalui WhatsApp.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-1.5 gap-1">
        <button
          onClick={() => setTab('manual')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            tab === 'manual'
              ? 'bg-white text-[#1a1d23] shadow-sm'
              : 'text-[#868e96] hover:text-[#495057]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Isi Manual
          </span>
        </button>
        <button
          onClick={() => setTab('link')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            tab === 'link'
              ? 'bg-white text-[#1a1d23] shadow-sm'
              : 'text-[#868e96] hover:text-[#495057]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Kirim via WhatsApp
          </span>
        </button>
      </div>

      {/* Manual tab */}
      {tab === 'manual' && (
        <div className="rounded-3xl border border-[#e9ecef] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#05c8ae] to-[#058074] flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1d23]">Tambah Warga Secara Manual</p>
              <p className="text-xs text-[#868e96]">Petugas mengisi data warga langsung ke dalam sistem</p>
            </div>
          </div>
          <RegistrationForm />
        </div>
      )}

      {/* WhatsApp link tab */}
      {tab === 'link' && (
        <div className="rounded-3xl border border-[#e9ecef] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0">
              {/* WhatsApp icon */}
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.387.622 4.63 1.71 6.578L2 30l7.632-1.694A13.926 13.926 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5c-2.165 0-4.195-.583-5.937-1.6l-.424-.25-4.526 1.004 1.022-4.41-.278-.453A11.482 11.482 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.302-8.638c-.344-.172-2.037-1.005-2.353-1.12-.317-.115-.547-.172-.778.172-.23.344-.893 1.12-1.094 1.35-.2.23-.403.26-.748.086-.344-.172-1.456-.537-2.773-1.71-1.025-.912-1.717-2.038-1.918-2.382-.2-.344-.021-.53.15-.7.154-.154.344-.403.516-.605.172-.2.23-.344.344-.573.115-.23.057-.43-.029-.605-.086-.172-.778-1.876-1.064-2.566-.28-.675-.566-.583-.778-.594l-.663-.013c-.23 0-.604.086-.92.43-.317.344-1.208 1.178-1.208 2.872s1.237 3.333 1.41 3.563c.172.23 2.434 3.718 5.9 5.214.824.356 1.468.568 1.97.728.826.264 1.579.226 2.174.137.663-.1 2.037-.832 2.324-1.636.287-.805.287-1.494.2-1.637-.086-.144-.316-.23-.66-.402z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1d23]">Kirim Tautan Pendaftaran</p>
              <p className="text-xs text-[#868e96]">Warga mengisi sendiri formulir dari HP mereka</p>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl bg-[#f8f9fa] p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#adb5bd]">Cara Kerja</p>
            {[
              'Salin tautan di bawah ini',
              'Kirim ke warga melalui WhatsApp',
              'Warga buka tautan dan isi formulir dari HP',
              'Data langsung masuk ke sistem DesaWorks',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-[#05c8ae]/10 text-[#05c8ae] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-[#495057]">{step}</p>
              </div>
            ))}
          </div>

          {/* Link box */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#adb5bd]">Tautan Pendaftaran</p>
            <div className="flex items-center gap-2 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] p-3">
              <span className="flex-1 truncate text-sm font-mono text-[#495057]">{publicLink}</span>
              <button
                type="button"
                onClick={copyLink}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 border"
                style={copied
                  ? { backgroundColor: '#effefb', borderColor: '#c7fff4', color: '#05c8ae' }
                  : { backgroundColor: 'white', borderColor: '#e9ecef', color: '#495057' }}
              >
                {copied ? '✓ Disalin!' : 'Salin'}
              </button>
            </div>
          </div>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full rounded-xl bg-[#25D366] px-6 py-4 text-sm font-bold text-white shadow-md shadow-green-500/20 hover:bg-[#1ebe5d] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white flex-shrink-0">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.387.622 4.63 1.71 6.578L2 30l7.632-1.694A13.926 13.926 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5c-2.165 0-4.195-.583-5.937-1.6l-.424-.25-4.526 1.004 1.022-4.41-.278-.453A11.482 11.482 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.302-8.638c-.344-.172-2.037-1.005-2.353-1.12-.317-.115-.547-.172-.778.172-.23.344-.893 1.12-1.094 1.35-.2.23-.403.26-.748.086-.344-.172-1.456-.537-2.773-1.71-1.025-.912-1.717-2.038-1.918-2.382-.2-.344-.021-.53.15-.7.154-.154.344-.403.516-.605.172-.2.23-.344.344-.573.115-.23.057-.43-.029-.605-.086-.172-.778-1.876-1.064-2.566-.28-.675-.566-.583-.778-.594l-.663-.013c-.23 0-.604.086-.92.43-.317.344-1.208 1.178-1.208 2.872s1.237 3.333 1.41 3.563c.172.23 2.434 3.718 5.9 5.214.824.356 1.468.568 1.97.728.826.264 1.579.226 2.174.137.663-.1 2.037-.832 2.324-1.636.287-.805.287-1.494.2-1.637-.086-.144-.316-.23-.66-.402z"/>
            </svg>
            Bagikan via WhatsApp
          </a>

          <p className="text-center text-xs text-[#adb5bd]">
            Tautan ini bisa dibuka oleh siapa saja yang menerimanya.
          </p>
        </div>
      )}
    </div>
  );
}
