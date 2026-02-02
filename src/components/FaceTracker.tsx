import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import { renderASCII, getOptimalSettings } from '../utils/asciiRenderer';

interface FaceTrackerProps {
  enabled: boolean;
  asciiMode: boolean;
  colorMode: 'green' | 'white' | 'cyan';
  fontSize: number;
}

const FaceTracker: React.FC<FaceTrackerProps> = React.memo(({
  enabled,
  asciiMode,
  colorMode,
  fontSize,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const faceDetectionRef = useRef(false);
  const detectionIntervalRef = useRef(10); // Every 10 frames
  const frameCountRef = useRef(0); // For throttling detection

  // Initialize canvas with default dimensions
  useEffect(() => {
    if (outputCanvasRef.current && canvasRef.current) {
      // Set initial size to match aspect ratio (4:3 at 640x480)
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
      outputCanvasRef.current.width = 640;
      outputCanvasRef.current.height = 480;
    }
  }, []);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load face detection models');
        console.error(err);
      }
    };

    loadModels();
  }, []);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      if (!enabled || !videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          videoRef.current.play().catch((err) => {
            console.error('Video play failed:', err);
          });
        }
      } catch (err) {
        setError('Failed to access webcam. Please check permissions.');
        console.error('Webcam error:', err);
      }
    };

    initWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [enabled]);

  // Set up canvas size when video is ready
  useEffect(() => {
    const handleVideoLoadedMetadata = () => {
      if (videoRef.current && canvasRef.current && outputCanvasRef.current) {
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        outputCanvasRef.current.width = width;
        outputCanvasRef.current.height = height;
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleVideoLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleVideoLoadedMetadata);
    }
  }, []);

  // Memoize color map
  const colorMap = useMemo(() => ({
    green: '#00ff00',
    white: '#ffffff',
    cyan: '#00ffff',
  }), []);

  // Memoize optimal settings
  const settings = useMemo(() => {
    if (canvasRef.current && asciiMode) {
      return getOptimalSettings(canvasRef.current.width, canvasRef.current.height);
    }
    return null;
  }, [asciiMode]);

  // Main processing loop
  const processFrame = useCallback(async () => {
    if (!enabled || !videoRef.current || !canvasRef.current || !outputCanvasRef.current) {
      if (enabled) {
        animationRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const outputCtx = outputCanvas.getContext('2d');

    if (!ctx || !outputCtx) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Draw video frame to processing canvas
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error('Canvas draw error:', err);
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (asciiMode && settings) {
      // ASCII rendering
      const asciiArt = renderASCII(canvas, settings);

      // Draw to output canvas
      outputCtx.fillStyle = '#000000';
      outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

      const color = colorMap[colorMode];
      outputCtx.fillStyle = color;
      outputCtx.font = `${fontSize}px 'Courier New', monospace`;
      outputCtx.textBaseline = 'top';

      const lines = asciiArt.split('\n');
      const lineHeight = fontSize + 1;

      for (let i = 0; i < lines.length; i++) {
        outputCtx.fillText(lines[i], 8, 8 + i * lineHeight);
      }
    } else {
      // Regular video with face highlight
      try {
        outputCtx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
      } catch (err) {
        console.error('Output canvas draw error:', err);
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Throttle face detection for performance
      frameCountRef.current++;
      if (frameCountRef.current >= detectionIntervalRef.current) {
        frameCountRef.current = 0;
        try {
          if (!isLoading) {
            const detections = await faceapi.detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions()
            );
            faceDetectionRef.current = detections.length > 0;
            setFaceDetected(detections.length > 0);

            const color = colorMap[colorMode];
            outputCtx.strokeStyle = color;
            outputCtx.lineWidth = 3;

            detections.forEach((detection) => {
              const box = detection.detection.box;
              outputCtx.strokeRect(box.x, box.y, box.width, box.height);

              // Draw face position indicator
              const centerX = box.x + box.width / 2;
              const centerY = box.y + box.height / 2;
              outputCtx.fillStyle = color;
              outputCtx.beginPath();
              outputCtx.arc(centerX, centerY, 5, 0, Math.PI * 2);
              outputCtx.fill();
            });
          }
        } catch (err) {
          console.error('Face detection error:', err);
        }
      } else if (faceDetectionRef.current) {
        // Show previous face detection result without re-detecting
        setFaceDetected(true);
      }
    }

    animationRef.current = requestAnimationFrame(processFrame);
  }, [enabled, asciiMode, colorMode, fontSize, isLoading, colorMap, settings]);

  // Start processing loop
  useEffect(() => {
    if (enabled) {
      animationRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, processFrame]);

  return (
    <div className="face-tracker">
      {error && <div className="error">{error}</div>}
      {isLoading && <div className="loading">Loading face detection models...</div>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="video-hidden"
      />

      <canvas
        ref={canvasRef}
        className="canvas-hidden"
      />

      <canvas
        ref={outputCanvasRef}
        className="output-canvas"
      />

      {!asciiMode && faceDetected && (
        <div className="face-indicator">✓ Face detected</div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return (
    prevProps.enabled === nextProps.enabled &&
    prevProps.asciiMode === nextProps.asciiMode &&
    prevProps.colorMode === nextProps.colorMode &&
    prevProps.fontSize === nextProps.fontSize
  );
});

FaceTracker.displayName = 'FaceTracker';

export default FaceTracker;
