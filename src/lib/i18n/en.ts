// DesaWorks — English Translation Dictionary
import type { TranslationDict } from './id';

const en: TranslationDict = {
  // App
  appName: 'DesaWorks',
  appTagline: 'Community Resource Management System',
  appDescription: 'Village workforce and project management platform for BUMDes',

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    reports: 'Reports',
    myAssignments: 'My Assignments',
    registerResident: 'Register Resident',
    signOut: 'Sign Out',
    signingOut: 'Signing out...',
  },

  // Roles
  roles: {
    resident: 'Resident',
    manager: 'Manager',
    admin: 'Admin',
  },

  // Login
  login: {
    title: 'Sign in to DesaWorks',
    subtitle: 'Community Resource Management System',
    email: 'Email Address',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '••••••••',
    signIn: 'Sign In',
    signingIn: 'Signing in…',
    authFailed: 'Authentication failed',
    testCredentials: 'Test Account Credentials',
    managerRole: 'Manager Role',
    residentRole: 'Resident Role',
  },

  // Dashboard - Common
  dashboard: {
    managerTitle: 'Manager Dashboard',
    managerSubtitle: 'Monitor projects, track worker progress, and review activity across your village enterprise.',
    residentPortal: 'Resident Portal',
    welcomeBack: 'Welcome back, {name}!',
    residentSubtitle: 'Review your community project assignments, update your work progress, and stay updated with village enterprise notifications.',
  },

  // Stats
  stats: {
    totalProjects: 'Total Projects',
    allRegistered: 'All registered projects',
    activeWorkers: 'Active Workers',
    currentlyAssigned: 'Currently assigned workers',
    avgCompletion: 'Avg. Completion',
    avgAcrossProjects: 'Average across all projects',
    recentUpdates: 'Recent Updates',
    latestReports: 'Latest progress reports',
    activeAssignments: 'Active Assignments',
    projects: 'projects',
    completedProjects: 'Completed Projects',
    successfullyFinalized: 'Successfully finalized',
    totalHoursLogged: 'Total Hours Logged',
    hours: 'hours',
    accumulatedHours: 'Accumulated across all tasks',
    onTrack: 'On track',
    progressing: 'Progressing',
    earlyStage: 'Early stage',
    noData: 'No data',
    assigned: 'Assigned',
    new: 'New',
    none: 'None',
    active: '{count} active',
  },

  // Projects
  project: {
    title: 'Projects',
    subtitle: 'Manage village projects and workforce assignments',
    createProject: 'Create Project',
    noProjects: 'No projects yet',
    noProjectsDesc: 'Create your first village project to start assigning workers.',
    loadingProjects: 'Loading projects...',
    failedToLoad: 'Failed to load projects',
    workers: 'workers',
    done: 'done',
    viewAll: 'View All',
    budget: 'Budget',
    revenue: 'Revenue',
    startDate: 'Start Date',
    endDate: 'End Date',
    notSet: 'Not set',
  },

  // Status labels
  status: {
    draft: 'Draft',
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    confirmed: 'Confirmed',
    active: 'Active',
    void: 'Void',
    not_started: 'Not Started',
  },

  // Assignments
  assignment: {
    title: 'My Assignments',
    subtitle: 'Track your project assignments and submit progress updates.',
    total: 'Total',
    active: 'Active',
    completed: 'Completed',
    pending: 'Pending',
    noAssignments: 'No assignments yet',
    noAssignmentsDesc: 'You haven\'t been assigned to any projects. Check back later or contact your manager.',
    activeAssignments: 'Active Assignments',
    viewAll: 'View All',
    noActiveProjects: 'No active projects',
    noActiveProjectsDesc: 'You are not currently assigned to any active projects.',
    logWork: 'Log Work',
    totalLogged: 'Total logged:',
    hrs: 'hrs',
    reportedProgress: 'Reported Progress',
  },

  // Progress
  progress: {
    title: 'Progress',
    submitUpdate: 'Submit Progress Update',
    hideForm: 'Hide Update Form',
    progressPercent: 'Progress (%)',
    currentProgress: 'Current progress:',
    status: 'Status',
    hoursWorked: 'Hours Worked',
    hoursPlaceholder: 'e.g. 2.5',
    description: 'Description',
    descriptionRequired: 'Description *',
    descriptionPlaceholder: 'Describe what you worked on...',
    submit: 'Submit Update',
    submitting: 'Submitting...',
    savedSuccess: 'Progress update saved successfully!',
    savedDuplicate: 'Progress update saved (duplicate override).',
    draftRestored: 'Draft restored from previous session',
    discard: 'Discard',
    duplicateDetected: 'Duplicate update detected',
    duplicateMessage: 'A progress update with {pct}% was already submitted today. Submit anyway?',
    submitAnyway: 'Submit Anyway',
    cancel: 'Cancel',
    latestUpdate: 'Latest update',
    errorSaved: 'An unexpected error occurred. Your draft has been saved — try again later.',
    backwardError: 'Progress cannot go below current value ({pct}%).',
    statusNotStarted: 'Not Started',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
  },

  // Reports
  report: {
    title: 'Reports & Analytics',
    subtitle: 'Access performance, revenue, and project analytics reports to monitor BUMDes operations.',
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    performance: 'Performance Report',
    performanceDesc: 'Track project completion, worker contributions, and progress trends across all projects.',
    revenueReport: 'Revenue Report',
    revenueDesc: 'Monitor revenue records, budget utilization, and monthly trends. Record new revenue entries.',
    projectAnalytics: 'Project Analytics',
    analyticsDesc: 'Dive into individual project metrics — worker assignments, progress history, and activity feed.',
    viewReport: 'View Report',
    selectProject: 'Select a project to view',
  },

  // Notifications
  notification: {
    title: 'Recent Notifications',
    new: 'new',
    markAsRead: 'Mark as read',
    noNotifications: 'No notifications yet.',
  },

  // Charts
  chart: {
    projectCompletion: 'Project Completion',
    statusDistribution: 'Status Distribution',
    progressOverTime: 'Progress Over Time',
    projectTimelines: 'Project Timelines',
    recentActivity: 'Recent Activity',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    tryAgain: 'Try Again',
    language: 'Language',
  },

  // Date/Time
  date: {
    start: 'Start',
    end: 'End',
    assigned: 'Assigned',
  },
} as const;

export default en;
