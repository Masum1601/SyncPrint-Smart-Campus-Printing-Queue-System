export const campusPrinters = [
  {
    name: "Library Commons",
    location: "Central Library, Level 2",
    status: "Available",
    queue: 3,
    wait: "8 min",
    supplies: "Toner 82% - Paper 67%",
    features: ["Color", "Duplex", "A4", "Binding"],
  },
  {
    name: "Engineering Lab",
    location: "Innovation Building, Room 204",
    status: "Busy",
    queue: 12,
    wait: "24 min",
    supplies: "Toner 54% - Paper 41%",
    features: ["B/W", "Duplex", "A3", "Staple"],
  },
  {
    name: "Business Hub",
    location: "School of Business, Ground Floor",
    status: "Available",
    queue: 1,
    wait: "4 min",
    supplies: "Toner 91% - Paper 88%",
    features: ["Color", "Duplex", "A4", "Scan"],
  },
  {
    name: "Student Center",
    location: "Student Union, East Wing",
    status: "Maintenance",
    queue: 0,
    wait: "Paused",
    supplies: "Technician assigned",
    features: ["Color", "A4", "Scan"],
  },
] as const;

export const queueJobs = [
  {
    id: "SP-1042",
    document: "Research_Methodology_Final.pdf",
    owner: "Ayesha R.",
    printer: "Library Commons",
    status: "Printing",
    pages: 28,
    eta: "2 min",
    progress: 78,
  },
  {
    id: "SP-1043",
    document: "CSE_Lab_Report.docx",
    owner: "Tanvir H.",
    printer: "Engineering Lab",
    status: "Queued",
    pages: 14,
    eta: "11 min",
    progress: 32,
  },
  {
    id: "SP-1044",
    document: "Club_Event_Poster.png",
    owner: "Maliha S.",
    printer: "Business Hub",
    status: "Ready",
    pages: 2,
    eta: "Now",
    progress: 100,
  },
] as const;

export const dashboardStats = [
  { label: "Active jobs", value: "27", detail: "Across campus queues" },
  { label: "Avg. wait time", value: "9m", detail: "42% faster today" },
  { label: "Printers online", value: "18/20", detail: "2 need attention" },
  { label: "Pages printed", value: "8.4k", detail: "This week" },
] as const;

export const recentActivity = [
  "Print job SP-1044 is ready for pickup at Business Hub.",
  "Library Commons queue dropped below 10 minutes.",
  "Engineering Lab toner level moved to watch status.",
] as const;
