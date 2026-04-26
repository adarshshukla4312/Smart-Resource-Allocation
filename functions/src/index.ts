import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { app } from "./api";
import { onMediaUploaded } from "./triggers/mediaProcessing";
import { onTaskActivated } from "./triggers/matchingEngine";

admin.initializeApp();

// ─── Express API Monolith (Cloud Run via Firebase Functions) ───
export const api = functions.https.onRequest(app);

// ─── Storage Trigger: AI Media Processing Pipeline ───
export const processMedia = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" })
  .storage.object()
  .onFinalize(onMediaUploaded);

// ─── Firestore Trigger: Matching Engine on Task Activation ───
export const matchVolunteers = functions
  .runWith({ timeoutSeconds: 120, memory: "512MB" })
  .firestore.document("tasks/{taskId}")
  .onUpdate(onTaskActivated);
