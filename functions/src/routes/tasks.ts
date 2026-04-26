import { Router, Response } from "express";
import * as admin from "firebase-admin";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
const db = admin.firestore;

// ─── GET /v1/tasks — List tasks (filtered by role) ───
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, reportType, limit: limitStr } = req.query;
    const userRole = req.user!.role;
    const pageLimit = Math.min(parseInt(limitStr as string) || 50, 100);

    let query: admin.firestore.Query = db().collection("tasks");

    // Volunteers only see ACTIVE tasks
    if (userRole === "VOLUNTEER") {
      query = query.where("status", "==", "ACTIVE");
    }
    // Field employees only see their own tasks
    else if (userRole === "NGO_EMPLOYEE") {
      query = query.where("employeeId", "==", req.user!.uid);
    }
    // Management sees everything — apply optional filters
    if (status && userRole === "NGO_MANAGEMENT") {
      query = query.where("status", "==", status);
    }
    if (category) {
      query = query.where("aiAnalysis.category", "==", category);
    }
    if (reportType) {
      query = query.where("reportType", "==", reportType);
    }

    query = query.orderBy("createdAt", "desc").limit(pageLimit);

    const snapshot = await query.get();
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Strip internal data for volunteers
      if (userRole === "VOLUNTEER") {
        delete data.internalComments;
        delete data.employeeId;
      }
      return { id: doc.id, ...data };
    });

    res.json({ tasks, count: tasks.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /v1/tasks/:taskId — Get single task ───
router.get("/:taskId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db().collection("tasks").doc(req.params.taskId).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const data = doc.data()!;
    const userRole = req.user!.role;

    // Volunteers can only see ACTIVE tasks
    if (userRole === "VOLUNTEER" && data.status !== "ACTIVE") {
      res.status(403).json({ error: "Task not available" });
      return;
    }
    // Employees can only see own tasks
    if (userRole === "NGO_EMPLOYEE" && data.employeeId !== req.user!.uid) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    // Strip internal data for non-management
    if (userRole !== "NGO_MANAGEMENT") {
      delete data.internalComments;
    }

    res.json({ id: doc.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /v1/tasks — Create a new task/report ───
router.post(
  "/",
  authenticateToken,
  requireRole("NGO_EMPLOYEE"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        title, description, reportType, tags, location,
        employeeAssessment, requiredSkills, maxVolunteers,
      } = req.body;

      if (!title || !description || !reportType || !location) {
        res.status(400).json({ error: "Missing required fields: title, description, reportType, location" });
        return;
      }

      const taskData = {
        status: "SUBMITTED",
        reportType,
        tags: tags || [],
        title,
        description,
        location,
        employeeId: req.user!.uid,
        employeeAssessment: employeeAssessment || { severity: "MEDIUM", urgency: "WITHIN_WEEK" },
        aiAnalysis: {
          situationSummary: "",
          category: "",
          severity: "",
          urgency: "",
          estimatedAffected: null,
          keyObservations: [],
          processingStatus: "PENDING",
        },
        managementOverride: null,
        requiredSkills: requiredSkills || [],
        maxVolunteers: maxVolunteers || null,
        acceptedCount: 0,
        internalComments: [],
        rejectionReason: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db().collection("tasks").add(taskData);
      res.status(201).json({ id: docRef.id, message: "Task created successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ─── PATCH /v1/tasks/:taskId — Update task fields ───
router.patch("/:taskId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const taskRef = db().collection("tasks").doc(req.params.taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const data = doc.data()!;
    const userRole = req.user!.role;

    // Employees can only update own DRAFTs
    if (userRole === "NGO_EMPLOYEE") {
      if (data.employeeId !== req.user!.uid || data.status !== "DRAFT") {
        res.status(403).json({ error: "Can only edit own drafts" });
        return;
      }
    }

    // Volunteers cannot update tasks
    if (userRole === "VOLUNTEER") {
      res.status(403).json({ error: "Volunteers cannot edit tasks" });
      return;
    }

    const updates: any = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    // Prevent overwriting protected fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.employeeId;

    await taskRef.update(updates);
    res.json({ message: "Task updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /v1/tasks/:taskId/apply — Volunteer applies to a task ───
router.post(
  "/:taskId/apply",
  authenticateToken,
  requireRole("VOLUNTEER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const volunteerId = req.user!.uid;

      // Check task exists and is ACTIVE
      const taskDoc = await db().collection("tasks").doc(taskId).get();
      if (!taskDoc.exists || taskDoc.data()!.status !== "ACTIVE") {
        res.status(400).json({ error: "Task not available for applications" });
        return;
      }

      // Check max volunteers
      const taskData = taskDoc.data()!;
      if (taskData.maxVolunteers && taskData.acceptedCount >= taskData.maxVolunteers) {
        res.status(400).json({ error: "Task has reached maximum volunteers" });
        return;
      }

      // Check if already applied
      const existing = await db()
        .collection("applications")
        .where("taskId", "==", taskId)
        .where("volunteerId", "==", volunteerId)
        .get();

      if (!existing.empty) {
        res.status(409).json({ error: "Already applied to this task" });
        return;
      }

      const application = {
        taskId,
        volunteerId,
        matchScore: req.body.matchScore || 0,
        status: "APPLIED",
        rejectionNote: null,
        proofMedia: [],
        proofSubmittedAt: null,
        completedAt: null,
        appliedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const appRef = await db().collection("applications").add(application);
      res.status(201).json({ id: appRef.id, message: "Application submitted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ─── POST /v1/tasks/:taskId/proof — Submit proof of participation ───
router.post(
  "/:taskId/proof",
  authenticateToken,
  requireRole("VOLUNTEER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { proofMedia } = req.body;
      const taskId = req.params.taskId;
      const volunteerId = req.user!.uid;

      // Find accepted application
      const appSnap = await db()
        .collection("applications")
        .where("taskId", "==", taskId)
        .where("volunteerId", "==", volunteerId)
        .where("status", "==", "ACCEPTED")
        .get();

      if (appSnap.empty) {
        res.status(400).json({ error: "No accepted application found" });
        return;
      }

      const appDoc = appSnap.docs[0];
      await appDoc.ref.update({
        proofMedia: proofMedia || [],
        proofSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "PROOF_SUBMITTED",
      });

      res.json({ message: "Proof submitted for review" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ─── GET /v1/tasks/:taskId/applications — Get applications for a task ───
router.get(
  "/:taskId/applications",
  authenticateToken,
  requireRole("NGO_MANAGEMENT"),
  async (req: AuthRequest, res: Response) => {
    try {
      const snapshot = await db()
        .collection("applications")
        .where("taskId", "==", req.params.taskId)
        .orderBy("matchScore", "desc")
        .get();

      const applications = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          // Enrich with volunteer profile
          const volDoc = await db().collection("users").doc(data.volunteerId).get();
          const volData = volDoc.data() || {};
          return {
            id: doc.id,
            ...data,
            volunteerName: volData.displayName || "Unknown",
            volunteerPhoto: volData.photoURL || null,
            skills: volData.skills || [],
            interests: volData.interests || [],
          };
        })
      );

      res.json({ applications });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export { router as taskRouter };
