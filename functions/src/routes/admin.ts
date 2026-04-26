import { Router, Response } from "express";
import * as admin from "firebase-admin";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
const db = admin.firestore;

// Approve task → ACTIVE
router.post("/:taskId/approve", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const ref = db().collection("tasks").doc(req.params.taskId);
    const doc = await ref.get();
    if (!doc.exists) { res.status(404).json({ error: "Task not found" }); return; }
    const data = doc.data()!;
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(data.status)) {
      res.status(400).json({ error: `Cannot approve task in ${data.status} status` }); return;
    }
    await ref.update({ status: "ACTIVE", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ message: "Task approved and now ACTIVE" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Reject task
router.post("/:taskId/reject", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) { res.status(400).json({ error: "Rejection reason is required" }); return; }
    const ref = db().collection("tasks").doc(req.params.taskId);
    await ref.update({ status: "REJECTED", rejectionReason: reason, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ message: "Task rejected" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Override AI predictions
router.post("/:taskId/override", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const { category, severity, urgency } = req.body;
    const ref = db().collection("tasks").doc(req.params.taskId);
    await ref.update({
      managementOverride: { category: category || null, severity: severity || null, urgency: urgency || null, overriddenBy: req.user!.uid, overriddenAt: admin.firestore.FieldValue.serverTimestamp() },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "AI predictions overridden" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Add internal comment
router.post("/:taskId/comments", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400).json({ error: "Comment text required" }); return; }
    const ref = db().collection("tasks").doc(req.params.taskId);
    await ref.update({
      internalComments: admin.firestore.FieldValue.arrayUnion({ author: req.user!.displayName, text, timestamp: new Date().toISOString() }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Comment added" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Accept/Reject volunteer application
router.post("/applications/:appId/:action", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const { action, appId } = req.params;
    if (!["accept", "reject"].includes(action)) { res.status(400).json({ error: "Action must be accept or reject" }); return; }
    const appRef = db().collection("applications").doc(appId);
    const appDoc = await appRef.get();
    if (!appDoc.exists) { res.status(404).json({ error: "Application not found" }); return; }

    if (action === "accept") {
      await appRef.update({ status: "ACCEPTED" });
      const taskRef = db().collection("tasks").doc(appDoc.data()!.taskId);
      await taskRef.update({ acceptedCount: admin.firestore.FieldValue.increment(1) });
      // Auto-close if max reached
      const taskDoc = await taskRef.get();
      const taskData = taskDoc.data()!;
      if (taskData.maxVolunteers && taskData.acceptedCount >= taskData.maxVolunteers) {
        await taskRef.update({ status: "CLOSED" });
      }
    } else {
      await appRef.update({ status: "REJECTED", rejectionNote: req.body.reason || "Not selected" });
    }
    res.json({ message: `Application ${action}ed` });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Complete task
router.post("/:taskId/complete", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const ref = db().collection("tasks").doc(req.params.taskId);
    await ref.update({ status: "COMPLETED", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ message: "Task marked completed" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Verify proof
router.post("/applications/:appId/verify-proof", authenticateToken, requireRole("NGO_MANAGEMENT"), async (req: AuthRequest, res: Response) => {
  try {
    const appRef = db().collection("applications").doc(req.params.appId);
    const { approved } = req.body;
    if (approved) {
      await appRef.update({ status: "COMPLETED", completedAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await appRef.update({ status: "ACCEPTED", proofMedia: [], proofSubmittedAt: null });
    }
    res.json({ message: approved ? "Proof verified" : "Re-submission requested" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Dashboard stats
router.get("/stats", authenticateToken, requireRole("NGO_MANAGEMENT"), async (_req: AuthRequest, res: Response) => {
  try {
    const tasks = await db().collection("tasks").get();
    let active = 0, pending = 0, completed = 0;
    tasks.docs.forEach((d) => {
      const s = d.data().status;
      if (s === "ACTIVE") active++;
      if (["SUBMITTED", "UNDER_REVIEW"].includes(s)) pending++;
      if (s === "COMPLETED") completed++;
    });
    const vols = await db().collection("users").where("role", "==", "VOLUNTEER").get();
    res.json({ activeTasks: active, pendingReview: pending, completedTasks: completed, activeVolunteers: vols.size });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export { router as adminRouter };
