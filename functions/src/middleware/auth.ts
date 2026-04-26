import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    role: string;
    displayName?: string;
  };
}

/**
 * Validates Firebase ID token from Authorization header.
 * Attaches decoded user info (uid, role) to req.user.
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Fetch user profile from Firestore to get role
    const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();

    req.user = {
      uid: decoded.uid,
      role: userData?.role || "VOLUNTEER",
      displayName: userData?.displayName || decoded.name || "Unknown",
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Checks if the authenticated user has one of the allowed roles.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
