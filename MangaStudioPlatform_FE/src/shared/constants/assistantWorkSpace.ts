function makeMangaPage(page: string, title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1300" role="img" aria-label="${title} page ${page}">
      <rect width="900" height="1300" fill="#f8fafc" />
      <rect x="44" y="44" width="812" height="1212" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="8" />
      <rect x="86" y="92" width="340" height="310" fill="#e2e8f0" stroke="#0f172a" stroke-width="6" />
      <rect x="474" y="92" width="340" height="310" fill="#f1f5f9" stroke="#0f172a" stroke-width="6" />
      <rect x="86" y="448" width="728" height="250" fill="#e5e7eb" stroke="#0f172a" stroke-width="6" />
      <rect x="86" y="744" width="340" height="420" fill="#f8fafc" stroke="#0f172a" stroke-width="6" />
      <rect x="474" y="744" width="340" height="420" fill="#e2e8f0" stroke="#0f172a" stroke-width="6" />
      <path d="M140 350 C210 270, 290 270, 360 350" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" />
      <path d="M520 360 L780 130 M560 390 L800 210 M610 394 L814 304" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity="0.55" />
      <path d="M170 620 C290 500, 430 500, 550 620" fill="none" stroke="#0f172a" stroke-width="10" stroke-linecap="round" />
      <circle cx="602" cy="548" r="64" fill="#ffffff" stroke="#0f172a" stroke-width="6" />
      <path d="M590 608 L548 660 L628 622" fill="#ffffff" stroke="#0f172a" stroke-width="5" />
      <rect x="132" y="802" width="246" height="52" rx="26" fill="#ffffff" stroke="#0f172a" stroke-width="5" />
      <rect x="134" y="890" width="220" height="34" rx="17" fill="#cbd5e1" opacity="0.9" />
      <rect x="134" y="948" width="190" height="34" rx="17" fill="#cbd5e1" opacity="0.9" />
      <path d="M536 1080 C620 930, 700 930, 780 1080" fill="none" stroke="#0f172a" stroke-width="11" stroke-linecap="round" />
      <path d="M560 832 L780 1030 M780 832 L560 1030" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <text x="86" y="1230" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${title}</text>
      <text x="730" y="1230" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">p.${page}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const assistantStats = [
  {
    label: "Assigned Tasks",
    value: "12 Tasks",
    note: "4 due this week",
  },
  {
    label: "In Progress",
    value: "5 Active",
    note: "2 pages uploading",
  },
  {
    label: "Pending Review",
    value: "3 Waiting",
    note: "Mangaka feedback soon",
  },
  {
    label: "Deadline Alerts",
    value: "2 Urgent",
    note: "next deadline today",
  },
] as const;

export const assistantTasks = [
  {
    id: "background-shading",
    title: "Background Shading",
    series: "Dragon Flame",
    chapter: "Chapter 12",
    page: "Page 14",
assignedBy: "Aki Kuroda",
    deadline: "May 25",
    priority: "High",
    status: "In Progress",
    progress: 62,
    instruction:
      "Add night market shading, keep the speech bubble area clean, and preserve the foreground silhouettes.",
    region: "Panels 2-4, right side background",
    image: makeMangaPage("14", "Dragon Flame", "#2563eb"),
  },
  {
    id: "lineart-cleanup",
    title: "Lineart Cleanup",
    series: "Aurora Blade",
    chapter: "Chapter 24",
    page: "Pages 19-21",
    assignedBy: "Aki Kuroda",
    deadline: "May 26",
    priority: "High",
    status: "Todo",
    progress: 8,
    instruction:
      "Clean action silhouettes and reinforce sword trail lines. Do not redraw character faces.",
    region: "Pages 19-21, action panels",
    image: makeMangaPage("19", "Aurora Blade", "#0891b2"),
  },
  {
    id: "tone-pass",
    title: "Tone Pass",
    series: "Paper Moon Diner",
    chapter: "Chapter 09",
    page: "Pages 04-08",
    assignedBy: "Ren Sato",
    deadline: "May 29",
    priority: "Medium",
    status: "Review",
    progress: 100,
    instruction:
      "Apply gentle screentone for evening cafe mood and export a flattened preview.",
    region: "Interior background panels",
    image: makeMangaPage("06", "Paper Moon", "#d97706"),
  },
  {
    id: "speed-effects",
    title: "Speed Effects",
    series: "Starfall Relay",
    chapter: "Chapter 16",
    page: "Page 28",
    assignedBy: "Yui Morita",
    deadline: "Jun 01",
    priority: "Medium",
    status: "In Progress",
    progress: 48,
    instruction:
      "Add speed lines behind the final sprint and leave space for the sound effect layer.",
    region: "Panel 5 background",
    image: makeMangaPage("28", "Starfall Relay", "#16a34a"),
  },
  {
    id: "bubble-adjust",
    title: "Fix Bubble Position",
    series: "Inkbound Atelier",
    chapter: "Pilot",
    page: "Page 07",
    assignedBy: "Haru Ito",
    deadline: "Today",
    priority: "High",
    status: "Todo",
    progress: 0,
    instruction:
      "Move the dialogue bubble away from the character eye line and keep tail direction readable.",
    region: "Panel 1 speech bubble",
    image: makeMangaPage("07", "Inkbound Atelier", "#7c3aed"),
  },
  {
    id: "export-clean",
    title: "Export Clean Preview",
    series: "Dragon Flame",
    chapter: "Chapter 11",
    page: "Pages 01-05",
    assignedBy: "Aki Kuroda",
    deadline: "Done",
    priority: "Low",
    status: "Completed",
    progress: 100,
    instruction:
      "Final preview exported and approved.",
    region: "Full page batch",
    image: makeMangaPage("03", "Dragon Flame", "#0f766e"),
  },
] as const;

export const assistantTaskColumns = [
  {
    title: "Todo",
    tasks: assistantTasks.filter((task) => task.status === "Todo"),
  },
  {
    title: "In Progress",
    tasks: assistantTasks.filter((task) => task.status === "In Progress"),
  },
  {
    title: "Review",
    tasks: assistantTasks.filter((task) => task.status === "Review"),
},
  {
    title: "Completed",
    tasks: assistantTasks.filter((task) => task.status === "Completed"),
  },
] as const;

export const assignedChapters = [
  {
    chapter: "Chapter 12",
    series: "Dragon Flame",
    progress: 70,
    pages: "14 / 20",
    deadline: "May 25",
    status: "Active",
  },
  {
    chapter: "Chapter 24",
    series: "Aurora Blade",
    progress: 42,
    pages: "19-21",
    deadline: "May 26",
    status: "Active",
  },
  {
    chapter: "Chapter 13",
    series: "Dragon Flame",
    progress: 20,
    pages: "03-06",
    deadline: "Jun 01",
    status: "Queued",
  },
  {
    chapter: "Pilot",
    series: "Inkbound Atelier",
    progress: 88,
    pages: "07",
    deadline: "Today",
    status: "Revision",
  },
] as const;

export const assistantSubmissions = [
  {
    title: "Tone Pass",
    series: "Paper Moon Diner",
    file: "paper-moon-ch09-tone-v2.zip",
    status: "Waiting review",
    submittedAt: "Today 09:20",
  },
  {
    title: "Export Clean Preview",
    series: "Dragon Flame",
    file: "dragon-flame-ch11-preview.zip",
    status: "Approved",
    submittedAt: "Yesterday",
  },
  {
    title: "Speed Effects",
    series: "Starfall Relay",
    file: "starfall-ch16-page28.psd",
    status: "Draft",
    submittedAt: "Not submitted",
  },
] as const;

export const assistantNotifications = [
  {
    title: "New task assigned: Fix Bubble Position",
    meta: "Inkbound Atelier Pilot, Page 07",
    type: "New task",
    time: "8 min ago",
  },
  {
    title: "Mangaka requested revisions on Page 14",
    meta: "Dragon Flame Chapter 12",
    type: "Revision",
    time: "34 min ago",
  },
  {
    title: "Deadline alert: Background Shading",
    meta: "Due May 25",
    type: "Deadline",
    time: "2h ago",
  },
  {
    title: "Tone Pass was approved",
    meta: "Paper Moon Diner Chapter 09",
    type: "Approval",
    time: "Yesterday",
  },
] as const;

export const incomeHistory = [
  {
    period: "May 2026",
    completedTasks: 18,
    income: "$1,420",
    status: "Processing",
  },
  {
    period: "Apr 2026",
    completedTasks: 22,
    income: "$1,760",
    status: "Paid",
  },
  {
    period: "Mar 2026",
    completedTasks: 16,
    income: "$1,180",
    status: "Paid",
  },
] as const;

export const assistantPerformance = [
  { label: "Jan", completed: 42, quality: 76 },
  { label: "Feb", completed: 54, quality: 81 },
  { label: "Mar", completed: 48, quality: 84 },
  { label: "Apr", completed: 68, quality: 88 },
  { label: "May", completed: 58, quality: 91 },
] as const;

export const assistantProfile = {
  name: "Nami Watanabe",
  role: "Production Assistant",
  email: "nami@mangastudio.dev",
  specialization: "Background shading and layout cleanup",
  skills: ["Shading", "Background", "Lineart", "Effects"],
  rating: "96%",
  completedTasks: "138",
} as const;

export const assistantComments = [
  {
    author: "Aki Kuroda",
    text: "Fix bubble position before submitting the final page.",
    time: "10:42",
},
  {
    author: "Aki Kuroda",
    text: "Improve shading behind the foreground silhouette.",
    time: "11:05",
  },
  {
    author: "Nami Watanabe",
    text: "Uploading a corrected PSD with the bubble layer separated.",
    time: "11:18",
  },
] as const;
