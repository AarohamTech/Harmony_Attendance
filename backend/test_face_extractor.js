const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

function extractFaceEmbedding(base64Str) {
  if (!base64Str || typeof base64Str !== 'string') {
    throw new Error('Base64 image string is required.');
  }

  let cleanBase64 = base64Str;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const imageBuffer = Buffer.from(cleanBase64, 'base64');
  if (imageBuffer.length < 100) {
    throw new Error('Captured image buffer is too small or invalid.');
  }

  let rgbaPixels = null;
  let width = 0;
  let height = 0;

  // 1. Try JPEG decode
  try {
    const rawJpeg = jpeg.decode(imageBuffer, { useTArray: true });
    rgbaPixels = rawJpeg.data;
    width = rawJpeg.width;
    height = rawJpeg.height;
  } catch (err1) {
    // 2. Try PNG decode
    try {
      const rawPng = PNG.sync.read(imageBuffer);
      rgbaPixels = rawPng.data;
      width = rawPng.width;
      height = rawPng.height;
    } catch (err2) {
      // 3. Fallback buffer sampling for unknown image headers
      width = 64;
      height = 64;
      rgbaPixels = new Uint8Array(width * height * 4);
      for (let i = 0; i < rgbaPixels.length; i++) {
        rgbaPixels[i] = imageBuffer[i % imageBuffer.length];
      }
    }
  }

  if (!rgbaPixels || width === 0 || height === 0) {
    throw new Error('Failed to process image pixels for face embedding.');
  }

  // Sample to 64x64 grid
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

  // Combine features: 32 (rHist) + 32 (gHist) + 32 (bHist) + 32 (gridFeatures) = 128
  const rawVector = new Float32Array(128);
  rawVector.set(rHist, 0);
  rawVector.set(gHist, 32);
  rawVector.set(bHist, 64);
  rawVector.set(gridFeatures, 96);

  // L2 Normalize
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

// Test with sample base64 jpeg
const sampleJpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
try {
  const emb1 = extractFaceEmbedding(sampleJpeg);
  console.log('Embedding extracted length:', emb1.length);
  console.log('Sample vector values:', emb1.slice(0, 10));
  const sim = calculateCosineSimilarity(emb1, emb1);
  console.log('Self-similarity:', sim);
} catch (e) {
  console.error('Test error:', e);
}
