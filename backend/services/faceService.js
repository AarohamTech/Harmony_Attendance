const db = require('../config/database');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

function extractFaceEmbedding(base64Str) {
  if (!base64Str || typeof base64Str !== 'string') {
    throw new Error('Base64 face image payload is required.');
  }

  let cleanBase64 = base64Str;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const imageBuffer = Buffer.from(cleanBase64, 'base64');
  if (imageBuffer.length < 50) {
    throw new Error('Captured face image payload is invalid or empty.');
  }

  let rgbaPixels = null;
  let width = 0;
  let height = 0;

  try {
    const rawJpeg = jpeg.decode(imageBuffer, { useTArray: true });
    rgbaPixels = rawJpeg.data;
    width = rawJpeg.width;
    height = rawJpeg.height;
  } catch {
    try {
      const rawPng = PNG.sync.read(imageBuffer);
      rgbaPixels = rawPng.data;
      width = rawPng.width;
      height = rawPng.height;
    } catch {
      width = 64;
      height = 64;
      rgbaPixels = new Uint8Array(width * height * 4);
      for (let i = 0; i < rgbaPixels.length; i++) {
        rgbaPixels[i] = imageBuffer[i % imageBuffer.length];
      }
    }
  }

  if (!rgbaPixels || width === 0 || height === 0) {
    throw new Error('Could not decode facial image bytes.');
  }

  const targetW = 64;
  const targetH = 64;
  const rHist = new Float32Array(32);
  const gHist = new Float32Array(32);
  const bHist = new Float32Array(32);

  const gridSubW = targetW / 4;
  const gridSubH = targetH / 4;
  const gridSums = new Float32Array(16);
  const gridCounts = new Float32Array(16);
  const gridPixels = Array.from({ length: 16 }, () => []);

  for (let y = 0; y < targetH; y++) {
    const srcY = Math.floor((y / targetH) * height);
    const gridRow = Math.floor(y / gridSubH);

    for (let x = 0; x < targetW; x++) {
      const srcX = Math.floor((x / targetW) * width);
      const gridCol = Math.floor(x / gridSubW);
      const gridIdx = gridRow * 4 + gridCol;

      const idx = (srcY * width + srcX) * 4;
      const r = rgbaPixels[idx];
      const g = rgbaPixels[idx + 1];
      const b = rgbaPixels[idx + 2];

      const rBin = Math.min(31, Math.floor(r / 8));
      const gBin = Math.min(31, Math.floor(g / 8));
      const bBin = Math.min(31, Math.floor(b / 8));

      rHist[rBin]++;
      gHist[gBin]++;
      bHist[bBin]++;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      gridSums[gridIdx] += lum;
      gridCounts[gridIdx]++;
      gridPixels[gridIdx].push(lum);
    }
  }

  const gridFeatures = [];
  for (let i = 0; i < 16; i++) {
    const count = gridCounts[i] || 1;
    const mean = gridSums[i] / count;
    let varSum = 0;
    for (const val of gridPixels[i]) {
      varSum += (val - mean) ** 2;
    }
    const std = Math.sqrt(varSum / count);
    gridFeatures.push(mean);
    gridFeatures.push(std);
  }

  const rawVector = new Float32Array(128);
  rawVector.set(rHist, 0);
  rawVector.set(gHist, 32);
  rawVector.set(bHist, 64);
  rawVector.set(gridFeatures, 96);

  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    sumSq += rawVector[i] * rawVector[i];
  }
  const norm = Math.sqrt(sumSq);

  const embedding = [];
  for (let i = 0; i < 128; i++) {
    embedding.push(norm > 0 ? Number((rawVector[i] / norm).toFixed(6)) : 0);
  }

  return embedding;
}

function calculateCosineSimilarity(vec1, vec2) {
  if (!Array.isArray(vec1) || !Array.isArray(vec2) || vec1.length === 0 || vec2.length === 0) {
    return 0;
  }
  const len = Math.min(vec1.length, vec2.length);
  let dot = 0;
  let norm1 = 0;
  let norm2 = 0;
  for (let i = 0; i < len; i++) {
    const v1 = Number(vec1[i]) || 0;
    const v2 = Number(vec2[i]) || 0;
    dot += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }
  if (norm1 === 0 || norm2 === 0) return 0;
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

class FaceService {
  extractEmbedding(base64Str) {
    return extractFaceEmbedding(base64Str);
  }

  calculateSimilarity(vec1, vec2) {
    return calculateCosineSimilarity(vec1, vec2);
  }

  async registerFace(employeeId, faceInput) {
    if (!faceInput) {
      throw new Error('Face image payload is required for registration.');
    }

    let embeddingArray;
    if (Array.isArray(faceInput)) {
      embeddingArray = faceInput;
    } else if (typeof faceInput === 'string' && faceInput.trim().startsWith('[')) {
      try {
        embeddingArray = JSON.parse(faceInput);
      } catch {
        embeddingArray = extractFaceEmbedding(faceInput);
      }
    } else if (typeof faceInput === 'string') {
      embeddingArray = extractFaceEmbedding(faceInput);
    } else {
      throw new Error('Invalid face registration payload.');
    }

    const embeddingJson = JSON.stringify(embeddingArray);

    const query = `
      INSERT INTO face_registrations (employee_id, embedding, registered_on, last_updated)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (employee_id) DO UPDATE
      SET embedding = EXCLUDED.embedding, last_updated = NOW()
      RETURNING *
    `;

    const result = await db.query(query, [employeeId, embeddingJson]);
    return result.rows[0];
  }

  async getFace(employeeId) {
    const result = await db.query(
      'SELECT * FROM face_registrations WHERE employee_id = $1',
      [employeeId]
    );
    return result.rows[0] || null;
  }

  async verifyFace(employeeId, liveFaceInput) {
    const registeredRecord = await this.getFace(employeeId);

    if (!registeredRecord || !registeredRecord.embedding) {
      return {
        verified: false,
        matched: false,
        message: 'Face registration required before punching. No registered face biometric record found.'
      };
    }

    if (!liveFaceInput) {
      return {
        verified: false,
        matched: false,
        message: 'Live face capture image is required for biometric verification.'
      };
    }

    let storedVec;
    try {
      storedVec = typeof registeredRecord.embedding === 'string'
        ? JSON.parse(registeredRecord.embedding)
        : registeredRecord.embedding;
    } catch {
      return {
        verified: false,
        matched: false,
        message: 'Corrupted registered face biometric data. Please re-register your face.'
      };
    }

    let liveVec;
    if (Array.isArray(liveFaceInput)) {
      liveVec = liveFaceInput;
    } else if (typeof liveFaceInput === 'string' && liveFaceInput.trim().startsWith('[')) {
      try {
        liveVec = JSON.parse(liveFaceInput);
      } catch {
        liveVec = extractFaceEmbedding(liveFaceInput);
      }
    } else if (typeof liveFaceInput === 'string') {
      liveVec = extractFaceEmbedding(liveFaceInput);
    } else {
      return {
        verified: false,
        matched: false,
        message: 'Invalid live face capture format.'
      };
    }

    const similarity = calculateCosineSimilarity(storedVec, liveVec);
    const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD || '0.65');

    console.log(`=== BACKEND FACE VERIFICATION ===`);
    console.log(`Employee ID: ${employeeId}`);
    console.log(`Similarity Score: ${similarity.toFixed(4)} (Threshold: ${threshold})`);

    if (similarity >= threshold) {
      const confidence = Math.min(99.9, parseFloat((similarity * 100).toFixed(1)));
      return {
        verified: true,
        matched: true,
        similarity: parseFloat(similarity.toFixed(4)),
        confidence: confidence,
        message: 'Face verified successfully'
      };
    } else {
      return {
        verified: false,
        matched: false,
        similarity: parseFloat(similarity.toFixed(4)),
        message: `Face verification failed. Similarity score (${(similarity * 100).toFixed(1)}%) is below required match threshold (${(threshold * 100).toFixed(0)}%).`
      };
    }
  }
}

module.exports = new FaceService();
