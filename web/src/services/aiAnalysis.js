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
 * Generate a complete Quick Report using AI from scattered data.
 * Processes images (via Gemini vision), PDFs (text extraction), and
 * combines with user's situation description + help request.
 * 
 * @param {File[]} files - Array of File objects (images, PDFs, audio, video)
 * @param {string} situation - "What is this about?" text
 * @param {string} helpNeeded - "How can we help?" text
 * @returns {Object} Generated task fields
 */
export async function generateQuickReport(files, situation, helpNeeded) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    }
  });

  // Process files into content parts for Gemini
  const contentParts = [];
  const fileDescriptions = [];

  for (const file of files) {
    const fileType = file.type || '';

    if (fileType.startsWith('image/')) {
      // Images: convert to base64 for Gemini vision
      try {
        const base64 = await blobToBase64(file);
        contentParts.push({
          inlineData: {
            data: base64,
            mimeType: fileType,
          }
        });
        fileDescriptions.push(`[Image: ${file.name}] - Sent to AI vision for analysis`);
      } catch {
        fileDescriptions.push(`[Image: ${file.name}] - Failed to process`);
      }
    } else if (fileType === 'application/pdf') {
      // PDFs: read as base64 and send to Gemini
      try {
        const base64 = await blobToBase64(file);
        contentParts.push({
          inlineData: {
            data: base64,
            mimeType: 'application/pdf',
          }
        });
        fileDescriptions.push(`[PDF: ${file.name}] - Sent to AI for text extraction and analysis`);
      } catch {
        fileDescriptions.push(`[PDF: ${file.name}] - Failed to process`);
      }
    } else if (fileType.startsWith('audio/')) {
      fileDescriptions.push(`[Audio file: ${file.name}, size: ${(file.size / 1024).toFixed(1)}KB] - Audio recording attached`);
    } else if (fileType.startsWith('video/')) {
      fileDescriptions.push(`[Video file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(1)}MB] - Video recording attached`);
    } else {
      fileDescriptions.push(`[File: ${file.name}, type: ${fileType}] - Document attached`);
    }
  }

  const prompt = `You are an expert NGO crisis assessment AI for an emergency response platform called "Smart Resource Allocation". 

An employee has submitted unorganized data about a field situation. Your job is to analyze ALL the provided data (images, documents, descriptions) and generate a complete, professional field report.

=== EMPLOYEE INPUT ===
SITUATION DESCRIPTION: "${situation}"
HELP NEEDED: "${helpNeeded}"
ATTACHED FILES: ${fileDescriptions.join('\n')}

=== YOUR TASK ===
Analyze all attached images, documents, and the employee's description to generate a complete task/report with the following fields. Be thorough — examine every image and document carefully.

Respond in this exact JSON format:
{
  "title": "A concise, descriptive title for this report (max 120 chars)",
  "description": "A detailed 3-5 sentence professional description of the situation, combining insights from all media and text inputs. Be specific about what you see in images and documents.",
  "reportType": "one of: DISTRESS, INFO_GATHERING, INCIDENT, RESOURCE_REQUEST, ROUTINE",
  "tags": ["array of relevant tags from: Survey, Field Report, Distress Report, Information Gathering, Incident Record, Historical Data, Photographic Evidence, Medical Report"],
  "severity": "one of: CRITICAL, HIGH, MEDIUM, LOW — based on the actual situation severity",
  "urgency": "one of: IMMEDIATE, SAME_DAY, WITHIN_WEEK, NON_URGENT — how quickly action is needed",
  "category": "one of: Medical Emergency, Infrastructure, Food & Water, Education, Shelter, Environmental, Other",
  "requiredSkills": ["array of skills needed from: First Aid, Construction, Legal Aid, Teaching, Driving, Counselling, Tech Support, Medical Professional"],
  "estimatedAffected": "a number estimate of people affected, or null if unknown",
  "situationSummary": "2-3 sentence AI analysis summary for management review",
  "keyObservations": ["observation1", "observation2", "observation3", "observation4", "observation5"]
}`;

  // Build the full content array: prompt text + media parts
  const fullContent = [prompt, ...contentParts];

  const result = await model.generateContent(fullContent);
  const responseText = result.response.text();

  let generated;
  try {
    generated = JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      generated = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response');
    }
  }

  // Validate and sanitize
  const validCategories = ['Medical Emergency', 'Infrastructure', 'Food & Water', 'Education', 'Shelter', 'Environmental', 'Other'];
  const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const validUrgencies = ['IMMEDIATE', 'SAME_DAY', 'WITHIN_WEEK', 'NON_URGENT'];
  const validReportTypes = ['DISTRESS', 'INFO_GATHERING', 'INCIDENT', 'RESOURCE_REQUEST', 'ROUTINE'];
  const validSkills = ['First Aid', 'Construction', 'Legal Aid', 'Teaching', 'Driving', 'Counselling', 'Tech Support', 'Medical Professional'];

  if (!validCategories.includes(generated.category)) generated.category = 'Other';
  if (!validSeverities.includes(generated.severity)) generated.severity = 'MEDIUM';
  if (!validUrgencies.includes(generated.urgency)) generated.urgency = 'NON_URGENT';
  if (!validReportTypes.includes(generated.reportType)) generated.reportType = 'INFO_GATHERING';
  if (!Array.isArray(generated.requiredSkills)) generated.requiredSkills = [];
  generated.requiredSkills = generated.requiredSkills.filter(s => validSkills.includes(s));
  if (!Array.isArray(generated.keyObservations)) generated.keyObservations = [];
  if (!Array.isArray(generated.tags)) generated.tags = [];
  if (typeof generated.estimatedAffected === 'string') {
    generated.estimatedAffected = parseInt(generated.estimatedAffected) || null;
  }

  return generated;
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

/**
 * Fetch a remote file as base64 (for analyzing already-uploaded media).
 */
async function urlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return blobToBase64(blob);
}

/**
 * Analyze a single media item (IMAGE, VIDEO, AUDIO) and return an AI summary.
 * The result is persisted to the Firestore media subcollection.
 * 
 * @param {string} taskId - Parent task ID
 * @param {Object} mediaItem - The media document from Firestore
 * @returns {Object} { aiSummary, processingStatus }
 */
export async function analyzeMediaItem(taskId, mediaItem) {
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

  const contentParts = [];
  const mediaType = (mediaItem.type || '').toUpperCase();

  // For images: we MUST send the actual image to Gemini vision
  if (mediaType === 'IMAGE') {
    if (!mediaItem.downloadURL) {
      throw new Error('Image has no download URL. The file may not have finished uploading.');
    }
    try {
      const base64 = await urlToBase64(mediaItem.downloadURL);
      const mimeType = mediaItem.metadata?.contentType || 'image/jpeg';
      contentParts.push({
        inlineData: { data: base64, mimeType }
      });
    } catch (e) {
      throw new Error('Failed to fetch image for AI analysis. The image may be inaccessible or too large. (' + e.message + ')');
    }
  }

  const prompt = `You are an NGO crisis assessment AI analyzing a media attachment from a field report.

MEDIA TYPE: ${mediaType}
FILE NAME: ${mediaItem.metadata?.originalName || mediaItem.fileName || 'Unknown'}
${mediaItem.aiCaption ? `EXISTING CAPTION: ${mediaItem.aiCaption}` : ''}
${mediaItem.cleanTranscript ? `TRANSCRIPT: ${mediaItem.cleanTranscript}` : ''}
${mediaItem.transcript ? `RAW TRANSCRIPT: ${mediaItem.transcript}` : ''}

Analyze the ${mediaType === 'IMAGE' ? 'image' : 'media'} thoroughly and provide a comprehensive AI summary.

Respond in this exact JSON format:
{
  "aiSummary": "A detailed 3-5 sentence summary describing what is visible/audible in this media. For images: describe the scene, people, conditions, infrastructure, and any signs of distress or damage. For audio: summarize the key points discussed. For video: describe what happens and notable elements.",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "relevanceScore": "HIGH, MEDIUM, or LOW — how relevant this media is to assessing the situation",
  "detectedElements": ["element1", "element2", "element3"]
}`;

  const fullContent = [prompt, ...contentParts];
  const result = await model.generateContent(fullContent);
  const responseText = result.response.text();

  let analysis;
  try {
    analysis = JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI media analysis response');
    }
  }

  // Persist to Firestore
  const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
  await updateDoc(doc(db, 'tasks', taskId, 'media', mediaItem.id), {
    aiSummary: analysis.aiSummary || '',
    aiCaption: analysis.aiSummary || '',
    keyFindings: analysis.keyFindings || [],
    relevanceScore: analysis.relevanceScore || 'MEDIUM',
    detectedElements: analysis.detectedElements || [],
    processingStatus: 'DONE',
    analyzedAt: serverTimestamp(),
  });

  return {
    ...analysis,
    processingStatus: 'DONE',
  };
}

/**
 * Analyze a document (PDF) with two levels of analysis:
 * 1. AI Summary — Quick overview
 * 2. Content Analysis — Detailed, section-by-section breakdown
 * 
 * @param {string} taskId - Parent task ID
 * @param {Object} mediaItem - The media document from Firestore
 * @param {'summary' | 'detailed'} mode - Which analysis to run
 * @returns {Object} Analysis result
 */
export async function analyzeDocument(taskId, mediaItem, mode = 'summary') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: mode === 'detailed' ? 8192 : 2048,
      responseMimeType: 'application/json',
    }
  });

  const contentParts = [];

  // Send the PDF to Gemini
  if (mediaItem.downloadURL) {
    try {
      const base64 = await urlToBase64(mediaItem.downloadURL);
      contentParts.push({
        inlineData: { data: base64, mimeType: 'application/pdf' }
      });
    } catch (e) {
      console.warn('Failed to fetch document for AI analysis:', e);
    }
  }

  let prompt;

  if (mode === 'summary') {
    prompt = `You are an NGO crisis assessment AI analyzing a document attachment from a field report.

FILE NAME: ${mediaItem.metadata?.originalName || mediaItem.fileName || 'Unknown document'}

Analyze this document and provide a concise AI summary.

Respond in this exact JSON format:
{
  "aiSummary": "A comprehensive 3-5 sentence summary of the document's content, purpose, and key information relevant to the NGO's mission.",
  "documentType": "The type of document (e.g., Medical Report, Survey Data, Legal Document, Correspondence, etc.)",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "relevanceScore": "HIGH, MEDIUM, or LOW"
}`;
  } else {
    prompt = `You are an expert NGO document analyst. Perform a thorough, section-by-section content analysis of this document.

FILE NAME: ${mediaItem.metadata?.originalName || mediaItem.fileName || 'Unknown document'}

Go through EVERY part of the document in detail. For each section or page, explain:
- What information is presented
- Its significance for the NGO's assessment
- Any data points, statistics, or facts mentioned
- Any concerns, red flags, or action items

Be descriptive, thorough, and easy to read. Write as if explaining the document to a senior NGO manager who hasn't read it.

Respond in this exact JSON format:
{
  "documentTitle": "The document's title or a descriptive name",
  "documentType": "Type of document",
  "totalPages": "estimated number of pages or sections",
  "sections": [
    {
      "heading": "Section name or page description",
      "content": "Detailed 3-6 sentence explanation of what this section contains and its significance",
      "keyDataPoints": ["specific data point 1", "specific data point 2"],
      "actionItems": ["any recommended actions based on this section"]
    }
  ],
  "overallAssessment": "2-3 sentence overall assessment of the document's implications for the NGO response",
  "criticalInformation": ["Most important piece of info 1", "Most important piece of info 2", "Most important piece of info 3"]
}`;
  }

  const fullContent = [prompt, ...contentParts];
  const result = await model.generateContent(fullContent);
  const responseText = result.response.text();

  let analysis;
  try {
    analysis = JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI document analysis response');
    }
  }

  // Persist to Firestore
  const { doc, updateDoc, db, serverTimestamp } = await import('../firebase.js');
  const updateData = mode === 'summary'
    ? {
        aiSummary: analysis.aiSummary || '',
        aiCaption: analysis.aiSummary || '',
        documentType: analysis.documentType || '',
        keyFindings: analysis.keyFindings || [],
        relevanceScore: analysis.relevanceScore || 'MEDIUM',
        processingStatus: 'DONE',
        analyzedAt: serverTimestamp(),
      }
    : {
        contentAnalysis: analysis,
        contentAnalysisStatus: 'DONE',
        contentAnalyzedAt: serverTimestamp(),
      };

  await updateDoc(doc(db, 'tasks', taskId, 'media', mediaItem.id), updateData);

  return {
    ...analysis,
    processingStatus: 'DONE',
  };
}
