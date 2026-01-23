import QRCode from 'qrcode';
// @ts-ignore
import jsQR from 'jsqr';
// import GIF from 'gif.js'; // This often fails in Vite if not handled well. Use CommonJS require or specific import if possible, or assume it works if no error. 
// Assuming GIF works for now as user complained about BASIC QRs (Static) which rely on QRCode.
import GIF from 'gif.js';
import { parseGIF, decompressFrames } from 'gifuct-js';

/**
 * Verify if a QR code image is scannable
 */
function verifyScannability(imageData: ImageData): boolean {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return !!code;
}

/**
 * Generate an Optimized Color Map
 * 1. Tries "Smart Palette" (Colorful)
 * 2. Checks scannability
 * 3. If fail, falls back to "High Contrast" (B/W)
 */
function generateOptimizedColorMap(
    frameImageData: ImageData,
    qr: QRCode.QRCode,
    quietZone: number = 0.75,
    overlayOpacity: number = 0.75 // Default if not provided
): string[][] {
    // Helper to simulate fade
    const simulateFade = (data: ImageData, opacity: string) => {
        const c = document.createElement('canvas');
        c.width = data.width; c.height = data.height;
        const ctx = c.getContext('2d')!;
        ctx.putImageData(data, 0, 0);
        ctx.fillStyle = opacity; // e.g. 'rgba(255, 255, 255, 0.75)'
        ctx.fillRect(0, 0, data.width, data.height);
        return ctx.getImageData(0, 0, data.width, data.height);
    };

    const FADE_OPACITY = `rgba(255, 255, 255, ${overlayOpacity})`; // Dynamic Opacity
    const fadedImageData = simulateFade(frameImageData, FADE_OPACITY);

    // 1. Try COLORFUL Smart Palette (from Vivid)
    const colorfulMap = calculateSmartColorMap(frameImageData, qr, quietZone, false, overlayOpacity);

    // Test on FADED background (Just for logging/warnings now)
    const testFrameColorful = overlayQROnFrame(
        fadedImageData, qr, 'auto', 'square', 'square', 0.85, 0.90, null, quietZone, false, colorfulMap
    );

    if (verifyScannability(testFrameColorful)) {
        console.log('[Scannability] Colorful palette PASSED on Faded BG ✅');
    } else {
        console.warn('[Scannability] Colorful palette FAILED on Faded BG ⚠️ - But keeping it per user preference ("stick with colors")');
    }

    // ALWAYS return colorful map. The opacity overlay (0.75) is our main line of defense.
    // If we wanted to be smarter, we could bump opacity here, but we can't easily change the main loop's opacity from here.
    return colorfulMap;
}

/**
 * Calculate the Smart Palette Color Map from a single frame
 * Returns a 2D array of color strings for each module [y][x]
 */
function calculateSmartColorMap(
    frameImageData: ImageData,
    qr: QRCode.QRCode,
    quietZone: number = 0.75,
    forceHighContrast: boolean = false,
    overlayOpacity: number = 0 // New param: Adjusts calculation for background dimming
): string[][] {
    const qrMatrix = qr.modules;
    const size = qrMatrix.size;
    const w = frameImageData.width;
    const h = frameImageData.height;
    const totalModules = size + 2 * quietZone;

    const map: string[][] = [];

    for (let y = 0; y < size; y++) {
        const row: string[] = [];
        for (let x = 0; x < size; x++) {
            // Calculate module bounds
            const xStart = Math.floor(((x + quietZone) * w) / totalModules);
            const yStart = Math.floor(((y + quietZone) * h) / totalModules);
            const xEnd = Math.floor(((x + 1 + quietZone) * w) / totalModules);
            const yEnd = Math.floor(((y + 1 + quietZone) * h) / totalModules);

            // Get pixel at module center
            const centerX = Math.floor((xStart + xEnd) / 2);
            const centerY = Math.floor((yStart + yEnd) / 2);
            const pixelIndex = (centerY * w + centerX) * 4;

            const r = frameImageData.data[pixelIndex];
            const g = frameImageData.data[pixelIndex + 1];
            const b = frameImageData.data[pixelIndex + 2];

            const getLuma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

            // Calculate Effective Background Luma (accounting for overlay)
            const vividLuma = getLuma(r, g, b);
            const bgLuma = (vividLuma * (1 - overlayOpacity)) + (255 * overlayOpacity); // Faded White Overlay

            // Optimization: If forcing B/W, just output B/W based on luma
            if (forceHighContrast) {
                if (bgLuma > 127) row.push('#000000');
                else row.push('#FFFFFF');
                continue;
            }

            // EXTRACT PALETTE & FIND BEST CONTRAST
            let bestColor = { r: 0, g: 0, b: 0 };
            let maxContrast = -1;

            // Sample candidates (Fast 4x4 grid + B/W)
            const candidates = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }];
            for (let cy = 0; cy < 4; cy++) {
                for (let cx = 0; cx < 2; cx++) {
                    const sx = Math.floor((cx + 0.5) * w / 2);
                    const sy = Math.floor((cy + 0.5) * h / 4);
                    const idx = (sy * w + sx) * 4;
                    candidates.push({
                        r: frameImageData.data[idx],
                        g: frameImageData.data[idx + 1],
                        b: frameImageData.data[idx + 2]
                    });
                }
            }
            // Add Center Color as Candidate
            candidates.push({ r, g, b });

            for (const c of candidates) {
                const cLuma = getLuma(c.r, c.g, c.b);
                const contrast = Math.abs(cLuma - bgLuma); // Compare against FADED BG
                let score = contrast;
                const isBW = (c.r === 0 && c.g === 0 && c.b === 0) || (c.r === 255 && c.g === 255 && c.b === 255);
                // Favor colorful options if contrast is decent (and higher than B/W threshold)
                // Threshold increased to avoid weak colors on washed out backgrounds
                if (!isBW && contrast > 80) score += 50;

                // Penalize White if background is very light (common with overlay)
                if (c.r > 240 && c.g > 240 && c.b > 240 && bgLuma > 200) {
                    score -= 100; // Violently avoid white-on-white
                }

                if (score > maxContrast) {
                    maxContrast = score;
                    bestColor = c;
                }
            }
            row.push(`rgba(${bestColor.r}, ${bestColor.g}, ${bestColor.b}, 1.0)`);
        }
        map.push(row);
    }
    return map;
}

interface GenerateOptions {
    foregroundColor?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
    style?: string;
    backgroundImage?: string | null;
    eyeStyle?: string;
    dotScale?: number;
    eyeScale?: number;
    ecLevel?: 'L' | 'M' | 'Q' | 'H';
    logo?: string | Blob | File | null;
    emptyCenter?: boolean;
    frame?: string;
    frameColor?: string;
    frameText?: string;
    frameTextColor?: string;
    frameTextPosition?: 'top' | 'bottom';
}

/**
 * Generate QR code matrix (2D boolean array)
 */
// Generate QR code with custom error correction (H, Q, M, L)
async function generateQRMatrix(content: string, ecLevel: 'L' | 'M' | 'Q' | 'H' = 'H'): Promise<QRCode.QRCode> {
    // Don't log the QRCode object directly - it has a buggy toString that crashes!
    console.log('[DEBUG] generateQRMatrix called with content:', content);
    console.log('[DEBUG] typeof QRCode:', typeof QRCode);
    console.log('[DEBUG] QRCode.create exists?', !!QRCode?.create);

    if (!QRCode || !QRCode.create) {
        console.error('[DEBUG] CRITICAL: QRCode library is not loaded correctly!', QRCode);
        throw new Error('QRCode library not loaded');
    }

    if (!content) {
        console.error('[DEBUG] generateQRMatrix: Content is empty or undefined!');
        throw new Error('QR Content cannot be empty');
    }

    console.log('[DEBUG] About to call QRCode.create with:', { content, ecLevel });

    const qrArray = await QRCode.create(content, {
        errorCorrectionLevel: ecLevel,
        margin: 0,
    });
    console.log('[DEBUG] QRCode.create success, result:', qrArray);

    return qrArray;
}

/**
 * Extract frames from a GIF file
 * Returns array of ImageData objects
 */
async function extractGifFrames(gifFile: File | Blob) {
    const arrayBuffer = await gifFile.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const frames = decompressFrames(gif, true);

    // Convert frames to ImageData
    const imageDataFrames = [];

    for (const frame of frames) {
        const { dims, patch } = frame;
        const { width, height, top, left } = dims;

        // Skip invalid frames
        if (!width || !height || width <= 0 || height <= 0) {
            continue;
        }

        try {
            const imageData = new ImageData(
                new Uint8ClampedArray(patch),
                width,
                height
            );
            imageDataFrames.push({ imageData, delay: frame.delay, dims: { width, height, top, left } });
        } catch (e) {
            console.warn("Skipping invalid frame:", e);
        }
    }

    return {
        frames: imageDataFrames,
        width: gif.lsd.width,
        height: gif.lsd.height
    };
}

/**
 * Calculate TWO high-contrast colors from the frame for maximum QR readability
 * Strategy: Extract hue from background, then create one very dark and one very light variant
 */
function getDualPastelColors(imageData) {
    const { data } = imageData;
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;

    // 1. Calculate average color from background
    const step = 4 * 10; // Sample every 10th pixel
    for (let i = 0; i < data.length; i += step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        rSum += r; gSum += g; bSum += b;
        count++;
    }

    const avgR = rSum / count / 255;
    const avgG = gSum / count / 255;
    const avgB = bSum / count / 255;

    // 2. Convert average to HSL to extract hue
    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = 0; // achromatic (gray)
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case avgR: h = (avgG - avgB) / d + (avgG < avgB ? 6 : 0); break;
            case avgG: h = (avgB - avgR) / d + 2; break;
            case avgB: h = (avgR - avgG) / d + 4; break;
        }
        h /= 6;
    }

    // 3. Create HIGH CONTRAST colors for maximum readability
    // Strategy: One very dark, one very light, both using the extracted hue
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const hslToRgb = (h, s, l) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: 255
        };
    };

    // Color 1: Very Dark (for high contrast)
    // Use the extracted hue, high saturation, very low lightness (dark)
    const darkColor = hslToRgb(h, 0.9, 0.15); // 15% lightness = very dark

    // Color 2: Very Light (for high contrast)
    // Use complementary hue (opposite on color wheel), high saturation, high lightness
    const lightColor = hslToRgb((h + 0.5) % 1, 0.8, 0.85); // 85% lightness = very light

    // 4. Determine which color has better contrast against background
    // Calculate perceived brightness of background
    const bgBrightness = avgR * 0.299 + avgG * 0.587 + avgB * 0.114;

    // If background is dark, return light then dark. If light, return dark then light
    if (bgBrightness < 0.5) {
        return [lightColor, darkColor]; // Light background, use light primary
    } else {
        return [darkColor, lightColor]; // Dark background, use dark primary
    }
}

/**
 * Helper to check if a module is part of the position patterns (eyes)
 */
function isPositionPattern(x, y, size) {
    // Top Left Eye
    if (x < 7 && y < 7) return true;
    // Top Right Eye
    if (x >= size - 7 && y < 7) return true;
    // Bottom Left Eye
    if (x < 7 && y >= size - 7) return true;
    return false;
}

/**
 * Overlay QR code on a single frame with custom styles
 */
// 5. Draw QR on a single frame (or static canvas)
// 5. Draw QR on a single frame (or static canvas)


// 5. Draw QR on a single frame (or static canvas)
function overlayQROnFrame(
    frameImageData: ImageData,
    qr: QRCode.QRCode,
    foregroundColor: string,
    style: string = 'square',
    eyeStyle: string = 'square',
    dotScale: number = 0.85,
    eyeScale: number = 0.90,
    logoImg: HTMLImageElement | null = null,
    quietZone: number = 0.75,
    emptyCenter: boolean = false,
    smartColorMap: string[][] | null = null
) {
    const qrMatrix = qr.modules; // fix: access .modules

    const canvas = document.createElement('canvas');
    canvas.width = frameImageData.width;
    canvas.height = frameImageData.height;
    const ctx = canvas.getContext('2d');

    // Draw background frame
    ctx.putImageData(frameImageData, 0, 0);

    const w = canvas.width;
    const h = canvas.height;
    const qrWidth = qrMatrix.size;
    const qrHeight = qrMatrix.size;

    // Total Modules (Width + 2 * QuietZone)
    const totalModules = qrWidth + 2 * quietZone;

    // Calculate Logo Bounds (if logo exists OR emptyCenter is requested)
    let logoBounds = null;
    if (logoImg || emptyCenter) {
        const logoSize = Math.floor(w * 0.2); // 20% of canvas
        const lx = Math.floor((w - logoSize) / 2);
        const ly = Math.floor((h - logoSize) / 2);

        // Convert screen coords to grid coords (approx)
        // We want to skip drawing dots UNDER the logo
        // xStart <= x < xEnd
        // xStart = floor(x * w / qrWidth)
        // gridX = floor(screenX * qrWidth / w)

        const gridXStart = Math.floor(lx * qrWidth / w);
        const gridYStart = Math.floor(ly * qrHeight / h);
        const gridXEnd = Math.ceil((lx + logoSize) * qrWidth / w);
        const gridYEnd = Math.ceil((ly + logoSize) * qrHeight / h);

        logoBounds = {
            gridXStart, gridYStart, gridXEnd, gridYEnd,
            lx, ly, lw: logoSize, lh: logoSize
        };
    }

    // Determine colors
    let fillStyle1 = foregroundColor;
    let fillStyle2 = foregroundColor;

    // Optional: Only use pastel magic if foregroundColor is 'auto' (future proofing)
    if (foregroundColor === 'auto') {
        const colors = getDualPastelColors(frameImageData);
        fillStyle1 = `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, 1.0)`;
        fillStyle2 = `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, 1.0)`;
    }

    // Draw QR modules
    for (let y = 0; y < qrHeight; y++) {
        for (let x = 0; x < qrWidth; x++) {
            // Check if this module is part of an eye
            const isEyePart = isPositionPattern(x, y, qrWidth);

            // Check if module is under logo (Skip)
            if (logoBounds) {
                if (x >= logoBounds.gridXStart && x < logoBounds.gridXEnd &&
                    y >= logoBounds.gridYStart && y < logoBounds.gridYEnd) {
                    continue;
                }
            }

            // Check if this is the Top-Left anchor of an eye
            const isAhchor = (x === 0 && y === 0) || (x === qrWidth - 7 && y === 0) || (x === 0 && y === qrWidth - 7);

            if (isAhchor) {
                // Calculate Eye Bounds (7x7 modules)
                // Adjust for Quiet Zone
                const xStart = Math.floor(((x + quietZone) * w) / totalModules);
                const yStart = Math.floor(((y + quietZone) * h) / totalModules);
                const xEnd = Math.floor(((x + 7 + quietZone) * w) / totalModules);
                const yEnd = Math.floor(((y + 7 + quietZone) * h) / totalModules);

                const eyeW = xEnd - xStart;
                const eyeH = yEnd - yStart;
                const modW = eyeW / 7;
                const modH = eyeH / 7;

                // Draw Solid Eye
                ctx.fillStyle = fillStyle1;

                // Apply Eye Scale (Scale around center)
                // Center
                const cx = xStart + eyeW / 2;
                const cy = yStart + eyeH / 2;

                // Scaled Size
                const sw = eyeW * eyeScale;
                const sh = eyeH * eyeScale;
                const sx = cx - sw / 2;
                const sy = cy - sh / 2;

                const sModW = sw / 7;
                const sModH = sh / 7;

                ctx.beginPath();

                if (eyeStyle === 'circle') {
                    // Outer Ring
                    ctx.arc(cx, cy, sw / 2, 0, Math.PI * 2); // Outer 7x7
                    ctx.arc(cx, cy, sw / 2 - sModW, 0, Math.PI * 2, true); // Hole 5x5 (Counter-clockwise)
                    ctx.closePath();

                    // Inner Pupil (3x3)
                    ctx.moveTo(cx + sModW * 1.5, cy);
                    ctx.arc(cx, cy, sModW * 1.5, 0, Math.PI * 2);
                } else if (eyeStyle === 'rounded') {
                    // Manual Round Rect with Hole
                    // Outer
                    const r = sModW * 2;
                    ctx.roundRect(sx, sy, sw, sh, r);
                    // Inner Hole (We need to rely on evenodd or separate fill)
                    // Let's try drawing everything and use fill('evenodd')
                    // Inner Hole 5x5
                    const rIn = sModW * 1.5;
                    ctx.roundRect(sx + sModW, sy + sModH, sw - 2 * sModW, sh - 2 * sModH, rIn);
                    // Pupil 3x3
                    ctx.roundRect(sx + 2 * sModW, sy + 2 * sModH, 3 * sModW, 3 * sModH, sModW);
                } else {
                    // Square (Default) supports holes easily with rect
                    ctx.rect(sx, sy, sw, sh); // Outer
                    ctx.rect(sx + sModW, sy + sModH, sw - 2 * sModW, sh - 2 * sModH); // Inner Hole?
                    // Note: rect adds subpath. If we use 'evenodd' fill, overlapping areas are holes.
                    // Inner 3x3 Pupil
                    ctx.rect(sx + 2 * sModW, sy + 2 * sModH, 3 * sModW, 3 * sModH);
                }

                // Fill with EvenOdd rule to create holes
                ctx.fill("evenodd");
            }

            if (isEyePart) {
                // Skip processing individual modules for eyes
                continue;
            }

            if (qrMatrix.get(x, y)) {
                // Calculate module bounds
                // Adjust for Quiet Zone
                const xStart = Math.floor(((x + quietZone) * w) / totalModules);
                const yStart = Math.floor(((y + quietZone) * h) / totalModules);
                const xEnd = Math.floor(((x + 1 + quietZone) * w) / totalModules);
                const yEnd = Math.floor(((y + 1 + quietZone) * h) / totalModules);

                const moduleWidth = xEnd - xStart;
                const moduleHeight = yEnd - yStart;

                // **SMART PALETTE CONTRAST - IMAGE-DERIVED COLORS**
                // Piority: 
                // 1. Used pre-calculated map (STATIC styling based on first frame)
                // 2. Auto-calc (Dynamic per frame - fallback)
                // 3. Manual colors

                let dotColor: string;

                if (smartColorMap) {
                    // 1. Static Smart Color (Pre-calculated from first frame)
                    dotColor = smartColorMap[y][x];
                } else if (foregroundColor === 'auto') {
                    // 2. Dynamic Smart Color (Fallback if map not provided)
                    // (Logic duplicated from helper for robustness if map is missing)
                    const centerX = Math.floor(xStart + moduleWidth / 2);
                    const centerY = Math.floor(yStart + moduleHeight / 2);
                    const pixelIndex = (centerY * frameImageData.width + centerX) * 4;

                    const r = frameImageData.data[pixelIndex];
                    const g = frameImageData.data[pixelIndex + 1];
                    const b = frameImageData.data[pixelIndex + 2];

                    const getLuma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;
                    const bgLuma = getLuma(r, g, b);

                    let bestColor = { r: 0, g: 0, b: 0 };
                    let maxContrast = -1;
                    const candidates = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }];
                    // Quick sample center
                    candidates.push({ r: frameImageData.data[pixelIndex], g: frameImageData.data[pixelIndex + 1], b: frameImageData.data[pixelIndex + 2] });

                    for (const c of candidates) {
                        const cLuma = getLuma(c.r, c.g, c.b);
                        const contrast = Math.abs(cLuma - bgLuma);
                        if (contrast > maxContrast) {
                            maxContrast = contrast;
                            bestColor = c;
                        }
                    }
                    dotColor = `rgba(${bestColor.r}, ${bestColor.g}, ${bestColor.b}, 1.0)`;

                } else {
                    // 3. Manual color
                    dotColor = (x + y) % 2 === 0 ? fillStyle1 : fillStyle2;
                }

                ctx.fillStyle = dotColor;
                ctx.beginPath();

                // --- DRAW DATA MODULES ---
                const effectiveStyle = (style.includes('classy')) ? style : style;

                if (effectiveStyle === 'dots' || effectiveStyle === 'classy') {
                    // Circle
                    const cx = xStart + moduleWidth / 2;
                    const cy = yStart + moduleHeight / 2;
                    const r = (Math.min(moduleWidth, moduleHeight) / 2) * dotScale;
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                } else if (effectiveStyle === 'rounded' || effectiveStyle === 'classy-rounded') {
                    // Rounded Rect
                    const r = Math.min(moduleWidth, moduleHeight) * 0.25;
                    const pFactor = (1 - dotScale) / 2;
                    const pX = moduleWidth * pFactor;
                    const pY = moduleHeight * pFactor;
                    ctx.roundRect(xStart + pX, yStart + pY, moduleWidth - 2 * pX, moduleHeight - 2 * pY, r);
                } else if (effectiveStyle === 'extra-rounded') {
                    const r = Math.min(moduleWidth, moduleHeight) * 0.5;
                    const pFactor = (1 - dotScale) / 2;
                    const pX = moduleWidth * pFactor;
                    const pY = moduleHeight * pFactor;
                    ctx.roundRect(xStart + pX, yStart + pY, moduleWidth - 2 * pX, moduleHeight - 2 * pY, r);
                } else {
                    // Square
                    const pFactor = (1 - dotScale) / 2;
                    const pX = moduleWidth * pFactor;
                    const pY = moduleHeight * pFactor;
                    ctx.rect(xStart + pX, yStart + pY, moduleWidth - 2 * pX, moduleHeight - 2 * pY);
                }

                ctx.fill();
            }
        }
    }

    // Draw Logo
    if (logoBounds && logoImg) {
        ctx.drawImage(logoImg, logoBounds.lx, logoBounds.ly, logoBounds.lw, logoBounds.lh);
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Generate animated QR code with GIF background
 */
/**
 * Generate animated QR code with GIF background
 */
export async function generateAnimatedQR(content: string, gifFile: File | Blob, optionsOrColor: string | GenerateOptions = {}): Promise<Blob> {
    let options: GenerateOptions = {};
    if (typeof optionsOrColor === 'string') {
        options = { foregroundColor: optionsOrColor };
    } else {
        options = optionsOrColor;
    }
    const {
        foregroundColor = '#000000',
        style = 'square',
        eyeStyle = 'square',
        dotScale = 0.85,
        eyeScale = 1.0,
        ecLevel = 'H',
        logo = null,
        emptyCenter = false,
        backgroundDimming = 0.75 // New Default
    } = options;
    try {
        // Load logo if present
        const logoImg = logo ? await loadImage(logo) : null;

        // Generate QR matrix
        const qrCode = await generateQRMatrix(content, ecLevel);

        // Extract raw GIF frames and dimensions
        const { frames: rawFrames, width: gifWidth, height: gifHeight } = await extractGifFrames(gifFile);

        if (rawFrames.length === 0) {
            throw new Error('No frames extracted from GIF');
        }

        // Create a temporary canvas for frame composition
        const compositionCanvas = document.createElement('canvas');
        compositionCanvas.width = gifWidth;
        compositionCanvas.height = gifHeight;
        const ctx = compositionCanvas.getContext('2d')!; // Assert non-null

        // Create GIF encoder
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: gifWidth,
            height: gifHeight,
            workerScript: '/gif.worker.js' // IMPORTANT: Point to public worker file
        });

        // We need an offscreen canvas for patches
        const patchCanvas = document.createElement('canvas');
        const patchCtx = patchCanvas.getContext('2d')!;

        let smartColorMap: string[][] | null = null;

        // Process and Composit Frames
        for (const frame of rawFrames) {
            const { imageData, dims, delay } = frame;

            // 1. Draw the patch onto the composition canvas
            // Use dims to position correctly
            patchCanvas.width = dims.width;
            patchCanvas.height = dims.height;
            patchCtx.putImageData(imageData, 0, 0);

            // Draw patch at correct offset
            ctx.drawImage(patchCanvas, dims.left, dims.top);

            // SAVE VIVID STATE (to restore later for next frame calc)
            const vividFrameImageData = ctx.getImageData(0, 0, gifWidth, gifHeight);

            // Calculate Static Color Map from the FIRST frame (if auto mode)
            // Use VIVID image data for color extraction to keep dots colorful!
            if (!smartColorMap && foregroundColor === 'auto') {
                smartColorMap = generateOptimizedColorMap(vividFrameImageData, qrCode, 0.75, backgroundDimming);
            }

            // APPLY OPACITY / DIMMING (SCANNABILITY BOOST)
            // Draw a semi-transparent white layer to brighten background for readability
            // Transparency determined by user (default 0.75)
            ctx.fillStyle = `rgba(255, 255, 255, ${backgroundDimming})`;
            ctx.fillRect(0, 0, gifWidth, gifHeight);

            // Get Faded Data for overlaying
            const fadedFrameImageData = ctx.getImageData(0, 0, gifWidth, gifHeight);

            // 3. Overlay QR code onto FADED background (but using map derived from VIVID)
            const overlaidFrame = overlayQROnFrame(
                fadedFrameImageData,
                qrCode,
                foregroundColor,
                style,
                eyeStyle,
                dotScale,
                eyeScale,
                logoImg,
                0.75, // quietZone
                emptyCenter,
                smartColorMap
            );

            // 4. Add to GIF encoder
            // We need to draw the overlaid ImageData back to a canvas for gif.js
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = gifWidth;
            frameCanvas.height = gifHeight;
            const frameCtx = frameCanvas.getContext('2d');
            if (frameCtx) {
                frameCtx.putImageData(overlaidFrame, 0, 0);
                gif.addFrame(frameCanvas, { delay: delay || 100 });
            }

            // 5. RESTORE VIVID STATE for next loop iteration
            // This is crucial because standard GIF compression/composition relies on full color history
            ctx.putImageData(vividFrameImageData, 0, 0);

            // TODO: Handle disposal methods if needed (e.g. restore to background)
            // For simple GIFs, drawing over usually works, but strictly we should check frame.disposalType
            // gifuct-js doesn't explicitly give disposalType in the basic struct unless we dig deeper?
            // Actually 'frame' object from 'decompressFrames' has it. extractGifFrames returns custom object.
            // For now, let's assume 'draw over' (disposal = 1) is common.
            // If disposal = 2 (restore to background), we should clear the rect.
            // But let's verify if flickering happens. This implementation is 'draw over'.
        }

        // Render GIF
        return new Promise((resolve, reject) => {
            gif.on('finished', (blob) => {
                resolve(blob);
            });

            gif.on('error', (error) => {
                reject(error);
            });

            gif.render();
        });
    } catch (error) {
        console.error('Error generating animated QR:', error);
        throw error;
    }
}

/**
 * Helper to load image from File/Blob/URL
 */
/**
 * Helper to load image from File/Blob/URL
 */
function loadImage(src: string | Blob | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        if (src instanceof Blob) {
            img.src = URL.createObjectURL(src);
        } else {
            img.src = src;
        }
    });
}

/**
 * Add Frame and Text to the QR Canvas
 */
function addFrameToCanvas(innerCanvas: HTMLCanvasElement, options: GenerateOptions): HTMLCanvasElement {
    const { frame, frameColor = '#000000', frameText, frameTextColor = '#ffffff', frameTextPosition } = options;

    if (!frame || frame === 'none') return innerCanvas;

    const width = innerCanvas.width;
    const height = innerCanvas.height;

    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d')!;

    // FRAME CONFIGURATION
    const padding = 20; // Inner padding
    const extraSpaceForText = frameText ? 100 : 50; // Space for the text/frame bar

    // Calculate new dimensions based on frame style
    let newWidth = width + (padding * 2);
    let newHeight = height + (padding * 2);

    if (frame === 'simple' || frame === 'balloon') {
        newHeight += extraSpaceForText;
    }

    finalCanvas.width = newWidth;
    finalCanvas.height = newHeight;

    // Fill Background (if needed, or transparent)
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(0, 0, newWidth, newHeight);

    // DRAW FRAME
    ctx.fillStyle = frameColor;

    if (frame === 'simple') {
        // Simple Box with extended area for text
        // If text is bottom, extend bottom. If top, extend top.
        const isTop = frameTextPosition === 'top';

        // Draw Main Body
        // ctx.fillRect(0, 0, newWidth, newHeight); // Full fill

        // Advanced: Rounded container
        ctx.beginPath();
        const r = 20;
        ctx.roundRect(0, 0, newWidth, newHeight, r);
        ctx.fill();

        // Place QR
        // Center QR in the "remaining" space
        // If top text, QR pushed down.
        const qrX = padding;
        const qrY = isTop ? (extraSpaceForText + padding) : padding;

        // Draw Inner QR
        ctx.drawImage(innerCanvas, qrX, qrY);

        // Draw Text
        if (frameText) {
            ctx.fillStyle = frameTextColor;
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textX = newWidth / 2;
            const textY = isTop ? (extraSpaceForText / 2) : (newHeight - (extraSpaceForText / 2));

            ctx.fillText(frameText.toUpperCase(), textX, textY);
        }
    } else if (frame === 'balloon') {
        // Speech Bubble Style
        const isTop = frameTextPosition === 'top';

        ctx.beginPath();
        const r = 30;
        ctx.roundRect(0, 0, newWidth, newHeight, r);
        ctx.fill();

        // Tail (Triangle)
        ctx.beginPath();
        if (isTop) {
            // Tail at bottom of top section? No, balloon usually implies the whole thing is the bubble.
            // Let's make it look like a sticker.
        }

        const qrX = (newWidth - width) / 2;
        const qrY = isTop ? (extraSpaceForText + padding) : padding;

        ctx.drawImage(innerCanvas, qrX, qrY);

        // Text
        if (frameText) {
            ctx.fillStyle = frameTextColor;
            ctx.font = "bold 32px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const textX = newWidth / 2;
            const textY = isTop ? (extraSpaceForText / 2) : (newHeight - (extraSpaceForText / 2));
            ctx.fillText(frameText, textX, textY);
        }
    } else if (frame === 'phone') {
        // Mockup style phone
        // TODO: Implement later
        // Fallback to simple
        return addFrameToCanvas(innerCanvas, { ...options, frame: 'simple' });
    }

    return finalCanvas;
}

// ... generateStaticQR ... (Skipped here as key is typing helpers)

/**
 * Convert blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // as string because readAsDataURL returns string
            const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate static QR code
 */
// Force HMR update
/**
 * Generate static QR code
 */
// Force HMR update
export async function generateStaticQR(content: string, options: GenerateOptions = {}): Promise<Blob> {
    const {
        foregroundColor = '#000000',
        backgroundColor = '#ffffff',
        width = 640,
        height = 640,
        style = 'square',
        backgroundImage = null,
        eyeStyle = 'square',
        dotScale = 0.85,
        eyeScale = 1.0,
        ecLevel = 'H',
        logo = null,
        emptyCenter = false,
        // Frame Options
        frame = 'none',
        frameColor = '#000000',
        frameText = '',
        frameTextColor = '#ffffff',
        frameTextPosition = 'bottom',
        backgroundDimming = 0.75 // Default for consistency
    } = options;

    try {
        // Load logo if present
        const logoImg = logo ? await loadImage(logo) : null;

        // Generate QR matrix
        const qrCode = await generateQRMatrix(content, ecLevel);

        // Prepare Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        let smartColorMap: string[][] | null = null;

        if (backgroundImage) {
            // Load and draw background image
            const img = await loadImage(backgroundImage);

            // Draw image covering the canvas (object-fit: cover)
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // SAVE VIVID STATE (for color extraction)
            const vividImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Calculate Map based on Vivid Data + Opacity Awareness
            if (foregroundColor === 'auto') {
                smartColorMap = generateOptimizedColorMap(vividImageData, qrCode, 0.75, backgroundDimming);
            }

            // APPLY DIMMING OVERLAY
            ctx.fillStyle = `rgba(255, 255, 255, ${backgroundDimming})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

        } else {
            // Fill with solid background color
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Get ImageData from canvas (background - potentially faded)
        const frameImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Overlay QR
        // Note: overlayQROnFrame creates a NEW canvas/ImageData. 
        // We can just use the result.
        const resultImageData = overlayQROnFrame(
            frameImageData,
            qrCode,
            foregroundColor,
            style,
            eyeStyle,
            dotScale,
            eyeScale,
            logoImg,
            0.75, // quietZone
            emptyCenter,
            smartColorMap // Pass the calculated map
        );

        // Convert ImageData back to Canvas
        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = canvas.width;
        qrCanvas.height = canvas.height;
        const qrResultCtx = qrCanvas.getContext('2d');
        if (!qrResultCtx) throw new Error("Could not get qrResultCtx");
        qrResultCtx.putImageData(resultImageData, 0, 0);

        // --- FRAME COMPOSITION STEP ---
        const finalCanvas = addFrameToCanvas(qrCanvas, {
            frame,
            frameColor,
            frameText,
            frameTextColor,
            frameTextPosition
        });

        return new Promise((resolve) => {
            finalCanvas.toBlob(resolve, 'image/png');
        });
    } catch (error) {
        console.error('Error generating static QR:', error);
        throw error;
    }
}

/**
 * Convert blob to base64 string
 */

