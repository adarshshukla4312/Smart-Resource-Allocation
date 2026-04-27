/**
 * Volunteer Matching Engine (Client-Side)
 * Computes live match score based on current GPS and Profile.
 * Formula: 0.35×Proximity + 0.25×Severity + 0.20×Interest + 0.20×Skill
 */

export function haversineDistance(lat1, lng1, lat2, lng2) {
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

export function computeMatchScore(volunteer, task, liveLat = null, liveLng = null) {
  // 1. Proximity Score (weight: 0.35) — Exponential decay: e^(-0.05 × distance_km)
  const vLat = liveLat !== null ? liveLat : (volunteer.homeLocation?.lat || 0);
  const vLng = liveLng !== null ? liveLng : (volunteer.homeLocation?.lng || 0);
  const tLat = task.location?.lat || 0;
  const tLng = task.location?.lng || 0;
  
  let distance = 0;
  let proximityScore = 0;
  
  // If we have no valid location for volunteer, default to 0 proximity score.
  if (vLat === 0 && vLng === 0) {
    distance = 999;
    proximityScore = 0;
  } else {
    distance = haversineDistance(vLat, vLng, tLat, tLng);
    proximityScore = Math.exp(-0.05 * distance);
  }

  // 2. Severity Score (weight: 0.25) — Critical = 1.0, High = 0.8, Medium = 0.5, Low = 0.2
  const taskSeverity = task.managementOverride?.severity || task.aiAnalysis?.severity || task.employeeAssessment?.severity || "LOW";
  let severityScore = 0.2;
  if (taskSeverity === "CRITICAL") severityScore = 1.0;
  else if (taskSeverity === "HIGH") severityScore = 0.8;
  else if (taskSeverity === "MEDIUM") severityScore = 0.5;

  // 3. Interest Score (weight: 0.20) — 1.0 if category matches interests
  const taskCategory = task.managementOverride?.category || task.aiAnalysis?.category || "";
  const interests = volunteer.interests || [];
  let interestScore = 0.5; // default if no interests set
  if (interests.length > 0) {
    interestScore = interests.includes(taskCategory) ? 1.0 : 0.0;
  }

  // 4. Skill Score (weight: 0.20) — matching skills / required skills
  const requiredSkills = task.requiredSkills || [];
  const volunteerSkills = volunteer.skills || [];
  let skillScore = 1.0; // default for tasks with no requirements
  if (requiredSkills.length > 0) {
    const matching = requiredSkills.filter(s => volunteerSkills.includes(s)).length;
    skillScore = matching / requiredSkills.length;
  }

  // Weighted total
  const total = (0.35 * proximityScore) + (0.25 * severityScore) + (0.20 * interestScore) + (0.20 * skillScore);

  return {
    total: parseFloat(total.toFixed(2)),
    distance: parseFloat(distance.toFixed(1)),
    breakdown: {
      proximity: parseFloat((0.35 * proximityScore).toFixed(2)),
      severity: parseFloat((0.25 * severityScore).toFixed(2)),
      interest: parseFloat((0.20 * interestScore).toFixed(2)),
      skill: parseFloat((0.20 * skillScore).toFixed(2)),
    },
  };
}
