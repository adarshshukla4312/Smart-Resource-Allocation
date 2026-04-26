import { Router, Response } from "express";
import * as admin from "firebase-admin";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import { computeMatchScore } from "../services/matching";

const router = Router();
const db = admin.firestore;

router.get("/feed", authenticateToken, requireRole("VOLUNTEER"), async (req: AuthRequest, res: Response) => {
  try {
    const volDoc = await db().collection("users").doc(req.user!.uid).get();
    if (!volDoc.exists) { res.status(404).json({ error: "Profile not found" }); return; }
    const volunteer = volDoc.data()!;
    const tasksSnap = await db().collection("tasks").where("status", "==", "ACTIVE").get();

    const ranked = tasksSnap.docs.map((doc) => {
      const task = { id: doc.id, ...doc.data() };
      const score = computeMatchScore(volunteer, task);
      delete (task as any).internalComments;
      delete (task as any).employeeId;
      return { ...task, matchScore: score.total, matchBreakdown: score.breakdown, distance: score.distance };
    });

    const urgOrd: Record<string, number> = { IMMEDIATE: 4, SAME_DAY: 3, WITHIN_WEEK: 2, NON_URGENT: 1 };
    ranked.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      const uA = (a as any).aiAnalysis?.urgency || "NON_URGENT";
      const uB = (b as any).aiAnalysis?.urgency || "NON_URGENT";
      return (urgOrd[uB] || 0) - (urgOrd[uA] || 0);
    });

    let filtered = ranked;
    const { category, severity, maxDistance, urgency } = req.query;
    if (category) filtered = filtered.filter((t: any) => (t.managementOverride?.category || t.aiAnalysis?.category) === category);
    if (severity) filtered = filtered.filter((t: any) => (t.managementOverride?.severity || t.aiAnalysis?.severity) === severity);
    if (urgency) filtered = filtered.filter((t: any) => (t.managementOverride?.urgency || t.aiAnalysis?.urgency) === urgency);
    if (maxDistance) filtered = filtered.filter((t: any) => t.distance <= parseFloat(maxDistance as string));

    res.json({ tasks: filtered, count: filtered.length });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get("/score/:taskId", authenticateToken, requireRole("VOLUNTEER"), async (req: AuthRequest, res: Response) => {
  try {
    const volDoc = await db().collection("users").doc(req.user!.uid).get();
    const taskDoc = await db().collection("tasks").doc(req.params.taskId).get();
    if (!volDoc.exists || !taskDoc.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json(computeMatchScore(volDoc.data()!, { id: taskDoc.id, ...taskDoc.data()! }));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export { router as matchRouter };
