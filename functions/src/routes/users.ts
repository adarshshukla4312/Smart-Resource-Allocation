import { Router, Response } from "express";
import * as admin from "firebase-admin";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const db = admin.firestore;

// ─── POST /v1/users/register — Create user profile after Firebase Auth signup ───
router.post("/register", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const {
      displayName, role, phone, homeLocation,
      interests, skills, availability,
    } = req.body;

    if (!displayName || !role) {
      res.status(400).json({ error: "displayName and role are required" });
      return;
    }

    const validRoles = ["VOLUNTEER", "NGO_EMPLOYEE", "NGO_MANAGEMENT"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
      return;
    }

    const userProfile = {
      uid,
      role,
      displayName,
      photoURL: null,
      phone: phone || "",
      homeLocation: homeLocation || { lat: 0, lng: 0, address: "" },
      interests: interests || [],
      skills: skills || [],
      availability: availability || [],
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db().collection("users").doc(uid).set(userProfile);
    res.status(201).json({ message: "Profile created", uid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /v1/users/me — Get current user profile ───
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db().collection("users").doc(req.user!.uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Profile not found. Please register first." });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /v1/users/me — Update current user profile ───
router.patch("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const updates: any = {
      ...req.body,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Protect immutable fields
    delete updates.uid;
    delete updates.role;
    delete updates.createdAt;

    await db().collection("users").doc(uid).update(updates);
    res.json({ message: "Profile updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /v1/users/:uid — Get user profile (management only) ───
router.get("/:uid", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only management can look up other profiles
    if (req.user!.role !== "NGO_MANAGEMENT" && req.user!.uid !== req.params.uid) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const doc = await db().collection("users").doc(req.params.uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const data = doc.data()!;
    // Non-management gets limited profile
    if (req.user!.role !== "NGO_MANAGEMENT") {
      delete data.phone;
    }

    res.json({ id: doc.id, ...data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as userRouter };
