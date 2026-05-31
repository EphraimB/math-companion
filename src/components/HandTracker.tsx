"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, CameraOff, Sparkles, HelpCircle, X } from "lucide-react";

interface HandTrackerProps {
  onCursorMove?: (cursor: { x: number; y: number; isDrawing: boolean } | null) => void;
}

export default function HandTracker({ onCursorMove }: HandTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isPinching, setIsPinching] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);

  // 1. Dynamic Script Loader for MediaPipe CDN
  useEffect(() => {
    if (scriptsLoaded) return;

    let handsScript: HTMLScriptElement | null = null;
    let cameraScript: HTMLScriptElement | null = null;

    const loadScripts = async () => {
      try {
        handsScript = document.createElement("script");
        handsScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        handsScript.async = true;
        document.body.appendChild(handsScript);

        await new Promise((resolve, reject) => {
          if (handsScript) {
            handsScript.onload = resolve;
            handsScript.onerror = () => reject(new Error("Failed to load MediaPipe Hands script"));
          }
        });

        cameraScript = document.createElement("script");
        cameraScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
        cameraScript.async = true;
        document.body.appendChild(cameraScript);

        await new Promise((resolve, reject) => {
          if (cameraScript) {
            cameraScript.onload = resolve;
            cameraScript.onerror = () => reject(new Error("Failed to load MediaPipe Camera Utilities"));
          }
        });

        setScriptsLoaded(true);
      } catch (err: any) {
        console.error("Scripts loading failed:", err);
        setLoadError("Webcam hand-tracking scripts could not load. Check network connection.");
      }
    };

    loadScripts();

    return () => {
      if (handsScript && document.body.contains(handsScript)) {
        document.body.removeChild(handsScript);
      }
      if (cameraScript && document.body.contains(cameraScript)) {
        document.body.removeChild(cameraScript);
      }
    };
  }, []);

  // 2. Initialize MediaPipe Hands & Webcam when activated
  useEffect(() => {
    if (!isActive || !scriptsLoaded || !videoRef.current || !canvasRef.current) {
      cleanupCamera();
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;

    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results: any) => {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        drawSkeleton(canvasCtx, landmarks, canvasElement.width, canvasElement.height);

        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dz = indexTip.z - thumbTip.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const isDrawingPinch = distance < 0.045;
        setIsPinching(isDrawingPinch);

        const cursorX = 1 - indexTip.x;
        const cursorY = indexTip.y;

        onCursorMove?.({
          x: cursorX,
          y: cursorY,
          isDrawing: isDrawingPinch,
        });

        drawCursorIndicator(canvasCtx, indexTip, isDrawingPinch, canvasElement.width, canvasElement.height);
      } else {
        setIsPinching(false);
        onCursorMove?.(null);
      }
    });

    handsRef.current = hands;

    const camera = new (window as any).Camera(videoElement, {
      onFrame: async () => {
        if (isActive && videoElement) {
          try {
            await hands.send({ image: videoElement });
          } catch (e) {
            console.warn("MediaPipe frame send error:", e);
          }
        }
      },
      width: 320,
      height: 240,
    });

    camera.start()
      .then(() => {
        cameraRef.current = camera;
      })
      .catch((err: any) => {
        console.error("Camera access failed:", err);
        setLoadError("Webcam access was denied or is blocked by another program.");
        setIsActive(false);
      });

    return () => {
      cleanupCamera();
    };
  }, [isActive, scriptsLoaded]);

  const cleanupCamera = () => {
    onCursorMove?.(null);
    setIsPinching(false);
    
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {}
      cameraRef.current = null;
    }
    
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (e) {}
      handsRef.current = null;
    }
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number) => {
    ctx.strokeStyle = "#4facfe";
    ctx.lineWidth = 2.5;

    const joints = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17] // Pinky
    ];

    joints.forEach(([s, e]) => {
      const start = landmarks[s];
      const end = landmarks[e];
      ctx.beginPath();
      ctx.moveTo((1 - start.x) * w, start.y * h);
      ctx.lineTo((1 - end.x) * w, end.y * h);
      ctx.stroke();
    });

    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc((1 - pt.x) * w, pt.y * h, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00f2fe";
      ctx.fill();
    });
  };

  const drawCursorIndicator = (ctx: CanvasRenderingContext2D, indexTip: any, isDrawing: boolean, w: number, h: number) => {
    const x = (1 - indexTip.x) * w;
    const y = indexTip.y * h;

    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = isDrawing ? "#00f2fe" : "#c850c0";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (isDrawing) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00f2fe";
      ctx.fill();
    }
  };

  return (
    <div className="glass-panel">
      
      {/* 1. Header controls */}
      <div className="card-header">
        <div className="card-header-title">
          <Sparkles className="w-4 h-4 text-[var(--neon-purple)] animate-pulse" />
          <span>Webcam Hand-Tracking</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="btn-neon btn-neon-sm"
            style={{ padding: '0.375rem' }}
            title="Show gestures instructions tutorial"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            disabled={!scriptsLoaded}
            className={`btn-neon btn-neon-sm ${isActive ? "btn-neon-rose" : "btn-neon-purple"}`}
          >
            {isActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" /> Stop Tracking
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" /> Start Webcam
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Load Errors */}
        {loadError && (
          <div className="alert-box">
            ⚠️ {loadError}
          </div>
        )}

        {/* Tutorial panel */}
        {showTutorial && (
          <div className="tracker-tutorial-panel">
            <button 
              onClick={() => setShowTutorial(false)}
              className="tracker-tutorial-close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="tracker-tutorial-title">✨ Pinch-to-Write Air Gestures:</p>
            <ul className="tracker-tutorial-list">
              <li><strong>Hover Mode</strong>: Open your hand. A pink cursor will trace your index finger tip.</li>
              <li><strong>Draw Mode</strong>: Pinch your thumb and index finger together. The cursor will glow cyan and draw strokes on the whiteboard in real-time!</li>
              <li>Make sure your webcam captures your hand in clear lighting.</li>
            </ul>
          </div>
        )}

        {/* Webcam and Skeleton Layer viewports */}
        {isActive && (
          <div className="tracker-skeleton-box">
            <video
              ref={videoRef}
              className="tracker-video-feed"
              playsInline
              muted
            />

            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="tracker-canvas-overlay"
            />

            {/* Live pinch-status overlay */}
            <div className="tracker-status-toast">
              <div className={`tracker-indicator-dot ${isPinching ? "active" : ""}`} />
              {isPinching ? (
                <span className="tracker-status-text-cyan">Pinching (Drawing)</span>
              ) : (
                <span className="tracker-status-text-slate">Hovering pointer</span>
              )}
            </div>
          </div>
        )}

        {!isActive && (
          <div className="fallback-alert-info">
            <span className="text-[var(--neon-purple)]">💡</span>
            <span>
              Have a webcam? Activate it to try modern air-writing! Control the whiteboard cursor entirely in the air by pinching your thumb and index finger.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
