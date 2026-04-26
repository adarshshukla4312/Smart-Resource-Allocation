/**
 * Cloud Storage trigger: processes uploaded media files through AI pipeline.
 * File path convention: tasks/{taskId}/media/{attachmentId}/{filename}
 */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { processAudio, processImage, processVideo, generateConsolidatedSummary } from "../services/aiPipeline";

const db = admin.firestore;

export async function onMediaUploaded(object: functions.storage.ObjectMetadata): Promise<void> {
  const filePath = object.name;
  if (!filePath) return;

  // Expected path: tasks/{taskId}/media/{attachmentId}/{filename}
  const parts = filePath.split("/");
  if (parts.length < 4 || parts[0] !== "tasks") return;

  const taskId = parts[1];
  const attachmentId = parts[3];
  const contentType = object.contentType || "";
  const gcsUri = `gs://${object.bucket}/${filePath}`;

  functions.logger.info(`Processing media: ${filePath}, type: ${contentType}`);

  // Create media document if it doesn't exist
  const mediaRef = db().collection("tasks").doc(taskId).collection("media").doc(attachmentId);
  const mediaDoc = await mediaRef.get();
  if (!mediaDoc.exists) {
    await mediaRef.set({
      id: attachmentId,
      taskId,
      gcsUri,
      type: getMediaType(contentType),
      fileSize: parseInt(object.size || "0"),
      processingStatus: "PROCESSING",
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await mediaRef.update({ processingStatus: "PROCESSING" });
  }

  // Route to appropriate processor
  if (contentType.startsWith("audio/")) {
    await processAudio(gcsUri, attachmentId, taskId);
  } else if (contentType.startsWith("image/")) {
    await processImage(gcsUri, attachmentId, taskId);
  } else if (contentType.startsWith("video/")) {
    await processVideo(gcsUri, attachmentId, taskId);
  } else {
    functions.logger.warn(`Unsupported media type: ${contentType}`);
    return;
  }

  // Check if all media for this task is done, then generate consolidated summary
  const allMedia = await db().collection("tasks").doc(taskId).collection("media").get();
  const allDone = allMedia.docs.every((d) => d.data().processingStatus === "DONE");
  if (allDone && allMedia.size > 0) {
    await generateConsolidatedSummary(taskId);
  }
}

function getMediaType(contentType: string): string {
  if (contentType.startsWith("audio/")) return "AUDIO";
  if (contentType.startsWith("image/")) return "IMAGE";
  if (contentType.startsWith("video/")) return "SHORT_VIDEO";
  return "OTHER";
}
