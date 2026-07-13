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
    residents: 'Warga',
    myAssignments: 'Tugas Saya',
    registerResident: 'Daftar Warga',
    signOut: 'Keluar',
    signingOut: 'Keluar...',
    collapseSidebar: 'Sembunyikan menu',
    expandSidebar: 'Tampilkan menu',
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
    utilization: 'Pemanfaatan Tenaga Kerja',
    ofResidents: '{active}/{total} warga',
    delayedProjects: 'Proyek Terlambat',
    needAttention: 'Perlu perhatian',
    understaffed: 'Kurang Pekerja',
    portfolioCompletion: 'Penyelesaian Portofolio',
    weighted: 'Tertimbang per kebutuhan pekerja',
  },

  // Projects
  project: {
    title: 'Proyek',
    subtitle: 'Kelola proyek desa dan penugasan tenaga kerja',
    searchPlaceholder: 'Cari proyek berdasarkan nama...',
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
    backToProjects: 'Kembali ke Proyek',
    workersNeeded: 'Pekerja Dibutuhkan',
    createdBy: 'Dibuat oleh',
    skillRequirements: 'Kebutuhan Keahlian',
    noRequirements: 'Belum ada kebutuhan keahlian.',
    min: 'Min.',
    assignedWorkers: 'Pekerja Ditugaskan',
    positionsFilled: '{filled} dari {total} posisi terisi',
    assignWorkerBtn: '+ Tugaskan Pekerja',
    schedule: 'Jadwal',
    noAssignedWorkers: 'Belum ada pekerja ditugaskan.',
    noAssignedWorkersDesc: 'Klik "+ Tugaskan Pekerja" untuk mencocokkan warga dengan proyek ini.',
    backToProjectDetail: 'Kembali ke Detail Proyek',
    assignPageTitle: 'Tugaskan Pekerja',
    projectRequirementSummary: 'Membutuhkan {workers} pekerja · {skills} keahlian',
    alreadyAssignedTitle: 'Sudah Ditugaskan ({count})',
    assignedStatus: 'Ditugaskan',
    assignErrorTitle: 'Gagal memuat halaman penugasan',
    invalidProjectId: 'ID proyek tidak valid',
    sessionNotFound: 'Sesi tidak ditemukan',
    createProjectDesc: 'Tentukan detail proyek dan keahlian yang dibutuhkan warga',
    failedToLoadCreateForm: 'Gagal memuat formulir pembuatan proyek',
    loadingForm: 'Memuat formulir...',
    editProject: 'Ubah Proyek',
    nameLabel: 'Nama Proyek *',
    namePlaceholder: 'contoh: Perbaikan irigasi desa',
    descriptionLabel: 'Keterangan',
    descriptionPlaceholder: 'Jelaskan ruang lingkup, tujuan, dan lokasi proyek...',
    startDateLabel: 'Tanggal Mulai *',
    endDateLabel: 'Tanggal Selesai *',
    budgetLabel: 'Total Anggaran (Rupiah) *',
    budgetPlaceholder: 'contoh: 50000000',
    workersNeededLabel: 'Jumlah Pekerja yang Dibutuhkan *',
    requiredSkillsTitle: 'Kebutuhan Keahlian',
    skillLabel: 'Keahlian',
    minProficiencyLabel: 'Keahlian Minimum',
    workersCountLabel: 'Pekerja Dibutuhkan',
    addSkillBtn: '+ Tambah Kebutuhan Keahlian',
    saveChangesBtn: 'Simpan Perubahan',
    noRequirementsDesc: 'Belum ada kebutuhan keahlian yang ditambahkan. Klik "+ Tambah Kebutuhan Keahlian" untuk memulai.',
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
    workforce: 'Tenaga Kerja',
    completionAxis: 'Penyelesaian (%)',
    avgProgress: 'Rata-rata kemajuan',
    completion: 'Penyelesaian',
    target: 'Target',
    projectsUnit: 'proyek',
    noData: 'Belum ada data untuk ditampilkan.',
    showingTop: 'Menampilkan {shown} teratas dari {total} proyek',
    viewAll: 'Lihat semua',
    revenueTrend: 'Tren Pendapatan',
  },

  // Alerts (decision layer)
  alert: {
    title: 'Perlu Perhatian',
    none: 'Semua proyek berjalan baik. Tidak ada peringatan.',
    delayed: 'Terlambat: {completion}% selesai vs {elapsed}% jadwal',
    understaffed: 'Kurang pekerja: {have}/{need} terisi',
    stale: 'Tidak ada pembaruan lebih dari {days} hari',
    overBudget: 'Pendapatan {pct}% dari anggaran',
    view: 'Lihat',
  },

  // Project health (RAG)
  health: {
    on_track: 'Sesuai Jadwal',
    at_risk: 'Berisiko',
    delayed: 'Terlambat',
    completed: 'Selesai',
    inactive: 'Belum Aktif',
  },

  // Village-head impact dashboard
  impact: {
    title: 'Dampak untuk Desa',
    subtitle: 'Ringkasan kontribusi BUMDes bagi masyarakat desa.',
    residentsEmployed: 'Warga Bekerja',
    ofTotal: 'dari {total} warga',
    incomeGenerated: 'Pendapatan Dihasilkan',
    participation: 'Tingkat Partisipasi',
    activeProjects: 'Proyek Aktif',
    completedProjects: 'Proyek Selesai',
    hoursContributed: 'Total Jam Kerja',
  },

  // Timeframe selector
  timeframe: {
    label: 'Rentang',
    '7d': '7 Hari',
    '30d': '30 Hari',
    '90d': '90 Hari',
    '365d': '1 Tahun',
    all: 'Semua',
  },

  // Manager-invite account creation
  invite: {
    title: 'Buat Akun Warga',
    subtitle: 'Buatkan akun login untuk warga, lalu bagikan info masuknya.',
    needIdentifier: 'Isi email atau nomor HP untuk login warga.',
    consentRequired: 'Warga harus menyetujui Ketentuan & Kebijakan Privasi.',
    submit: 'Buat Akun',
    creating: 'Membuat akun...',
    accountCreated: 'Akun Berhasil Dibuat',
    relayNote: 'Berikan info login ini kepada warga. Kata sandi hanya ditampilkan sekali.',
    loginEmail: 'Email Login',
    tempPassword: 'Kata Sandi Sementara',
    copy: 'Salin',
    copied: 'Disalin!',
    shareWa: 'Bagikan via WhatsApp',
    createAnother: 'Buat Akun Lain',
    waGuideMessage:
      'Halo {name}! 👋\n\nAkun DesaWorks Anda sudah dibuat. Berikut panduan singkat untuk masuk:\n\n1. Buka {link}\n2. Masukkan email & kata sandi di bawah ini\n3. Ganti kata sandi Anda setelah berhasil masuk\n\nEmail: {email}\nKata sandi sementara: {password}\n\nSimpan pesan ini baik-baik. Terima kasih!',
  },

  // Join requests (public intake → manager approval)
  requests: {
    title: 'Permintaan Bergabung',
    none: 'Belum ada permintaan bergabung.',
    approve: 'Setujui',
    reject: 'Tolak',
    approving: 'Memproses...',
    loading: 'Memuat permintaan...',
  },

  // Consent checkboxes
  consent: {
    tos: 'Saya menyetujui Ketentuan Layanan',
    privacy: 'Saya menyetujui Kebijakan Privasi',
    managerTos: 'Warga menyetujui Ketentuan Layanan',
    managerPrivacy: 'Warga menyetujui Kebijakan Privasi',
  },

  // Table headers
  table: {
    worker: 'Pekerja',
    hours: 'Jam',
    tasks: 'Tugas',
    latestProgress: 'Kemajuan Terbaru',
    status: 'Status',
    project: 'Proyek',
    completion: 'Penyelesaian',
    workers: 'Pekerja',
    active: 'Aktif',
    noData: 'Belum ada data',
    timeline: 'Jadwal',
  },

  // Resident availability self-service
  availability: {
    title: 'Ketersediaan',
    available: 'Tersedia',
    unavailable: 'Tidak Tersedia',
    saving: 'Menyimpan...',
    desc: 'Atur apakah Anda siap menerima proyek baru.',
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
    searchPlaceholder: 'Cari...',
    filter: 'Saring',
    noResults: 'Tidak ada hasil',
    tryAgain: 'Coba Lagi',
    language: 'Bahasa',
  },

  // Pagination (app-wide "show 10, then next 10")
  pagination: {
    prev: 'Sebelumnya',
    next: 'Berikutnya',
    showing: 'Menampilkan {from}–{to} dari {total}',
    page: 'Hal. {page}/{totalPages}',
  },

  // Manager: residents directory / management
  residents: {
    title: 'Kelola Warga',
    subtitle: 'Cari, lihat, dan hubungi warga yang terdaftar di desa Anda.',
    searchPlaceholder: 'Cari nama, HP, atau email...',
    total: '{count} warga terdaftar',
    empty: 'Belum ada warga terdaftar.',
    emptyDesc: 'Tambahkan warga baru untuk mulai menugaskan pekerjaan.',
    noResults: 'Tidak ada warga yang cocok dengan pencarian Anda.',
    addResident: 'Tambah Warga',
    skillsCount: '{count} keahlian',
    noSkills: 'Belum ada keahlian',
    joined: 'Bergabung {date}',
    messageWa: 'Chat WhatsApp',
    noContact: 'Tidak ada kontak',
    manageTitle: 'Kelola Profil Warga',
    manageSubtitle: 'Sesuaikan kredensial, kontak, dan keahlian warga.',
    newPassword: 'Kata Sandi Baru',
    newPasswordPlaceholder: 'Biarkan kosong jika tidak diubah',
    newPasswordHelp: 'Minimal 6 karakter jika ingin mengganti kata sandi login warga.',
    addressLabel: 'Alamat Tinggal',
    skillsLabel: 'Keahlian & Pengalaman',
    cancel: 'Batal',
    loading: 'Memuat data warga...',
    loadError: 'Gagal memuat profil warga',
    saveError: 'Gagal menyimpan perubahan',
  },

  // Date/Time
  date: {
    start: 'Mulai',
    end: 'Selesai',
    assigned: 'Ditugaskan',
  },

  // Proficiency levels
  proficiency: {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Mahir',
  },

  // Resident Registration Form
  register: {
    successTitle: 'Pendaftaran Berhasil!',
    saveSuccessTitle: 'Data Berhasil Disimpan!',
    publicSuccessDesc: 'Terima kasih. Data Anda telah diterima dan akan diproses oleh petugas desa.',
    managerSuccessDesc: 'Profil warga telah berhasil disimpan ke sistem.',
    registerAnother: '+ Daftarkan Warga Lain',
    fullName: 'Nama Lengkap',
    fullNamePlaceholder: 'Masukkan nama lengkap',
    email: 'Email',
    emailPlaceholder: 'contoh@email.com',
    phone: 'Nomor HP',
    phonePlaceholder: '08xx-xxxx-xxxx',
    address: 'Alamat',
    addressPlaceholder: 'RT/RW, Dusun, Desa',
    skills: 'Keahlian',
    skillsDesc: 'Tambahkan keahlian yang dimiliki warga (opsional)',
    saving: 'Menyimpan...',
    saveChanges: 'Simpan Perubahan',
    submit: 'Daftarkan Warga',
    formError: 'Terjadi kesalahan. Silakan coba lagi.',
  },

  // Performance Report Page
  performanceReport: {
    title: 'Laporan Kinerja',
    subtitle: 'Ikhtisar penyelesaian proyek, kontribusi pekerja, dan tren kemajuan di seluruh proyek desa.',
    projectPerformance: 'Kinerja Proyek',
    projectPerformanceDesc: 'Persentase selesai, jumlah pekerja, dan status untuk setiap proyek.',
    workerContributions: 'Kontribusi Pekerja',
    workerContributionsDesc: 'Total jam kerja, jumlah tugas, dan kemajuan terbaru dari seluruh pekerja yang ditugaskan.',
    exportPerformance: 'Ekspor Kinerja',
    exportWorkers: 'Ekspor Pekerja',
  },

  // Revenue Report Page
  revenueReport: {
    title: 'Laporan Pendapatan',
    subtitle: 'Pantau catatan pendapatan, penggunaan anggaran, dan tren bulanan di seluruh proyek.',
    totalRevenue: 'Total Pendapatan',
    projectsWithRevenue: 'Proyek dengan Pendapatan',
    avgBudgetUtilization: 'Rata-rata Penggunaan Anggaran',
    revenueRecords: 'Catatan Pendapatan',
    revenueRecordsDesc: 'Semua entri pendapatan yang tercatat di seluruh proyek.',
    exportRevenue: 'Ekspor Pendapatan',
    noRecords: 'Belum ada catatan pendapatan',
    noRecordsDesc: 'Gunakan formulir di bawah ini untuk mencatat pendapatan pertama Anda.',
    overBudgetTitle: 'Proyek Melebihi Anggaran',
    moreOverBudget: '+{count} proyek lain melebihi anggaran',
    projectHeader: 'Proyek',
    amountHeader: 'Jumlah',
    descriptionHeader: 'Keterangan',
    dateHeader: 'Tanggal',
    recordedByHeader: 'Dicatat Oleh',
  },

  // Register Resident Page
  registerPage: {
    category: 'Manajemen Warga',
    title: 'Daftar Warga Baru',
    subtitle: 'Tambahkan warga secara manual atau kirimkan tautan pendaftaran melalui WhatsApp.',
    tabManual: 'Isi Manual',
    tabWhatsApp: 'Kirim via WhatsApp',
    tabRequests: 'Permintaan Gabung',
    shareTitle: 'Kirim Tautan Pendaftaran',
    shareSubtitle: 'Warga mengisi sendiri formulir dari HP mereka',
    howItWorks: 'Cara Kerja',
    step1: 'Salin tautan di bawah ini',
    step2: 'Kirim ke warga melalui WhatsApp',
    step3: 'Warga buka tautan dan isi formulir dari HP',
    step4: 'Data langsung masuk ke sistem DesaWorks',
    linkTitle: 'Tautan Pendaftaran',
    copy: 'Salin',
    copied: 'Disalin!',
    shareBtn: 'Bagikan via WhatsApp',
    shareFooter: 'Tautan ini bisa dibuka oleh siapa saja yang menerimanya.',
    guideMessage: 'Halo! Silakan daftarkan diri Anda ke sistem DesaWorks melalui tautan berikut:\n{link}\n\nIsi formulir dengan data lengkap Anda. Terima kasih.',
  },

  // Skill Selector Component
  skillSelector: {
    searchPlaceholder: 'Cari keahlian (mis: pertanian, kayu...)',
    removeAria: 'Hapus keahlian',
    yearsExp: 'Tahun Pengalaman',
    level: 'Tingkat',
    selectLevel: 'Pilih tingkat',
    notesLabel: 'Catatan Keahlian (opsional)',
    notesPlaceholder: 'Misalnya: sertifikasi, proyek sebelumnya...',
    emptySelected: 'Belum ada keahlian dipilih. Cari dan tambahkan di atas.',
  },
} as const;

export default id;


// Use a recursive type that widens literal strings to `string`
// so the English dict can have different values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationDict = DeepStringify<typeof id>;
