import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { renderASCII } from '../utils/asciiRenderer';

interface FaceTrackerProps {
  enabled: boolean;
  asciiMode: boolean;
  colorMode: 'green' | 'white' | 'cyan';
  fontSize: number;
}

const COLOR_MAP = {
  green: '#00ff00',
  white: '#ffffff',
  cyan: '#00ffff',
} as const;

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
  
  // Ref to hold latest props for use in animation loop
  const propsRef = useRef({ enabled, asciiMode, colorMode, fontSize, isLoading });
  useEffect(() => {
    propsRef.current = { enabled, asciiMode, colorMode, fontSize, isLoading };
  });

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

    const video = videoRef.current;
    return () => {
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
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

  // Main processing loop
  useEffect(() => {
    if (!enabled) return;

    const processFrame = async () => {
      const { asciiMode, colorMode, fontSize, isLoading } = propsRef.current;
      
      if (!videoRef.current || !canvasRef.current || !outputCanvasRef.current) {
        animationRef.current = requestAnimationFrame(processFrame);
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

      if (asciiMode) {
        // Measure the actual character width for the current font/size/browser
        const safeFontSize = Number(fontSize) || 10;
        outputCtx.font = `${safeFontSize}px 'Courier New', monospace`;
        const actualCharWidth = outputCtx.measureText('M').width;
        const lineHeight = safeFontSize + 1;
        const padding = 8;

        // Calculate grid dimensions that will fill the output canvas
        const cols = Math.max(1, Math.floor((outputCanvas.width - padding * 2) / actualCharWidth));
        const rows = Math.max(1, Math.floor((outputCanvas.height - padding * 2) / lineHeight));

        // Sampling block size to evenly cover the source canvas
        const asciiArt = renderASCII(canvas, {
          charWidth: Math.max(1, Math.round(canvas.width / cols)),
          charHeight: Math.max(1, Math.round(canvas.height / rows)),
          maxWidth: cols,
          maxHeight: rows,
        });

        // Draw to output canvas
        outputCtx.fillStyle = '#000000';
        outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

        const color = COLOR_MAP[colorMode];
        outputCtx.fillStyle = color;
        outputCtx.textBaseline = 'top';

        const lines = asciiArt.split('\n');
        for (let i = 0; i < lines.length; i++) {
          outputCtx.fillText(lines[i], padding, padding + i * lineHeight);
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

              const color = COLOR_MAP[colorMode];
              outputCtx.strokeStyle = color;
              outputCtx.lineWidth = 3;

              detections.forEach((detection) => {
                const box = detection.box;
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
    };

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="alert alert-error text-sm absolute top-2 left-2 right-2 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-ring loading-lg text-success"></span>
            <span className="text-xs text-base-content/50">Loading face detection models…</span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <canvas
        ref={outputCanvasRef}
        className="w-full h-full block"
      />

      {!asciiMode && faceDetected && (
        <div className="badge badge-success gap-1 absolute top-3 right-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
          Face detected
        </div>
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
