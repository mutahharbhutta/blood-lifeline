// Lahore Areas with GPS coordinates
export interface LahoreArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const lahoreAreas: LahoreArea[] = [
  { id: 'gulberg', name: 'Gulberg', lat: 31.5204, lng: 74.3587 },
  { id: 'dha', name: 'DHA', lat: 31.4697, lng: 74.4039 },
  { id: 'johar_town', name: 'Johar Town', lat: 31.4697, lng: 74.2728 },
  { id: 'model_town', name: 'Model Town', lat: 31.4834, lng: 74.3155 },
  { id: 'allama_iqbal_town', name: 'Allama Iqbal Town', lat: 31.4947, lng: 74.2603 },
  { id: 'garden_town', name: 'Garden Town', lat: 31.5124, lng: 74.3295 },
  { id: 'cantt', name: 'Cantt', lat: 31.5497, lng: 74.3436 },
  { id: 'township', name: 'Township', lat: 31.4503, lng: 74.2833 },
  { id: 'wapda_town', name: 'Wapda Town', lat: 31.4587, lng: 74.2528 },
  { id: 'bahria_town', name: 'Bahria Town', lat: 31.3677, lng: 74.1805 },
  { id: 'iqbal_town', name: 'Iqbal Town', lat: 31.5012, lng: 74.2456 },
  { id: 'sabzazar', name: 'Sabzazar', lat: 31.4789, lng: 74.2678 },
  { id: 'faisal_town', name: 'Faisal Town', lat: 31.4556, lng: 74.3012 },
  { id: 'cavalry_ground', name: 'Cavalry Ground', lat: 31.5123, lng: 74.3678 },
  { id: 'defence_raya', name: 'Defence Raya', lat: 31.4234, lng: 74.4123 },
  { id: 'valencia', name: 'Valencia Town', lat: 31.4012, lng: 74.2234 },
  { id: 'paragon_city', name: 'Paragon City', lat: 31.3856, lng: 74.1567 },
  { id: 'lake_city', name: 'Lake City', lat: 31.3523, lng: 74.1234 },
  { id: 'mall_road', name: 'Mall Road', lat: 31.5567, lng: 74.3234 },
  { id: 'old_lahore', name: 'Old Lahore (Walled City)', lat: 31.5823, lng: 74.3156 },
  { id: 'shadman', name: 'Shadman', lat: 31.5345, lng: 74.3456 },
  { id: 'liberty', name: 'Liberty Market Area', lat: 31.5123, lng: 74.3412 },
  { id: 'peco_road', name: 'PECO Road', lat: 31.4534, lng: 74.2456 },
  { id: 'raiwind', name: 'Raiwind', lat: 31.2567, lng: 74.2123 },
];

// Road network graph (distances in km)
export const roadNetwork: Record<string, Record<string, number>> = {
  gulberg: { model_town: 4, garden_town: 3, cantt: 5, dha: 7, liberty: 2, shadman: 3, cavalry_ground: 4 },
  model_town: { gulberg: 4, township: 6, allama_iqbal_town: 5, johar_town: 7, faisal_town: 5 },
  dha: { johar_town: 8, cantt: 9, bahria_town: 12, gulberg: 7, defence_raya: 5, valencia: 10 },
  johar_town: { model_town: 7, wapda_town: 4, dha: 8, allama_iqbal_town: 6, faisal_town: 4 },
  allama_iqbal_town: { model_town: 5, township: 4, johar_town: 6, sabzazar: 3, iqbal_town: 4 },
  garden_town: { gulberg: 3, model_town: 5, cantt: 4, liberty: 2 },
  cantt: { gulberg: 5, garden_town: 4, dha: 9, mall_road: 3, shadman: 4 },
  township: { model_town: 6, allama_iqbal_town: 4, wapda_town: 5, peco_road: 4 },
  wapda_town: { johar_town: 4, township: 5, bahria_town: 15, valencia: 8 },
  bahria_town: { dha: 12, wapda_town: 15, paragon_city: 6, lake_city: 8, raiwind: 10 },
  iqbal_town: { allama_iqbal_town: 4, sabzazar: 3, peco_road: 5 },
  sabzazar: { allama_iqbal_town: 3, iqbal_town: 3, township: 5 },
  faisal_town: { model_town: 5, johar_town: 4, valencia: 7 },
  cavalry_ground: { gulberg: 4, cantt: 5, shadman: 3 },
  defence_raya: { dha: 5, valencia: 8 },
  valencia: { wapda_town: 8, defence_raya: 8, faisal_town: 7, paragon_city: 10 },
  paragon_city: { bahria_town: 6, lake_city: 5, valencia: 10 },
  lake_city: { bahria_town: 8, paragon_city: 5, raiwind: 8 },
  mall_road: { cantt: 3, old_lahore: 4, shadman: 3 },
  old_lahore: { mall_road: 4, shadman: 5 },
  shadman: { gulberg: 3, cantt: 4, cavalry_ground: 3, mall_road: 3, liberty: 2 },
  liberty: { gulberg: 2, garden_town: 2, shadman: 2 },
  peco_road: { township: 4, iqbal_town: 5, raiwind: 12 },
  raiwind: { bahria_town: 10, lake_city: 8, peco_road: 12 },
};

// Blood types and compatibility
export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = typeof bloodTypes[number];

export const bloodCompatibility: Record<BloodType, BloodType[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

// Donor interface
export interface Donor {
  id: string;
  name: string;
  email?: string;
  bloodType: BloodType;
  area: string;
  phone: string;
  isAvailable: boolean;
  lastDonation?: Date;
}

// Blood bank inventory
export interface BloodBankInventory {
  bloodType: BloodType;
  units: number;
  reserved: number; // For O- preservation
}

export const initialBloodBank: BloodBankInventory[] = [
  { bloodType: 'A+', units: 15, reserved: 0 },
  { bloodType: 'A-', units: 8, reserved: 0 },
  { bloodType: 'B+', units: 12, reserved: 0 },
  { bloodType: 'B-', units: 6, reserved: 0 },
  { bloodType: 'AB+', units: 10, reserved: 0 },
  { bloodType: 'AB-', units: 4, reserved: 0 },
  { bloodType: 'O+', units: 20, reserved: 0 },
  { bloodType: 'O-', units: 5, reserved: 3 }, // O- reserved for extreme emergencies
];

// Relation types for blood request
export const relationTypes = ['Self', 'Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Friend', 'Other'] as const;
export type RelationType = typeof relationTypes[number];

// Blood request interface
export interface BloodRequest {
  id: string;
  patientName: string;
  bloodType: BloodType;
  units: number;
  hospital: string;
  hospitalArea: string;
  priority: 'Emergency' | 'Urgent' | 'Scheduled';
  status: 'Pending' | 'Matched' | 'Fulfilled' | 'Cancelled';
  source?: 'Blood Bank' | 'Donor';
  matchedDonor?: Donor;
  route?: string[];
  distance?: number;
  createdAt: Date;
  // New fields
  requesterName: string;
  requesterPhone: string;
  relationWithPatient: RelationType;
}

// Initial donors
export const initialDonors: Donor[] = [
  { id: '1', name: 'Ahmed Khan', bloodType: 'A+', area: 'gulberg', phone: '0300-1234567', isAvailable: true },
  { id: '2', name: 'Sara Ali', bloodType: 'O-', area: 'dha', phone: '0301-2345678', isAvailable: true },
  { id: '3', name: 'Usman Malik', bloodType: 'B+', area: 'model_town', phone: '0302-3456789', isAvailable: true },
  { id: '4', name: 'Fatima Hassan', bloodType: 'AB+', area: 'johar_town', phone: '0303-4567890', isAvailable: false },
  { id: '5', name: 'Bilal Ahmed', bloodType: 'A-', area: 'garden_town', phone: '0304-5678901', isAvailable: true },
  { id: '6', name: 'Ayesha Tariq', bloodType: 'O+', area: 'cantt', phone: '0305-6789012', isAvailable: true },
  { id: '7', name: 'Hassan Raza', bloodType: 'B-', area: 'township', phone: '0306-7890123', isAvailable: true },
  { id: '8', name: 'Zara Sheikh', bloodType: 'AB-', area: 'bahria_town', phone: '0307-8901234', isAvailable: false },
  { id: '9', name: 'Ali Hussain', bloodType: 'O-', area: 'allama_iqbal_town', phone: '0308-9012345', isAvailable: true },
  { id: '10', name: 'Maryam Nawaz', bloodType: 'A+', area: 'wapda_town', phone: '0309-0123456', isAvailable: true },
];

// Dijkstra's Algorithm Implementation
export function dijkstra(start: string, end: string): { path: string[]; distance: number } {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const pq: [number, string][] = [];

  // Initialize distances
  for (const area of lahoreAreas) {
    distances[area.id] = Infinity;
    previous[area.id] = null;
  }
  distances[start] = 0;
  pq.push([0, start]);

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [currentDist, current] = pq.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) break;

    const neighbors = roadNetwork[current] || {};
    for (const [neighbor, weight] of Object.entries(neighbors)) {
      if (visited.has(neighbor)) continue;
      
      const newDist = currentDist + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = current;
        pq.push([newDist, neighbor]);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path: path.length > 1 ? path : [],
    distance: distances[end] === Infinity ? -1 : distances[end],
  };
}

// Get area name from ID
export function getAreaName(areaId: string): string {
  return lahoreAreas.find(a => a.id === areaId)?.name || areaId;
}

// Get area by ID
export function getArea(areaId: string): LahoreArea | undefined {
  return lahoreAreas.find(a => a.id === areaId);
}
