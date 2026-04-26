/**
 * AI Processing Pipeline — PRD §6
 * Handles audio, image, and video processing via GCP AI services.
 * Triggered by Cloud Storage uploads.
 */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore;

/**
 * Process audio files: Speech-to-Text → Gemini cleanup → Firestore
 */
async function processAudio(gcsUri: string, attachmentId: string, taskId: string): Promise<void> {
  try {
    const { SpeechClient } = await import("@google-cloud/speech");
    const speechClient = new SpeechClient();

    // Step 1: Transcribe with Speech-to-Text v2
    const [operation] = await speechClient.longRunningRecognize({
      audio: { uri: gcsUri },
      config: {
        encoding: "MP3" as any,
        languageCode: "en-IN",
        alternativeLanguageCodes: ["hi-IN", "ta-IN", "bn-IN"],
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: "latest_long",
      },
    });

    const [response] = await operation.promise();
    const rawTranscript = response.results
      ?.map((r: any) => r.alternatives?.[0]?.transcript || "")
      .join(" ") || "";

    // Step 2: Gemini cleanup (low temperature for factual accuracy)
    const cleanTranscript = await callGemini(
      `You are an NGO field report transcription assistant. Clean up this raw transcript: remove filler words, fix transcription errors, maintain factual content. Output clean text only.\n\nRaw transcript:\n${rawTranscript}`,
      0.1
    );

    const summary = await callGemini(
      `Summarize this field report transcript in 3-5 sentences for NGO management review:\n\n${cleanTranscript}`,
      0.2
    );

    // Step 3: Update Firestore
    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      transcript: rawTranscript,
      cleanTranscript,
      aiCaption: summary,
      processingStatus: "DONE",
    });

    functions.logger.info(`Audio processed: ${attachmentId} for task ${taskId}`);
  } catch (error) {
    functions.logger.error("Audio processing failed:", error);
    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      processingStatus: "FAILED",
    });
  }
}

/**
 * Process images: Vision API → Gemini summary → Firestore
 */
async function processImage(gcsUri: string, attachmentId: string, taskId: string): Promise<void> {
  try {
    const vision = await import("@google-cloud/vision");
    const client = new vision.ImageAnnotatorClient();

    // Step 1: Vision API analysis
    const [result] = await client.annotateImage({
      image: { source: { imageUri: gcsUri } },
      features: [
        { type: "LABEL_DETECTION", maxResults: 20 },
        { type: "OBJECT_LOCALIZATION", maxResults: 10 },
        { type: "SAFE_SEARCH_DETECTION" },
      ],
    });

    const labels = result.labelAnnotations?.map((l: any) => l.description) || [];
    const objects = result.localizedObjectAnnotations?.map((o: any) => o.name) || [];

    // Step 2: Gemini summary with vision context
    const caption = await callGemini(
      `You are an NGO field assessment AI. Based on image analysis results, write an exhaustive description relevant to NGO disaster/welfare response.\n\nDetected labels: ${labels.join(", ")}\nDetected objects: ${objects.join(", ")}\n\nProvide a detailed, actionable description of what this image shows.`,
      0.2
    );

    // Step 3: Update Firestore
    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      aiCaption: caption,
      aiObservations: labels.slice(0, 10),
      processingStatus: "DONE",
    });

    functions.logger.info(`Image processed: ${attachmentId} for task ${taskId}`);
  } catch (error) {
    functions.logger.error("Image processing failed:", error);
    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      processingStatus: "FAILED",
    });
  }
}

/**
 * Process videos: Video Intelligence API → Gemini summary → Firestore
 */
async function processVideo(gcsUri: string, attachmentId: string, taskId: string): Promise<void> {
  try {
    const videoIntel = await import("@google-cloud/video-intelligence");
    const client = new videoIntel.VideoIntelligenceServiceClient();

    const [operation] = await client.annotateVideo({
      inputUri: gcsUri,
      features: ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION", "OBJECT_TRACKING"] as any,
    });

    const [results] = await operation.promise();
    const annotations = results.annotationResults?.[0];
    const shotLabels = annotations?.segmentLabelAnnotations?.map((l: any) => l.entity?.description) || [];
    const shotChanges = annotations?.shotAnnotations?.length || 0;

    const caption = await callGemini(
      `You are an NGO field assessment AI. Analyze this video content for disaster/welfare response.\n\nDetected labels: ${shotLabels.join(", ")}\nShot changes: ${shotChanges}\n\nProvide scene-by-scene description and overall situation summary.`,
      0.2
    );

    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      aiCaption: caption,
      aiObservations: shotLabels.slice(0, 10),
      processingStatus: "DONE",
    });

    functions.logger.info(`Video processed: ${attachmentId} for task ${taskId}`);
  } catch (error) {
    functions.logger.error("Video processing failed:", error);
    await db().collection("tasks").doc(taskId).collection("media").doc(attachmentId).update({
      processingStatus: "FAILED",
    });
  }
}

/**
 * Call Gemini (Vertex AI) for text generation
 */
async function callGemini(prompt: string, temperature: number): Promise<string> {
  try {
    const { VertexAI } = await import("@google-cloud/aiplatform") as any;
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "team-ro-ko-hackathon-project";
    const vertexAI = new VertexAI({ project: projectId, location: "us-central1" });
    const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { temperature, maxOutputTokens: 2048 } });
    const result = await model.generateContent(prompt);
    return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    functions.logger.error("Gemini call failed:", error);
    return "[AI processing unavailable]";
  }
}

/**
 * Generate consolidated AI summary for a task (PRD §6.4)
 */
export async function generateConsolidatedSummary(taskId: string): Promise<void> {
  try {
    const taskDoc = await db().collection("tasks").doc(taskId).get();
    const task = taskDoc.data();
    if (!task) return;

    const mediaSnap = await db().collection("tasks").doc(taskId).collection("media").where("processingStatus", "==", "DONE").get();
    const mediaSummaries = mediaSnap.docs.map((d) => d.data().aiCaption || "").filter(Boolean);

    const consolidatedPrompt = `You are an NGO crisis assessment AI. Synthesize all available information into a structured assessment.

Title: ${task.title}
Description: ${task.description}
Report Type: ${task.reportType}
Employee Assessment: Severity=${task.employeeAssessment?.severity}, Urgency=${task.employeeAssessment?.urgency}

Media Analysis Summaries:
${mediaSummaries.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

Respond in JSON format:
{
  "situationSummary": "2-3 paragraph overview",
  "category": "Medical Emergency|Infrastructure|Food & Water|Education|Shelter|Environmental|Other",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "urgency": "IMMEDIATE|SAME_DAY|WITHIN_WEEK|NON_URGENT",
  "estimatedAffected": number_or_null,
  "keyObservations": ["observation1", "observation2", ...]
}`;

    const resultText = await callGemini(consolidatedPrompt, 0.2);

    let aiAnalysis;
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch { aiAnalysis = null; }

    if (aiAnalysis) {
      await db().collection("tasks").doc(taskId).update({
        aiAnalysis: { ...aiAnalysis, processingStatus: "DONE" },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    functions.logger.error("Consolidated summary failed:", error);
    await db().collection("tasks").doc(taskId).update({ "aiAnalysis.processingStatus": "FAILED" });
  }
}

export { processAudio, processImage, processVideo };
