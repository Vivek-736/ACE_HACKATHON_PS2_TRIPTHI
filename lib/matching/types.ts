export interface MatchingWeights {
  distance: number;
  urgency: number;
  reliability: number;
  needSuitability: number;
}

export interface MatchDimensionScores {
  distanceSuitability: number; // 0 - 100
  urgencySuitability: number; // 0 - 100
  reliability: number; // 0 - 100
  receiverNeedSuitability: number; // 0 - 100
  creditBonus: number; // 0 - 5 (tie-breaker only)
  totalScore: number; // 0 - 100
  explanations: string[];
}

export interface ReceiverCandidate {
  id: string;
  organisationName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceFromDonorKm: number;
  currentCapacity: number;
  dailyCapacity: number;
  acceptedDietaryPreferences: string | null;
  activeRequestId?: string;
  requestedPortions?: number;
}

export interface VolunteerCandidate {
  id: string;
  displayName: string;
  transportMode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceFromDonorKm: number;
  preferredRadiusKm: number;
  onTimeRate: number;
  totalDeliveries: number;
  rescueCredits: number;
  availabilityStatus: string;
}

export interface RankedMatch {
  receiver: ReceiverCandidate;
  volunteer: VolunteerCandidate | null;
  scores: MatchDimensionScores;
  isEligible: boolean;
  disqualificationReasons: string[];
  estimatedPickupEtaMinutes: number;
  estimatedDeliveryEtaMinutes: number;
  totalEstimatedTransitMinutes: number;
}
