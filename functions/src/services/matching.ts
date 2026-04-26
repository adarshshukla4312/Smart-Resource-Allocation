/**
 * Volunteer Matching Engine — PRD §7
 * MatchScore = 0.40×Proximity + 0.25×Interest + 0.20×Availability + 0.15×Skill
 */

interface MatchResult {
  total: number;
  distance: number;
  breakdown: {
    proximity: number;
    interest: number;
    availability: number;
    skill: number;
  };
}

function haversineDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeMatchScore(volunteer: any, task: any): MatchResult {
  // 1. Proximity Score (weight: 0.40) — Exponential decay: e^(-0.05 × distance_km)
  const vLat = volunteer.homeLocation?.lat || 0;
  const vLng = volunteer.homeLocation?.lng || 0;
  const tLat = task.location?.lat || 0;
  const tLng = task.location?.lng || 0;
  const distance = haversineDistance(vLat, vLng, tLat, tLng);
  const proximityScore = Math.exp(-0.05 * distance);

  // 2. Interest Score (weight: 0.25) — 1.0 if category matches interests
  const taskCategory = task.managementOverride?.category || task.aiAnalysis?.category || "";
  const interests: string[] = volunteer.interests || [];
  let interestScore = 0.5; // default if no interests set
  if (interests.length > 0) {
    interestScore = interests.includes(taskCategory) ? 1.0 : 0.0;
  }

  // 3. Availability Score (weight: 0.20) — based on lastActiveAt
  let availabilityScore = 0.2;
  if (volunteer.lastActiveAt) {
    const lastActive = typeof volunteer.lastActiveAt === "string"
      ? new Date(volunteer.lastActiveAt)
      : volunteer.lastActiveAt.toDate ? volunteer.lastActiveAt.toDate() : new Date(0);
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive <= 7) availabilityScore = 1.0;
    else if (daysSinceActive <= 30) availabilityScore = 0.6;
    else availabilityScore = 0.2;
  }

  // 4. Skill Score (weight: 0.15) — matching skills / required skills
  const requiredSkills: string[] = task.requiredSkills || [];
  const volunteerSkills: string[] = volunteer.skills || [];
  let skillScore = 1.0; // default for tasks with no requirements
  if (requiredSkills.length > 0) {
    const matching = requiredSkills.filter((s: string) => volunteerSkills.includes(s)).length;
    skillScore = matching / requiredSkills.length;
  }

  // Weighted total
  const total = parseFloat(
    (0.40 * proximityScore + 0.25 * interestScore + 0.20 * availabilityScore + 0.15 * skillScore).toFixed(2)
  );

  return {
    total,
    distance: parseFloat(distance.toFixed(1)),
    breakdown: {
      proximity: parseFloat((0.40 * proximityScore).toFixed(2)),
      interest: parseFloat((0.25 * interestScore).toFixed(2)),
      availability: parseFloat((0.20 * availabilityScore).toFixed(2)),
      skill: parseFloat((0.15 * skillScore).toFixed(2)),
    },
  };
}
