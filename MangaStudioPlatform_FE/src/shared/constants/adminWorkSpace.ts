export const adminStats = [
  {
    label: "Active Users",
    value: "12,540",
    note: "+8.4% this month",
  },
  {
    label: "Active Series",
    value: "342",
    note: "29 awaiting approval",
  },
  {
    label: "Ongoing Chapters",
    value: "128",
    note: "41 in review",
  },
  {
    label: "AI Processing Jobs",
    value: "58",
    note: "14 high priority",
  },
  {
    label: "Storage Usage",
    value: "2.4 TB",
    note: "74% of quota",
  },
] as const;

export const adminUsers = [
  {
    id: "user01",
    avatar: "AK",
    username: "akira_mori",
    role: "Mangaka",
    status: "Active",
    joined: "Jan 12, 2026",
    activity: "Submitted Dragon Flame Ch. 12",
    warnings: 0,
    email: "akira@mangastudio.dev",
  },
  {
    id: "user02",
    avatar: "NW",
    username: "nami_worker",
    role: "Assistant",
    status: "Active",
    joined: "Feb 03, 2026",
    activity: "Uploaded page assets",
    warnings: 1,
    email: "nami@mangastudio.dev",
  },
  {
    id: "user03",
    avatar: "RS",
    username: "ren_editor",
    role: "Editor",
    status: "Active",
    joined: "Nov 18, 2025",
    activity: "Reviewed Paper Moon",
    warnings: 0,
    email: "ren@mangastudio.dev",
  },
  {
    id: "user04",
    avatar: "YU",
    username: "yu_shadow",
    role: "Mangaka",
    status: "Suspended",
    joined: "Mar 20, 2026",
    activity: "Flagged by moderation",
    warnings: 3,
    email: "yu@mangastudio.dev",
  },
  {
    id: "user05",
    avatar: "HB",
    username: "hana_board",
    role: "Board",
    status: "Active",
    joined: "Sep 04, 2025",
    activity: "Approved Chapter 12",
    warnings: 0,
    email: "hana@mangastudio.dev",
  },
] as const;

export const adminRoles = ["Reader", "Mangaka", "Assistant", "Editor", "Board", "Admin"] as const;

export const permissionMatrix = [
  {
    permission: "Create Series",
    Reader: false,
    Mangaka: true,
    Assistant: false,
    Editor: false,
    Board: false,
    Admin: true,
  },
  {
    permission: "Assign Tasks",
    Reader: false,
    Mangaka: true,
    Assistant: false,
    Editor: false,
    Board: false,
    Admin: true,
  },
  {
    permission: "Upload Assistant Result",
    Reader: false,
    Mangaka: false,
    Assistant: true,
    Editor: false,
    Board: false,
    Admin: true,
  },
  {
    permission: "Review Chapter",
    Reader: false,
    Mangaka: true,
    Assistant: false,
    Editor: true,
    Board: true,
    Admin: true,
  },
  {
    permission: "Publish Decision",
    Reader: false,
    Mangaka: false,
    Assistant: false,
    Editor: false,
    Board: true,
    Admin: true,
  },
  {
    permission: "Manage Users",
    Reader: false,
    Mangaka: false,
    Assistant: false,
    Editor: false,
    Board: false,
    Admin: true,
  },
] as const;

export const monitoredSeries = [
  {
    title: "Dragon Flame",
    author: "Akira Mori",
    status: "Active",
    ranking: "#4",
    reports: 0,
    progress: 82,
    deadlineRisk: "Low",
  },
  {
title: "Shadow King",
    author: "Yu Kisaragi",
    status: "Pending",
    ranking: "#18",
    reports: 4,
    progress: 45,
    deadlineRisk: "High",
  },
  {
    title: "Aurora Blade",
    author: "Aki Kuroda",
    status: "Active",
    ranking: "#12",
    reports: 1,
    progress: 74,
    deadlineRisk: "Medium",
  },
  {
    title: "Paper Moon Diner",
    author: "Mika Tanaka",
    status: "Hiatus",
    ranking: "#31",
    reports: 0,
    progress: 48,
    deadlineRisk: "Low",
  },
  {
    title: "Inkbound Atelier",
    author: "Haru Ito",
    status: "Cancelled",
    ranking: "New",
    reports: 2,
    progress: 22,
    deadlineRisk: "Medium",
  },
] as const;

export const workflowColumns = [
  {
    title: "Todo",
    count: 34,
    items: ["New series checks", "Asset validation", "Contract review"],
  },
  {
    title: "In Progress",
    count: 51,
    items: ["Chapter cleanups", "Assistant edits", "AI panel detection"],
  },
  {
    title: "Review",
    count: 41,
    items: ["Editor queue", "Board approvals", "Revision checks"],
  },
  {
    title: "Published",
    count: 198,
    items: ["Weekly releases", "Archive sync", "Ranking update"],
  },
] as const;

export const workflowHealth = [
  {
    label: "Overdue Tasks",
    value: "17",
    severity: "High",
  },
  {
    label: "Unfinished Chapters",
    value: "128",
    severity: "Medium",
  },
  {
    label: "Assistant Workload",
    value: "76%",
    severity: "Medium",
  },
  {
    label: "Editor Queue",
    value: "41",
    severity: "High",
  },
] as const;

export const systemHealth = [
  {
    label: "Server Status",
    value: "Operational",
    status: "Healthy",
  },
  {
    label: "Upload Queue",
    value: "26 files",
    status: "Busy",
  },
  {
    label: "AI Inference Queue",
    value: "58 jobs",
    status: "Busy",
  },
  {
    label: "Failed Jobs",
    value: "3",
    status: "Attention",
  },
] as const;

export const recentAdminActivities = [
  {
    title: "Mangaka submitted new series",
    meta: "Shadow King entered approval workflow",
    time: "8 min ago",
  },
  {
    title: "Assistant uploaded chapter assets",
    meta: "Dragon Flame Ch. 12 page package",
    time: "18 min ago",
  },
  {
    title: "Editorial Board approved Chapter 12",
    meta: "Ready for publish queue",
    time: "32 min ago",
  },
  {
    title: "AI job failed",
    meta: "Panel detection timeout on upload batch 8841",
    time: "1h ago",
  },
] as const;

export const aiModels = [
  {
    model: "YOLOv8",
    status: "Active",
    accuracy: "91%",
    feature: "Panel Detection",
  },
  {
    model: "U-Net",
    status: "Active",
    accuracy: "88%",
    feature: "Mask Cleanup",
  },
  {
    model: "OCR-JP",
    status: "Limited",
    accuracy: "84%",
    feature: "Dialogue OCR",
  },
] as const;

export const aiJobs = [
  {
    id: "#123",
    type: "Panel Detection",
    status: "Running",
    owner: "Dragon Flame Ch. 12",
  },
  {
    id: "#124",
    type: "Speech Bubble OCR",
status: "Queued",
    owner: "Aurora Blade Ch. 24",
  },
  {
    id: "#125",
    type: "Asset Safety Scan",
    status: "Failed",
    owner: "Shadow King upload batch",
  },
  {
    id: "#126",
    type: "Tone Segmentation",
    status: "Completed",
    owner: "Paper Moon Diner Ch. 09",
  },
] as const;

export const analyticsSeries = [
  { label: "Jan", users: 46, uploads: 38, engagement: 61, ai: 22 },
  { label: "Feb", users: 52, uploads: 44, engagement: 66, ai: 34 },
  { label: "Mar", users: 61, uploads: 58, engagement: 69, ai: 43 },
  { label: "Apr", users: 73, uploads: 64, engagement: 76, ai: 52 },
  { label: "May", users: 82, uploads: 74, engagement: 81, ai: 68 },
] as const;

export const storageItems = [
  {
    name: "dragon-flame-ch12-assets.zip",
    type: "Chapter Assets",
    size: "18.4 GB",
    status: "Active",
  },
  {
    name: "shadow-king-reference-pack.psd",
    type: "Reference",
    size: "9.2 GB",
    status: "Flagged",
  },
  {
    name: "archive-2025-q4.tar",
    type: "Backup",
    size: "612 GB",
    status: "Archived",
  },
  {
    name: "inactive-reader-cache",
    type: "Cache",
    size: "86 GB",
    status: "Cleanup ready",
  },
] as const;

export const moderationReports = [
  {
    id: "R-1008",
    report: "Spam",
    target: "Manga A comment thread",
    status: "Pending",
    severity: "Low",
  },
  {
    id: "R-1012",
    report: "Copyright concern",
    target: "Shadow King cover",
    status: "Investigating",
    severity: "High",
  },
  {
    id: "R-1014",
    report: "Harassment",
    target: "user04",
    status: "Pending",
    severity: "Medium",
  },
  {
    id: "R-1018",
    report: "Unsafe upload",
    target: "Asset batch 8841",
    status: "Resolved",
    severity: "High",
  },
] as const;

export const adminNotifications = [
  {
    title: "Series approval digest",
    channel: "Email",
    status: "Enabled",
  },
  {
    title: "Deadline warning notification",
    channel: "In-app",
    status: "Enabled",
  },
  {
    title: "Publish notification",
    channel: "Email + In-app",
    status: "Enabled",
  },
  {
    title: "AI failure alert",
    channel: "Admin inbox",
    status: "Enabled",
  },
] as const;