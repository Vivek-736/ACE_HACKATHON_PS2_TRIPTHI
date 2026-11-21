import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from "@/lib/maps/haversine";
import type { FoodListing } from "@/db/schema/listings";
import type {
  MatchingWeights,
  MatchDimensionScores,
  ReceiverCandidate,
  VolunteerCandidate,
  RankedMatch,
} from "./types";

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  distance: 0.35,
  urgency: 0.25,
  reliability: 0.20,
  needSuitability: 0.20,
};

/**
 * Evaluates dietary compatibility between a food listing and a receiver's preferences/constraints.
 */
export function checkDietaryCompatibility(
  foodDietType: string,
  foodCategory: string,
  receiverPreferences: string | null
): { compatible: boolean; reason?: string } {
  if (!receiverPreferences || receiverPreferences.trim().length === 0) {
    return { compatible: true };
  }

  const prefs = receiverPreferences.toLowerCase();

  // If receiver specifies strictly vegan only (not vegetarian as an alternative)
  const isStrictlyVegan =
    prefs.includes("strictly vegan") ||
    prefs.includes("vegan only") ||
    (prefs.includes("vegan") && !prefs.includes("vegetarian"));

  if (isStrictlyVegan && foodDietType !== "vegan") {
    return {
      compatible: false,
      reason: `Receiver requires strictly vegan food, but listing is '${foodDietType}'`,
    };
  }

  if (
    prefs.includes("vegetarian") &&
    (foodDietType === "non_vegetarian" || foodDietType === "eggetarian")
  ) {
    return {
      compatible: false,
      reason: `Receiver requires vegetarian food, but listing is '${foodDietType}'`,
    };
  }

  if (prefs.includes("jain") && foodDietType !== "jain") {
    return {
      compatible: false,
      reason: `Receiver specifies Jain dietary requirements, which this listing does not guarantee`,
    };
  }

  if (prefs.includes("halal") && foodDietType === "non_vegetarian") {
    // If receiver requests halal and it's non-veg without halal
    if (!prefs.includes("non-halal")) {
      return {
        compatible: false,
        reason: "Receiver requires Halal-certified meat",
      };
    }
  }

  return { compatible: true };
}

/**
 * Computes normalized dimension scores (0-100) and weighted total score.
 */
export function calculateMatchScores(
  listing: FoodListing,
  receiver: ReceiverCandidate,
  volunteer: VolunteerCandidate | null,
  totalTransitTimeMinutes: number,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchDimensionScores {
  const explanations: string[] = [];

  // 1. Distance Suitability (0 - 100)
  // Donor to receiver distance + volunteer to donor distance (if volunteer present)
  const donorToReceiverDist = receiver.distanceFromDonorKm;
  const volToDonorDist = volunteer ? volunteer.distanceFromDonorKm : 0;
  const totalDistKm = donorToReceiverDist + volToDonorDist;

  // Linear decay: 0 km = 100, 25 km = 0 (4 points per km)
  const distanceSuitability = Math.max(0, Math.min(100, Math.round(100 - totalDistKm * 4)));
  explanations.push(
    `Distance: ~${totalDistKm.toFixed(1)} km total travel (${distanceSuitability}/100)`
  );

  // 2. Urgency Suitability (0 - 100)
  // Food nearing deadline should be rescued first, but must have comfortable transit margin.
  const now = Date.now();
  const deadlineMs = new Date(listing.pickupBy).getTime();
  const minutesRemaining = Math.max(0, (deadlineMs - now) / 60000);

  let urgencySuitability = 50;
  if (minutesRemaining <= 0) {
    urgencySuitability = 0;
    explanations.push("Urgency: Listing expired (0/100)");
  } else if (minutesRemaining < totalTransitTimeMinutes + 15) {
    // Imminently tight, high risk of missing window
    urgencySuitability = 30;
    explanations.push(
      `Urgency: Very tight window (${Math.round(minutesRemaining)}m left, transit needs ${totalTransitTimeMinutes}m) (30/100)`
    );
  } else if (minutesRemaining <= 120) {
    // Ideal urgency window: 1 to 2 hours remaining
    urgencySuitability = 95;
    explanations.push(
      `Urgency: High priority rescue window (${Math.round(minutesRemaining)}m remaining) (95/100)`
    );
  } else if (minutesRemaining <= 240) {
    // 2 to 4 hours remaining
    urgencySuitability = 80;
    explanations.push(
      `Urgency: Moderate urgency (${Math.round(minutesRemaining)}m remaining) (80/100)`
    );
  } else {
    // Long window
    urgencySuitability = 65;
    explanations.push(
      `Urgency: Generous window (${Math.round(minutesRemaining / 60)}h remaining) (65/100)`
    );
  }

  // 3. Reliability (0 - 100)
  // Based on volunteer's verified on-time rate and experience
  let reliability = 80; // Default baseline if no volunteer chosen yet
  if (volunteer) {
    const onTimeScore = volunteer.onTimeRate || 100;
    const experienceBonus = Math.min(10, volunteer.totalDeliveries);
    reliability = Math.min(100, Math.round(onTimeScore * 0.9 + experienceBonus));
    explanations.push(
      `Volunteer Reliability: ${volunteer.onTimeRate}% on-time, ${volunteer.totalDeliveries} rescues completed (${reliability}/100)`
    );
  } else {
    explanations.push("Reliability: Standard baseline pending volunteer assignment (80/100)");
  }

  // 4. Receiver Need Suitability (0 - 100)
  // How well the listing's portions match the receiver's capacity / request
  const listingPortions = listing.remainingPortions;
  const receiverCapacity = receiver.currentCapacity;
  let needSuitability = 70;

  if (receiver.requestedPortions) {
    const diff = Math.abs(receiver.requestedPortions - listingPortions);
    needSuitability = Math.max(40, Math.round(100 - (diff / receiver.requestedPortions) * 40));
    explanations.push(
      `Need Fit: Target ${receiver.requestedPortions} portions matches ${listingPortions} surplus (${needSuitability}/100)`
    );
  } else {
    // Portion to capacity ratio
    const ratio = Math.min(1, listingPortions / Math.max(1, receiverCapacity));
    needSuitability = Math.round(60 + ratio * 35);
    explanations.push(
      `Capacity Fit: ${listingPortions} portions fits capacity of ${receiverCapacity} (${needSuitability}/100)`
    );
  }

  // 5. Small Rescue Credits tie-breaker (max 5 points)
  let creditBonus = 0;
  if (volunteer && volunteer.rescueCredits > 0) {
    creditBonus = Math.min(5, Math.round(volunteer.rescueCredits / 20));
    explanations.push(
      `Rescue Credits Modifier: +${creditBonus} tie-breaker for community commitment`
    );
  }

  // Weighted total score
  const baseScore =
    weights.distance * distanceSuitability +
    weights.urgency * urgencySuitability +
    weights.reliability * reliability +
    weights.needSuitability * needSuitability;

  const totalScore = Math.min(100, Math.round((baseScore + creditBonus) * 10) / 10);

  return {
    distanceSuitability,
    urgencySuitability,
    reliability,
    receiverNeedSuitability: needSuitability,
    creditBonus,
    totalScore,
    explanations,
  };
}

/**
 * Runs the deterministic matching algorithm for a given food listing.
 * Evaluates candidate receivers and volunteers, applies hard constraints,
 * computes multi-dimensional scores, and returns sorted, explainable matches.
 */
export function rankMatchesForListing(
  listing: FoodListing,
  receivers: ReceiverCandidate[],
  volunteers: VolunteerCandidate[],
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): RankedMatch[] {
  const matches: RankedMatch[] = [];

  const listingLat = Number(listing.latitude);
  const listingLng = Number(listing.longitude);
  const now = Date.now();
  const deadlineMs = new Date(listing.pickupBy).getTime();

  for (const receiver of receivers) {
    const disqualificationReasons: string[] = [];

    // Hard Constraint 1: Listing active & not expired
    if (listing.status !== "available") {
      disqualificationReasons.push(`Listing status is '${listing.status}' (not available)`);
    }
    if (deadlineMs <= now) {
      disqualificationReasons.push("Listing has already passed its pickup deadline");
    }

    // Hard Constraint 2: Listing has remaining portions
    if (listing.remainingPortions <= 0) {
      disqualificationReasons.push("Listing has no remaining portions available");
    }

    // Hard Constraint 3: Receiver capacity check
    if (receiver.currentCapacity < Math.min(10, listing.remainingPortions)) {
      disqualificationReasons.push(
        `Receiver available capacity (${receiver.currentCapacity}) is below minimum viable rescue quantity`
      );
    }

    // Hard Constraint 4: Dietary compatibility
    const dietaryCheck = checkDietaryCompatibility(
      listing.dietType,
      listing.foodCategory,
      receiver.acceptedDietaryPreferences
    );
    if (!dietaryCheck.compatible) {
      disqualificationReasons.push(dietaryCheck.reason || "Dietary preferences incompatible");
    }

    // Find the best eligible volunteer for this receiver pair
    let bestVolunteer: VolunteerCandidate | null = null;
    let minTransitMinutes = 999;
    let bestPickupEta = 25;
    let bestDeliveryEta = 25;

    // Filter available volunteers within radius
    const eligibleVolunteers = volunteers.filter((vol) => {
      // Must be available
      if (vol.availabilityStatus !== "available") return false;
      // Must be within their configured radius from the donor
      if (vol.distanceFromDonorKm > vol.preferredRadiusKm) return false;
      return true;
    });

    if (eligibleVolunteers.length > 0) {
      // Sort volunteers by total distance to pick the most efficient one
      eligibleVolunteers.sort((a, b) => a.distanceFromDonorKm - b.distanceFromDonorKm);
      bestVolunteer = eligibleVolunteers[0];

      bestPickupEta = estimateTravelTimeMinutes(
        bestVolunteer.distanceFromDonorKm,
        bestVolunteer.transportMode
      );
      bestDeliveryEta = estimateTravelTimeMinutes(
        receiver.distanceFromDonorKm,
        bestVolunteer.transportMode
      );
      minTransitMinutes = bestPickupEta + bestDeliveryEta;
    } else {
      // Estimate baseline with motorcycle
      bestDeliveryEta = estimateTravelTimeMinutes(receiver.distanceFromDonorKm, "motorcycle");
      minTransitMinutes = 20 + bestDeliveryEta;
    }

    // Hard Constraint 5: Feasibility of transit before deadline
    const totalBufferMinutes = 15; // 15 minutes packaging/handoff buffer
    const timeNeededMs = (minTransitMinutes + totalBufferMinutes) * 60000;
    if (now + timeNeededMs > deadlineMs) {
      disqualificationReasons.push(
        `Insufficient time to complete pickup & delivery before deadline (${minTransitMinutes}m transit needed)`
      );
    }

    const isEligible = disqualificationReasons.length === 0;

    const scores = calculateMatchScores(
      listing,
      receiver,
      bestVolunteer,
      minTransitMinutes,
      weights
    );

    matches.push({
      receiver,
      volunteer: bestVolunteer,
      scores,
      isEligible,
      disqualificationReasons,
      estimatedPickupEtaMinutes: bestPickupEta,
      estimatedDeliveryEtaMinutes: bestDeliveryEta,
      totalEstimatedTransitMinutes: minTransitMinutes,
    });
  }

  // Sort matches: eligible first, then by totalScore descending
  return matches.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.scores.totalScore - a.scores.totalScore;
  });
}
