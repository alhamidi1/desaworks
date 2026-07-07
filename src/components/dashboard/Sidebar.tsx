'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SidebarProps {
  role: 'resident' | 'manager' | 'admin';
  userName: string;
}

// Icon components for cleanliness
function DashboardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function ProjectsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
  );
}

function ReportsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function AssignmentsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function RegisterIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isManager = role === 'manager' || role === 'admin';

  interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    mobileIcon: React.ReactNode;
  }

  const navItems: NavItem[] = [
    {
      label: t('nav.dashboard'),
      href: '/dashboard',
      icon: <DashboardIcon />,
      mobileIcon: <DashboardIcon className="h-6 w-6" />,
    },
    ...(isManager
      ? [
          {
            label: t('nav.projects'),
            href: '/projects',
            icon: <ProjectsIcon />,
            mobileIcon: <ProjectsIcon className="h-6 w-6" />,
          },
          {
            label: t('nav.reports'),
            href: '/reports',
            icon: <ReportsIcon />,
            mobileIcon: <ReportsIcon className="h-6 w-6" />,
          },
          {
            label: t('nav.registerResident'),
            href: '/dashboard/residents/register',
            icon: <RegisterIcon />,
            mobileIcon: <RegisterIcon className="h-6 w-6" />,
          },
        ]
      : [
          {
            label: t('nav.myAssignments'),
            href: '/my-assignments',
            icon: <AssignmentsIcon />,
            mobileIcon: <AssignmentsIcon className="h-6 w-6" />,
          },
        ]),
  ];

  function isActiveLink(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  }

  const roleLabel = t(`roles.${role}`);

  return (
    <>
      {/* ==========================================
          MOBILE TOP BAR
          ========================================== */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e9ecef] glass px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl p-2 text-[#495057] hover:bg-[#f1f3f5] active:bg-[#e9ecef] transition-colors touch-target"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#05c8ae] to-[#058074] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </div>
          <span className="text-base font-bold text-[#1a1d23] tracking-tight">DesaWorks</span>
        </div>

        {/* Language toggle — mobile header */}
        <button
          onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
          className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#05c8ae] bg-[#effefb] border border-[#c7fff4] touch-target"
        >
          {locale === 'id' ? 'EN' : 'ID'}
        </button>
      </header>

      {/* ==========================================
          MOBILE OVERLAY
          ========================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#16191d]/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          DESKTOP SIDEBAR
          ========================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col glass-dark transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#05c8ae] to-[#058074] flex items-center justify-center shadow-lg shadow-[#05c8ae]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">DesaWorks</span>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 touch-target ${
                  active
                    ? 'bg-[#05c8ae]/15 text-[#51f7db] shadow-[0_2px_8px_rgba(5,200,174,0.1)]'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle — desktop */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-white/70 hover:text-white transition-colors touch-target"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            {locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          </button>
        </div>

        {/* User profile & Sign Out */}
        <div className="border-t border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#05c8ae]/30 to-[#058074]/30 font-bold text-[#51f7db] text-sm border border-[#05c8ae]/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white leading-tight">{userName}</p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                isManager
                  ? 'bg-[#05c8ae]/15 text-[#51f7db] border border-[#05c8ae]/25'
                  : 'bg-[#3b82f6]/15 text-[#93c5fd] border border-[#3b82f6]/25'
              }`}>
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50 touch-target"
          >
            {isLoggingOut ? (
              <span>{t('nav.signingOut')}</span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                {t('nav.signOut')}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION BAR
          ========================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#e9ecef] glass safe-bottom lg:hidden">
        <div className="flex items-center justify-around px-2 pt-1 pb-1">
          {navItems.slice(0, 4).map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl min-w-[60px] transition-colors touch-target ${
                  active
                    ? 'text-[#05c8ae]'
                    : 'text-[#868e96] active:text-[#05c8ae]'
                }`}
              >
                {item.mobileIcon}
                <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-[#05c8ae]' : 'text-[#868e96]'}`}>
                  {item.label.length > 10 ? item.label.split(' ')[0] : item.label}
                </span>
                {active && (
                  <div className="h-1 w-5 rounded-full bg-[#05c8ae] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
