/**
 * Firestore trigger: when a task transitions to ACTIVE,
 * pre-compute match scores for all volunteers (optional cache).
 */
import * as functions from "firebase-functions";

export async function onTaskActivated(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  _context: functions.EventContext
): Promise<void> {
  const before = change.before.data();
  const after = change.after.data();

  if (!before || !after) return;

  // Only trigger when status changes to ACTIVE
  if (before.status === after.status || after.status !== "ACTIVE") return;

  functions.logger.info(`Task ${change.after.id} activated — matching engine notified`);

  // Match scores are computed on-the-fly in the /v1/match/feed endpoint.
  // This trigger serves as a hook for future optimizations:
  // - Pre-computing scores and caching in a matchScores subcollection
  // - Sending FCM notifications to high-match volunteers
  // - Updating analytics/BigQuery

  // For MVP: log activation and let the feed endpoint handle scoring live.
}
