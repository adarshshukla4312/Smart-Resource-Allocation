/**
 * AI Analysis Service — Client-side Gemini integration
 * Uses @google/generative-ai (Google's official JS SDK)
 * for real-time AI analysis of task reports.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Run AI analysis on a task using Gemini.
 * @param {Object} task - The task document from Firestore
 * @returns {Object} Parsed aiAnalysis object
 */
export async function runAiAnalysis(task) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    }
  });

  const prompt = `You are an NGO crisis assessment AI. Analyze this field report and produce a structured assessment.

Title: ${task.title || 'Untitled'}
Description: ${task.description || 'No description'}
Report Type: ${task.reportType || 'Unknown'}
Employee Assessment: Severity=${task.employeeAssessment?.severity || 'Unknown'}, Urgency=${task.employeeAssessment?.urgency || 'Unknown'}
Location: ${task.location?.address || 'Unknown'}
Tags: ${(task.tags || []).join(', ') || 'None'}

Respond in this exact JSON format:
{
  "situationSummary": "2-3 sentence overview of the situation for management review",
  "category": "one of: Medical Emergency, Infrastructure, Food & Water, Education, Shelter, Environmental, Other",
  "severity": "one of: CRITICAL, HIGH, MEDIUM, LOW",
  "urgency": "one of: IMMEDIATE, SAME_DAY, WITHIN_WEEK, NON_URGENT",
  "estimatedAffected": "a number estimate or null",
  "keyObservations": ["observation1", "observation2", "observation3", "observation4", "observation5"]
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  let aiAnalysis;
  try {
    // Try direct parse first (since we used responseMimeType: 'application/json')
    aiAnalysis = JSON.parse(responseText);
  } catch {
    // Fallback: extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiAnalysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  // Validate required fields
  const validCategories = ['Medical Emergency', 'Infrastructure', 'Food & Water', 'Education', 'Shelter', 'Environmental', 'Other'];
  const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const validUrgencies = ['IMMEDIATE', 'SAME_DAY', 'WITHIN_WEEK', 'NON_URGENT'];

  if (!validCategories.includes(aiAnalysis.category)) {
    aiAnalysis.category = 'Other';
  }
  if (!validSeverities.includes(aiAnalysis.severity)) {
    aiAnalysis.severity = task.employeeAssessment?.severity || 'MEDIUM';
  }
  if (!validUrgencies.includes(aiAnalysis.urgency)) {
    aiAnalysis.urgency = task.employeeAssessment?.urgency || 'NON_URGENT';
  }
  if (!Array.isArray(aiAnalysis.keyObservations)) {
    aiAnalysis.keyObservations = [];
  }
  if (typeof aiAnalysis.estimatedAffected === 'string') {
    aiAnalysis.estimatedAffected = parseInt(aiAnalysis.estimatedAffected) || null;
  }

  return {
    ...aiAnalysis,
    processingStatus: 'DONE',
  };
}

/**
 * Analyze a single media item using Gemini multimodal.
 * @param {string} downloadURL - The public URL of the media file
 * @param {string} mediaType - IMAGE, AUDIO, or VIDEO
 * @returns {Object} AI analysis result for the media
 */
export async function analyzeMediaItem(downloadURL, mediaType) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
  });

  if (mediaType === 'IMAGE') {
    // Fetch image as base64 for Gemini vision
    const response = await fetch(downloadURL);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const mimeType = blob.type || 'image/jpeg';

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType,
        }
      },
      'You are an NGO field assessment AI. Describe this image in detail for disaster/welfare response. Identify key objects, people, conditions, and any safety concerns. Be exhaustive and factual.'
    ]);

    return {
      aiCaption: result.response.text(),
      processingStatus: 'DONE',
    };
  }

  // For audio/video, provide a text-based analysis prompt
  return {
    aiCaption: 'Multimodal analysis available after server-side processing.',
    processingStatus: 'PENDING',
  };
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}
