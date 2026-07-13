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
    residents: 'Residents',
    myAssignments: 'My Assignments',
    registerResident: 'Register Resident',
    signOut: 'Sign Out',
    signingOut: 'Signing out...',
    collapseSidebar: 'Hide menu',
    expandSidebar: 'Show menu',
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
    utilization: 'Workforce Utilization',
    ofResidents: '{active}/{total} residents',
    delayedProjects: 'Delayed Projects',
    needAttention: 'Need attention',
    understaffed: 'Understaffed',
    portfolioCompletion: 'Portfolio Completion',
    weighted: 'Weighted by workers needed',
  },

  // Projects
  project: {
    title: 'Projects',
    subtitle: 'Manage village projects and workforce assignments',
    searchPlaceholder: 'Search projects by name...',
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
    backToProjects: 'Back to Projects',
    workersNeeded: 'Workers Needed',
    createdBy: 'Created by',
    skillRequirements: 'Skill Requirements',
    noRequirements: 'No skill requirements yet.',
    min: 'Min.',
    assignedWorkers: 'Assigned Workers',
    positionsFilled: '{filled} of {total} positions filled',
    assignWorkerBtn: '+ Assign Workers',
    schedule: 'Schedule',
    noAssignedWorkers: 'No workers assigned yet.',
    noAssignedWorkersDesc: 'Click "+ Assign Workers" to match residents with this project.',
    backToProjectDetail: 'Back to Project Details',
    assignPageTitle: 'Assign Workers',
    projectRequirementSummary: 'Requires {workers} workers · {skills} skills',
    alreadyAssignedTitle: 'Already Assigned ({count})',
    assignedStatus: 'Assigned',
    assignErrorTitle: 'Failed to load assignment page',
    invalidProjectId: 'Invalid project ID',
    sessionNotFound: 'Session not found',
    createProjectDesc: 'Define project details and required skills',
    failedToLoadCreateForm: 'Failed to load project creation form',
    loadingForm: 'Loading form...',
    editProject: 'Edit Project',
    nameLabel: 'Project Name *',
    namePlaceholder: 'e.g. Village irrigation repair',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the scope, goals, and location of the project...',
    startDateLabel: 'Start Date *',
    endDateLabel: 'End Date *',
    budgetLabel: 'Total Budget (IDR) *',
    budgetPlaceholder: 'e.g. 50000000',
    workersNeededLabel: 'Total Workers Needed *',
    requiredSkillsTitle: 'Required Skills',
    skillLabel: 'Skill',
    minProficiencyLabel: 'Min. Proficiency',
    workersCountLabel: 'Workers Needed',
    addSkillBtn: '+ Add Skill Requirement',
    saveChangesBtn: 'Save Changes',
    noRequirementsDesc: 'No skill requirements added yet. Click "+ Add Skill Requirement" to begin.',
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
    workforce: 'Workforce',
    completionAxis: 'Completion (%)',
    avgProgress: 'Average progress',
    completion: 'Completion',
    target: 'Target',
    projectsUnit: 'projects',
    noData: 'No data to display yet.',
    showingTop: 'Showing top {shown} of {total} projects',
    viewAll: 'View all',
    revenueTrend: 'Revenue Trend',
  },

  // Alerts (decision layer)
  alert: {
    title: 'Needs Attention',
    none: 'All projects are on track. No alerts.',
    delayed: 'Delayed: {completion}% done vs {elapsed}% of schedule',
    understaffed: 'Understaffed: {have}/{need} filled',
    stale: 'No update in over {days} days',
    overBudget: 'Revenue at {pct}% of budget',
    view: 'View',
  },

  // Project health (RAG)
  health: {
    on_track: 'On Track',
    at_risk: 'At Risk',
    delayed: 'Delayed',
    completed: 'Completed',
    inactive: 'Not Active',
  },

  // Village-head impact dashboard
  impact: {
    title: 'Impact for the Village',
    subtitle: 'A summary of the BUMDes contribution to the community.',
    residentsEmployed: 'Residents Employed',
    ofTotal: 'of {total} residents',
    incomeGenerated: 'Income Generated',
    participation: 'Participation Rate',
    activeProjects: 'Active Projects',
    completedProjects: 'Completed Projects',
    hoursContributed: 'Total Hours Worked',
  },

  // Timeframe selector
  timeframe: {
    label: 'Range',
    '7d': '7 Days',
    '30d': '30 Days',
    '90d': '90 Days',
    '365d': '1 Year',
    all: 'All',
  },

  // Manager-invite account creation
  invite: {
    title: 'Create Resident Account',
    subtitle: 'Create a login account for a resident, then share the sign-in details.',
    needIdentifier: 'Enter an email or phone number for the resident login.',
    consentRequired: 'The resident must agree to the Terms & Privacy Policy.',
    submit: 'Create Account',
    creating: 'Creating account...',
    accountCreated: 'Account Created',
    relayNote: 'Give these login details to the resident. The password is shown only once.',
    loginEmail: 'Login Email',
    tempPassword: 'Temporary Password',
    copy: 'Copy',
    copied: 'Copied!',
    shareWa: 'Share via WhatsApp',
    createAnother: 'Create Another',
    waGuideMessage:
      'Hello {name}! 👋\n\nYour DesaWorks account has been created. Here is a quick guide to sign in:\n\n1. Open {link}\n2. Enter the email & password below\n3. Change your password after signing in\n\nEmail: {email}\nTemporary password: {password}\n\nPlease keep this message safe. Thank you!',
  },

  // Join requests (public intake → manager approval)
  requests: {
    title: 'Join Requests',
    none: 'No join requests yet.',
    approve: 'Approve',
    reject: 'Reject',
    approving: 'Processing...',
    loading: 'Loading requests...',
  },

  // Consent checkboxes
  consent: {
    tos: 'I agree to the Terms of Service',
    privacy: 'I agree to the Privacy Policy',
    managerTos: 'Resident agrees to the Terms of Service',
    managerPrivacy: 'Resident agrees to the Privacy Policy',
  },

  // Table headers
  table: {
    worker: 'Worker',
    hours: 'Hours',
    tasks: 'Tasks',
    latestProgress: 'Latest Progress',
    status: 'Status',
    project: 'Project',
    completion: 'Completion',
    workers: 'Workers',
    active: 'Active',
    noData: 'No data',
    timeline: 'Timeline',
  },

  // Resident availability self-service
  availability: {
    title: 'Availability',
    available: 'Available',
    unavailable: 'Unavailable',
    saving: 'Saving...',
    desc: 'Set whether you are ready to take on new projects.',
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
    searchPlaceholder: 'Search...',
    filter: 'Filter',
    noResults: 'No results found',
    tryAgain: 'Try Again',
    language: 'Language',
  },

  // Pagination (app-wide "show 10, then next 10")
  pagination: {
    prev: 'Previous',
    next: 'Next',
    showing: 'Showing {from}–{to} of {total}',
    page: 'Page {page}/{totalPages}',
  },

  // Manager: residents directory / management
  residents: {
    title: 'Manage Residents',
    subtitle: 'Search, view, and contact the residents registered in your village.',
    searchPlaceholder: 'Search by name, phone, or email...',
    total: '{count} residents registered',
    empty: 'No residents registered yet.',
    emptyDesc: 'Add a new resident to start assigning work.',
    noResults: 'No residents match your search.',
    addResident: 'Add Resident',
    skillsCount: '{count} skills',
    noSkills: 'No skills yet',
    joined: 'Joined {date}',
    messageWa: 'WhatsApp',
    noContact: 'No contact info',
  },

  // Date/Time
  date: {
    start: 'Start',
    end: 'End',
    assigned: 'Assigned',
  },

  // Proficiency levels
  proficiency: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },

  // Resident Registration Form
  register: {
    successTitle: 'Registration Successful!',
    saveSuccessTitle: 'Data Saved Successfully!',
    publicSuccessDesc: 'Thank you. Your details have been received and will be processed by village staff.',
    managerSuccessDesc: 'Resident profile has been saved to the system.',
    registerAnother: '+ Register Another Resident',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter full name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    phone: 'Phone Number',
    phonePlaceholder: '08xx-xxxx-xxxx',
    address: 'Address',
    addressPlaceholder: 'RT/RW, Hamlet, Village',
    skills: 'Skills',
    skillsDesc: 'Add resident skills (optional)',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    submit: 'Register Resident',
    formError: 'An error occurred. Please try again.',
  },

  // Performance Report Page
  performanceReport: {
    title: 'Performance Report',
    subtitle: 'Overview of project completion, worker contributions, and progress trends across all managed projects.',
    projectPerformance: 'Project Performance',
    projectPerformanceDesc: 'Completion, workers, and status for each project.',
    workerContributions: 'Worker Contributions',
    workerContributionsDesc: 'Aggregated hours, tasks, and progress for all assigned workers.',
    exportPerformance: 'Export Performance',
    exportWorkers: 'Export Workers',
  },

  // Revenue Report Page
  revenueReport: {
    title: 'Revenue Report',
    subtitle: 'Monitor revenue records, budget utilization, and monthly trends across all projects.',
    totalRevenue: 'Total Revenue',
    projectsWithRevenue: 'Projects with Revenue',
    avgBudgetUtilization: 'Avg. Budget Utilization',
    revenueRecords: 'Revenue Records',
    revenueRecordsDesc: 'All recorded revenue entries across projects.',
    exportRevenue: 'Export Revenue',
    noRecords: 'No revenue records yet',
    noRecordsDesc: 'Use the form below to record your first revenue entry.',
    projectHeader: 'Project',
    amountHeader: 'Amount',
    descriptionHeader: 'Description',
    dateHeader: 'Date',
    recordedByHeader: 'Recorded By',
  },
} as const;

export default en;
