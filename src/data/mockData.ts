export interface BonsaiTree {
  id: string;
  passportId: string;
  treeName: string;
  species: string;
  ownerName: string;
  city: string;
  category: "Sito" | "Mame" | "Shohin" | "Medium" | "Large";
  heightCm: number;
  estimatedAge?: number;
  style?: string;
  photoUrl: string;
  treeNumber: string;
  registrationDate: string;
  status: "registered" | "approved" | "judged";
  scores?: JudgingScore[];
  eventHistory?: EventHistoryEntry[];
}

export interface JudgingScore {
  judgeId: string;
  judgeName: string;
  nebari: number;
  trunk: number;
  branch: number;
  composition: number;
  pot: number;
  total: number;
}

export interface EventHistoryEntry {
  eventName: string;
  year: number;
  result: string;
  rank?: number;
  certificateId?: string;
}

export interface BonsaiEvent {
  id: string;
  eventName: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed" | "draft";
  totalParticipants: number;
  totalBonsai: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  bonsaiId: string;
  ownerName: string;
  treeSpecies: string;
  category: string;
  rank: number;
  eventName: string;
  issueDate: string;
  verified: boolean;
}

export const mockEvents: BonsaiEvent[] = [
  {
    id: "evt-001",
    eventName: "Depok Bonsai Festival 2026",
    location: "Balai Kota Depok",
    startDate: "2026-04-15",
    endDate: "2026-04-17",
    organizer: "PPBI Depok",
    description: "Annual bonsai exhibition and competition featuring the best trees from the Depok region.",
    status: "upcoming",
    totalParticipants: 48,
    totalBonsai: 124,
  },
  {
    id: "evt-002",
    eventName: "West Java Bonsai Championship 2025",
    location: "Gedung Sate, Bandung",
    startDate: "2025-09-20",
    endDate: "2025-09-22",
    organizer: "PPBI Jawa Barat",
    description: "Regional championship bringing together top bonsai artists from West Java.",
    status: "completed",
    totalParticipants: 96,
    totalBonsai: 280,
  },
  {
    id: "evt-003",
    eventName: "Depok Bonsai Show 2025",
    location: "Taman Margonda, Depok",
    startDate: "2025-03-10",
    endDate: "2025-03-12",
    organizer: "PPBI Depok",
    description: "Community bonsai exhibition showcasing local talent.",
    status: "completed",
    totalParticipants: 32,
    totalBonsai: 78,
  },
];

export const mockBonsai: BonsaiTree[] = [
  {
    id: "b-001",
    passportId: "BNS-DPK-00001",
    treeName: "Rajawali Hijau",
    species: "Ficus Retusa",
    ownerName: "Ahmad Wijaya",
    city: "Depok",
    category: "Large",
    heightCm: 65,
    estimatedAge: 35,
    style: "Informal Upright",
    photoUrl: "",
    treeNumber: "DPK-2026-001",
    registrationDate: "2024-01-15",
    status: "judged",
    scores: [
      { judgeId: "j1", judgeName: "Pak Budi", nebari: 18, trunk: 17, branch: 16, composition: 18, pot: 15, total: 84 },
      { judgeId: "j2", judgeName: "Pak Hari", nebari: 17, trunk: 18, branch: 17, composition: 17, pot: 16, total: 85 },
    ],
    eventHistory: [
      { eventName: "Depok Bonsai Show 2024", year: 2024, result: "Participant" },
      { eventName: "West Java Bonsai Festival 2025", year: 2025, result: "2nd Place", rank: 2, certificateId: "CERT-DPK-2025-012" },
      { eventName: "Depok Bonsai Festival 2026", year: 2026, result: "1st Place", rank: 1, certificateId: "CERT-DPK-2026-001" },
    ],
  },
  {
    id: "b-002",
    passportId: "BNS-DPK-00002",
    treeName: "Naga Kecil",
    species: "Juniperus Chinensis",
    ownerName: "Siti Rahmawati",
    city: "Depok",
    category: "Shohin",
    heightCm: 18,
    estimatedAge: 12,
    style: "Cascade",
    photoUrl: "",
    treeNumber: "DPK-2026-002",
    registrationDate: "2024-03-20",
    status: "judged",
    scores: [
      { judgeId: "j1", judgeName: "Pak Budi", nebari: 16, trunk: 15, branch: 18, composition: 17, pot: 16, total: 82 },
    ],
    eventHistory: [
      { eventName: "Depok Bonsai Show 2025", year: 2025, result: "Participant" },
      { eventName: "Depok Bonsai Festival 2026", year: 2026, result: "3rd Place", rank: 3 },
    ],
  },
  {
    id: "b-003",
    passportId: "BNS-DPK-00003",
    treeName: "Sang Penjaga",
    species: "Pemphis Acidula",
    ownerName: "Bambang Sutrisno",
    city: "Bogor",
    category: "Medium",
    heightCm: 38,
    estimatedAge: 28,
    style: "Windswept",
    photoUrl: "",
    treeNumber: "DPK-2026-003",
    registrationDate: "2025-01-10",
    status: "approved",
    eventHistory: [
      { eventName: "Depok Bonsai Festival 2026", year: 2026, result: "Registered" },
    ],
  },
  {
    id: "b-004",
    passportId: "BNS-DPK-00004",
    treeName: "Bintang Senja",
    species: "Bougainvillea Glabra",
    ownerName: "Dewi Lestari",
    city: "Depok",
    category: "Mame",
    heightCm: 13,
    estimatedAge: 8,
    style: "Broom",
    photoUrl: "",
    treeNumber: "DPK-2026-004",
    registrationDate: "2025-06-05",
    status: "registered",
    eventHistory: [],
  },
  {
    id: "b-005",
    passportId: "BNS-DPK-00005",
    treeName: "Permata Kecil",
    species: "Serissa Foetida",
    ownerName: "Rudi Hermawan",
    city: "Depok",
    category: "Sito",
    heightCm: 8,
    estimatedAge: 5,
    style: "Formal Upright",
    photoUrl: "",
    treeNumber: "DPK-2026-005",
    registrationDate: "2025-08-12",
    status: "approved",
    eventHistory: [
      { eventName: "Depok Bonsai Festival 2026", year: 2026, result: "Registered" },
    ],
  },
  {
    id: "b-006",
    passportId: "BNS-DPK-00006",
    treeName: "Garuda Tua",
    species: "Casuarina Equisetifolia",
    ownerName: "Hendra Prasetyo",
    city: "Jakarta",
    category: "Large",
    heightCm: 72,
    estimatedAge: 45,
    style: "Twin Trunk",
    photoUrl: "",
    treeNumber: "DPK-2026-006",
    registrationDate: "2024-11-30",
    status: "judged",
    scores: [
      { judgeId: "j1", judgeName: "Pak Budi", nebari: 19, trunk: 18, branch: 17, composition: 19, pot: 17, total: 90 },
      { judgeId: "j2", judgeName: "Pak Hari", nebari: 18, trunk: 19, branch: 18, composition: 18, pot: 18, total: 91 },
    ],
    eventHistory: [
      { eventName: "Depok Bonsai Show 2024", year: 2024, result: "1st Place", rank: 1 },
      { eventName: "West Java Bonsai Championship 2025", year: 2025, result: "1st Place", rank: 1 },
      { eventName: "Depok Bonsai Festival 2026", year: 2026, result: "1st Place", rank: 1, certificateId: "CERT-DPK-2026-006" },
    ],
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: "c-001",
    certificateNumber: "CERT-DPK-2026-001",
    bonsaiId: "b-001",
    ownerName: "Ahmad Wijaya",
    treeSpecies: "Ficus Retusa",
    category: "Large",
    rank: 1,
    eventName: "Depok Bonsai Festival 2026",
    issueDate: "2026-04-17",
    verified: true,
  },
  {
    id: "c-002",
    certificateNumber: "CERT-DPK-2026-002",
    bonsaiId: "b-002",
    ownerName: "Siti Rahmawati",
    treeSpecies: "Juniperus Chinensis",
    category: "Shohin",
    rank: 3,
    eventName: "Depok Bonsai Festival 2026",
    issueDate: "2026-04-17",
    verified: true,
  },
  {
    id: "c-003",
    certificateNumber: "CERT-DPK-2026-006",
    bonsaiId: "b-006",
    ownerName: "Hendra Prasetyo",
    treeSpecies: "Casuarina Equisetifolia",
    category: "Large",
    rank: 1,
    eventName: "Depok Bonsai Festival 2026",
    issueDate: "2026-04-17",
    verified: true,
  },
];

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "Sito": return "bg-blue-100 text-blue-700";
    case "Mame": return "bg-violet-100 text-violet-700";
    case "Shohin": return "bg-amber-100 text-amber-700";
    case "Medium": return "bg-teal-100 text-teal-700";
    case "Large": return "bg-emerald-100 text-emerald-700";
    default: return "bg-muted text-muted-foreground";
  }
};

export const getRankBadge = (rank?: number) => {
  switch (rank) {
    case 1: return "🥇 Gold";
    case 2: return "🥈 Silver";
    case 3: return "🥉 Bronze";
    default: return null;
  }
};

export const getAverageScore = (scores?: JudgingScore[]) => {
  if (!scores || scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.total, 0) / scores.length);
};
