const mangaCovers = Array.from({ length: 10 }, (_, index) => ({
  image: `https://picsum.photos/seed/manga-cover-${index + 1}/240/360`,
}));

export const mangakaStats = [
  {
    label: "Active Series",
    value: "4",
    note: "+2 drafting this month",
    tone: "from-emerald-300 to-cyan-300",
  },
  {
    label: "Current Chapters",
    value: "12",
    note: "5 in active production",
    tone: "from-sky-300 to-indigo-300",
  },
  {
    label: "Pending Reviews",
    value: "7",
    note: "3 assistant results ready",
    tone: "from-amber-300 to-rose-300",
  },
  {
    label: "Deadline Alerts",
    value: "3",
    note: "next deadline in 18h",
    tone: "from-rose-300 to-fuchsia-300",
  },
] as const;

export const mangakaSeries = [
  {
    id: "aurora-blade",
    title: "Aurora Blade",
    status: "Serializing",
    genre: "Cyber Fantasy",
    cover: mangaCovers[5].image,
    latestChapter: "Ch. 24 - Glass Harbor",
    ranking: "#12",
    views: "1.8M",
    engagement: "84%",
    progress: 74,
    editor: "Mika Tanaka",
    deadline: "Jun 02",
  },
  {
    id: "paper-moon",
    title: "Paper Moon Diner",
    status: "Drafting",
    genre: "Slice of Life",
    cover: mangaCovers[2].image,
    latestChapter: "Ch. 08 - Night Shift",
    ranking: "#31",
    views: "690K",
    engagement: "76%",
    progress: 48,
    editor: "Ren Sato",
    deadline: "Jun 08",
  },
  {
    id: "starfall",
    title: "Starfall Relay",
    status: "Review",
    genre: "Sports Drama",
    cover: mangaCovers[7].image,
    latestChapter: "Ch. 16 - Last Lap",
    ranking: "#18",
    views: "1.1M",
    engagement: "81%",
    progress: 91,
    editor: "Yui Morita",
    deadline: "May 28",
  },
  {
    id: "inkbound",
    title: "Inkbound Atelier",
    status: "Pre-production",
    genre: "Mystery",
    cover: mangaCovers[9].image,
    latestChapter: "Pilot - Locked Room",
    ranking: "New",
    views: "142K",
    engagement: "69%",
    progress: 22,
    editor: "Haru Ito",
    deadline: "Jun 15",
  },
] as const;

export const chapterPipeline = [
  {
    id: "ch-24",
    series: "Aurora Blade",
    chapter: "Ch. 24",
    title: "Glass Harbor",
    status: "In Progress",
    pages: "18 / 26",
    manuscript: "Storyboard v3",
    progress: 68,
    owner: "Nami",
    due: "May 24",
    tasks: 8,
  },
  {
    id: "ch-16",
    series: "Starfall Relay",
    chapter: "Ch. 16",
    title: "Last Lap",
    status: "Review",
    pages: "31 / 31",
    manuscript: "Clean lineart",
    progress: 92,
    owner: "Kaito",
    due: "May 25",
    tasks: 5,
  },
  {
    id: "ch-09",
    series: "Paper Moon Diner",
    chapter: "Ch. 09",
    title: "Rain Menu",
    status: "Todo",
    pages: "04 / 24",
    manuscript: "Script draft",
    progress: 16,
    owner: "Mio",
    due: "Jun 04",
    tasks: 3,
  },
  {
    id: "pilot",
    series: "Inkbound Atelier",
    chapter: "Pilot",
    title: "Locked Room",
    status: "Completed",
    pages: "45 / 45",
    manuscript: "Publish package",
    progress: 100,
    owner: "Team",
    due: "Ready",
    tasks: 0,
  },
] as const;
export const taskColumns = [
  {
    title: "Todo",
    tone: "border-slate-700 bg-slate-900",
    tasks: [
      {
        title: "Block rough pages 19-26",
        series: "Aurora Blade",
        assistant: "Nami",
        deadline: "May 24",
        priority: "High",
        tag: "Layout",
      },
      {
        title: "Collect cafe background references",
        series: "Paper Moon Diner",
        assistant: "Mio",
        deadline: "May 29",
        priority: "Medium",
        tag: "Reference",
      },
    ],
  },
  {
    title: "In Progress",
    tone: "border-sky-400/30 bg-sky-500/10",
    tasks: [
      {
        title: "Ink racing crowd panels",
        series: "Starfall Relay",
        assistant: "Kaito",
        deadline: "May 25",
        priority: "High",
        tag: "Lineart",
      },
      {
        title: "Tone harbor splash page",
        series: "Aurora Blade",
        assistant: "Sora",
        deadline: "May 26",
        priority: "Medium",
        tag: "Screentone",
      },
    ],
  },
  {
    title: "Review",
    tone: "border-amber-300/30 bg-amber-500/10",
    tasks: [
      {
        title: "Dialogue cleanup pass",
        series: "Starfall Relay",
        assistant: "Riku",
        deadline: "Today",
        priority: "High",
        tag: "Script",
      },
    ],
  },
  {
    title: "Completed",
    tone: "border-emerald-300/30 bg-emerald-500/10",
    tasks: [
      {
        title: "Export pilot chapter bundle",
        series: "Inkbound Atelier",
        assistant: "Team",
        deadline: "Done",
        priority: "Low",
        tag: "Publish",
      },
    ],
  },
] as const;

export const assistants = [
  {
    name: "Nami Watanabe",
    role: "Layout Assistant",
    workload: 82,
    current: "Aurora Blade Ch. 24",
    rating: "98%",
    skills: ["Layouts", "Perspective", "Action"],
  },
  {
    name: "Kaito Fuji",
    role: "Line Art Assistant",
    workload: 76,
    current: "Starfall Relay Ch. 16",
    rating: "95%",
    skills: ["Lineart", "Crowds", "Speed FX"],
  },
  {
    name: "Mio Hase",
    role: "Background Artist",
    workload: 44,
    current: "Paper Moon Diner Ch. 09",
    rating: "92%",
    skills: ["Backgrounds", "Props", "Mood"],
  },
  {
    name: "Sora Akiyama",
    role: "Tone Specialist",
    workload: 58,
    current: "Aurora Blade Ch. 24",
    rating: "96%",
    skills: ["Screentone", "Lighting", "Final polish"],
  },
] as const;

export const reviewResults = [
  {
    chapter: "Starfall Relay Ch. 16",
    assistant: "Riku",
    result: "Dialogue pass completed",
    status: "Needs approval",
    annotations: 12,
    confidence: "94%",
    notes:
      "Panel 08 has a stronger emotional beat now. Panel 14 still needs a shorter balloon.",
  },
  {
    chapter: "Aurora Blade Ch. 24",
    assistant: "Sora",
    result: "Tone pass v2 uploaded",
    status: "Revision requested",
    annotations: 8,
    confidence: "88%",
    notes:
"Harbor lighting is improved, but page 21 needs clearer silhouette contrast.",
  },
  {
    chapter: "Inkbound Atelier Pilot",
    assistant: "Team",
    result: "Publish bundle checked",
    status: "Approved",
    annotations: 3,
    confidence: "99%",
    notes:
      "Final export, cover crop, and metadata are ready for publishing submission.",
  },
] as const;

export const analyticsTimeline = [
  { label: "Mon", ranking: 34, views: 46, engagement: 68 },
  { label: "Tue", ranking: 44, views: 52, engagement: 72 },
  { label: "Wed", ranking: 58, views: 61, engagement: 75 },
  { label: "Thu", ranking: 63, views: 68, engagement: 78 },
  { label: "Fri", ranking: 76, views: 82, engagement: 84 },
  { label: "Sat", ranking: 72, views: 78, engagement: 81 },
  { label: "Sun", ranking: 88, views: 91, engagement: 86 },
] as const;

export const notifications = [
  {
    title: "Riku submitted dialogue cleanup",
    meta: "Starfall Relay Ch. 16",
    time: "10 min ago",
    type: "Review",
  },
  {
    title: "Deadline alert: Aurora Blade Ch. 24",
    meta: "18 hours remaining",
    time: "42 min ago",
    type: "Deadline",
  },
  {
    title: "Mio accepted background assignment",
    meta: "Paper Moon Diner Ch. 09",
    time: "2h ago",
    type: "Task",
  },
  {
    title: "Inkbound Atelier pilot is ready to submit",
    meta: "Publish package complete",
    time: "Yesterday",
    type: "Publish",
  },
] as const;
