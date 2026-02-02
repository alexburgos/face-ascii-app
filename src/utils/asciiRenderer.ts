// ASCII characters ordered by brightness (dark to light)
const ASCII_CHARS = '@%#*+=-:. ';

export interface ASCIIRenderOptions {
  charWidth?: number;
  charHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Convert canvas image data to ASCII art
 */
export function renderASCII(
  canvas: HTMLCanvasElement,
  options: ASCIIRenderOptions = {},
): string {
  const {
    charWidth = 10,
    charHeight = 14,
    maxWidth = 100,
    maxHeight = 60,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Get the width and height to sample
  const sampleWidth = Math.min(maxWidth, Math.floor(canvas.width / charWidth));
  const sampleHeight = Math.min(
    maxHeight,
    Math.floor(canvas.height / charHeight),
  );

  let asciiArt = '';

  for (let y = 0; y < sampleHeight; y++) {
    for (let x = 0; x < sampleWidth; x++) {
      // Get pixel position
      const pixelX = Math.floor((x * canvas.width) / sampleWidth);
      const pixelY = Math.floor((y * canvas.height) / sampleHeight);

      // Get image data for a small block
      const imageData = ctx.getImageData(pixelX, pixelY, charWidth, charHeight);
      const data = imageData.data;

      // Calculate average brightness
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        // Weighted luminance calculation
        brightness += (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
      }
      brightness = brightness / (charWidth * charHeight * 255);

      // Map brightness to ASCII character
      const charIndex = Math.floor(brightness * (ASCII_CHARS.length - 1));
      asciiArt += ASCII_CHARS[charIndex];
    }
    asciiArt += '\n';
  }

  return asciiArt;
}

/**
 * Render ASCII art to canvas with styling
 */
export function drawASCIIToCanvas(
  asciiText: string,
  canvas: HTMLCanvasElement,
  fontSize = 10,
  textColor = '#00ff00',
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set up font
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'top';

  // Draw ASCII art
  const lines = asciiText.split('\n');
  const lineHeight = fontSize + 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 10, 10 + i * lineHeight);
  }
}

/**
 * Get optimal ASCII render settings based on canvas size
 */
export function getOptimalSettings(
  canvasWidth: number,
  canvasHeight: number,
): ASCIIRenderOptions {
  const scale = Math.max(canvasWidth, canvasHeight) / 1000;
  return {
    charWidth: Math.max(8, Math.floor(10 * scale)),
    charHeight: Math.max(12, Math.floor(14 * scale)),
    maxWidth: Math.floor(canvasWidth / 12),
    maxHeight: Math.floor(canvasHeight / 16),
  };
}
