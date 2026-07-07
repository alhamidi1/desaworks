// DesaWorks — Bahasa Indonesia Translation Dictionary
// Uses simple, natural language suitable for village residents

const id = {
  // App
  appName: 'DesaWorks',
  appTagline: 'Sistem Pengelolaan Sumber Daya Masyarakat',
  appDescription: 'Platform pengelolaan tenaga kerja dan proyek desa untuk BUMDes',

  // Navigation
  nav: {
    dashboard: 'Beranda',
    projects: 'Proyek',
    reports: 'Laporan',
    myAssignments: 'Tugas Saya',
    registerResident: 'Daftar Warga',
    signOut: 'Keluar',
    signingOut: 'Keluar...',
  },

  // Roles
  roles: {
    resident: 'Warga',
    manager: 'Manajer',
    admin: 'Admin',
  },

  // Login
  login: {
    title: 'Masuk ke DesaWorks',
    subtitle: 'Sistem Pengelolaan Sumber Daya Masyarakat',
    email: 'Alamat Email',
    password: 'Kata Sandi',
    emailPlaceholder: 'email@contoh.com',
    passwordPlaceholder: '••••••••',
    signIn: 'Masuk',
    signingIn: 'Sedang masuk…',
    authFailed: 'Gagal masuk',
    testCredentials: 'Akun Uji Coba',
    managerRole: 'Peran Manajer',
    residentRole: 'Peran Warga',
  },

  // Dashboard - Common
  dashboard: {
    managerTitle: 'Beranda Manajer',
    managerSubtitle: 'Pantau proyek, lacak kemajuan pekerja, dan tinjau aktivitas usaha desa.',
    residentPortal: 'Portal Warga',
    welcomeBack: 'Selamat Datang, {name}!',
    residentSubtitle: 'Lihat tugas proyek, perbarui kemajuan kerja, dan ikuti pemberitahuan dari desa.',
  },

  // Stats
  stats: {
    totalProjects: 'Total Proyek',
    allRegistered: 'Semua proyek terdaftar',
    activeWorkers: 'Pekerja Aktif',
    currentlyAssigned: 'Saat ini ditugaskan',
    avgCompletion: 'Rata-rata Selesai',
    avgAcrossProjects: 'Rata-rata semua proyek',
    recentUpdates: 'Pembaruan Terbaru',
    latestReports: 'Laporan kemajuan terbaru',
    activeAssignments: 'Tugas Aktif',
    projects: 'proyek',
    completedProjects: 'Proyek Selesai',
    successfullyFinalized: 'Berhasil diselesaikan',
    totalHoursLogged: 'Total Jam Kerja',
    hours: 'jam',
    accumulatedHours: 'Total jam dari semua tugas',
    onTrack: 'Sesuai target',
    progressing: 'Berjalan',
    earlyStage: 'Tahap awal',
    noData: 'Belum ada data',
    assigned: 'Ditugaskan',
    new: 'Baru',
    none: 'Belum ada',
    active: '{count} aktif',
  },

  // Projects
  project: {
    title: 'Proyek',
    subtitle: 'Kelola proyek desa dan penugasan tenaga kerja',
    createProject: 'Buat Proyek',
    noProjects: 'Belum ada proyek',
    noProjectsDesc: 'Buat proyek pertama untuk mulai menugaskan pekerja.',
    loadingProjects: 'Memuat proyek...',
    failedToLoad: 'Gagal memuat proyek',
    workers: 'pekerja',
    done: 'selesai',
    viewAll: 'Lihat Semua',
    budget: 'Anggaran',
    revenue: 'Pendapatan',
    startDate: 'Tanggal Mulai',
    endDate: 'Tanggal Selesai',
    notSet: 'Belum ditentukan',
  },

  // Status labels
  status: {
    draft: 'Draf',
    open: 'Terbuka',
    in_progress: 'Sedang Berjalan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    active: 'Aktif',
    void: 'Dibatalkan',
    not_started: 'Belum Dimulai',
  },

  // Assignments
  assignment: {
    title: 'Tugas Saya',
    subtitle: 'Lacak tugas proyek dan kirim pembaruan kemajuan.',
    total: 'Total',
    active: 'Aktif',
    completed: 'Selesai',
    pending: 'Menunggu',
    noAssignments: 'Belum ada tugas',
    noAssignmentsDesc: 'Anda belum ditugaskan ke proyek manapun. Hubungi manajer Anda.',
    activeAssignments: 'Tugas Aktif',
    viewAll: 'Lihat Semua',
    noActiveProjects: 'Tidak ada proyek aktif',
    noActiveProjectsDesc: 'Anda belum ditugaskan ke proyek aktif saat ini.',
    logWork: 'Catat Kerja',
    totalLogged: 'Total tercatat:',
    hrs: 'jam',
    reportedProgress: 'Kemajuan Dilaporkan',
  },

  // Progress
  progress: {
    title: 'Kemajuan',
    submitUpdate: 'Kirim Pembaruan',
    hideForm: 'Tutup Formulir',
    progressPercent: 'Kemajuan (%)',
    currentProgress: 'Kemajuan saat ini:',
    status: 'Status',
    hoursWorked: 'Jam Kerja',
    hoursPlaceholder: 'contoh: 2.5',
    description: 'Keterangan',
    descriptionRequired: 'Keterangan *',
    descriptionPlaceholder: 'Jelaskan apa yang telah dikerjakan...',
    submit: 'Kirim Pembaruan',
    submitting: 'Mengirim...',
    savedSuccess: 'Pembaruan kemajuan berhasil disimpan!',
    savedDuplicate: 'Pembaruan kemajuan disimpan (duplikat ditimpa).',
    draftRestored: 'Draf dipulihkan dari sesi sebelumnya',
    discard: 'Buang',
    duplicateDetected: 'Pembaruan duplikat terdeteksi',
    duplicateMessage: 'Pembaruan dengan {pct}% sudah dikirim hari ini. Tetap kirim?',
    submitAnyway: 'Tetap Kirim',
    cancel: 'Batal',
    latestUpdate: 'Pembaruan terakhir',
    errorSaved: 'Terjadi kesalahan. Draf disimpan — coba lagi nanti.',
    backwardError: 'Kemajuan tidak boleh lebih kecil dari nilai saat ini ({pct}%).',
    statusNotStarted: 'Belum Dimulai',
    statusInProgress: 'Sedang Berjalan',
    statusCompleted: 'Selesai',
  },

  // Reports
  report: {
    title: 'Laporan & Analitik',
    subtitle: 'Akses laporan kinerja, pendapatan, dan analitik proyek BUMDes.',
    totalProjects: 'Total Proyek',
    activeProjects: 'Proyek Aktif',
    performance: 'Laporan Kinerja',
    performanceDesc: 'Lacak penyelesaian proyek, kontribusi pekerja, dan tren kemajuan.',
    revenueReport: 'Laporan Pendapatan',
    revenueDesc: 'Pantau catatan pendapatan, penggunaan anggaran, dan tren bulanan.',
    projectAnalytics: 'Analitik Proyek',
    analyticsDesc: 'Detail metrik proyek — tugas pekerja, riwayat kemajuan, dan aktivitas.',
    viewReport: 'Lihat Laporan',
    selectProject: 'Pilih proyek untuk melihat',
  },

  // Notifications
  notification: {
    title: 'Pemberitahuan Terbaru',
    new: 'baru',
    markAsRead: 'Tandai sudah dibaca',
    noNotifications: 'Belum ada pemberitahuan.',
  },

  // Charts
  chart: {
    projectCompletion: 'Penyelesaian Proyek',
    statusDistribution: 'Distribusi Status',
    progressOverTime: 'Kemajuan Sepanjang Waktu',
    projectTimelines: 'Jadwal Proyek',
    recentActivity: 'Aktivitas Terbaru',
  },

  // Common
  common: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Ubah',
    create: 'Buat',
    back: 'Kembali',
    next: 'Selanjutnya',
    confirm: 'Konfirmasi',
    search: 'Cari',
    filter: 'Saring',
    noResults: 'Tidak ada hasil',
    tryAgain: 'Coba Lagi',
    language: 'Bahasa',
  },

  // Date/Time
  date: {
    start: 'Mulai',
    end: 'Selesai',
    assigned: 'Ditugaskan',
  },
} as const;

export default id;

// Use a recursive type that widens literal strings to `string`
// so the English dict can have different values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationDict = DeepStringify<typeof id>;
