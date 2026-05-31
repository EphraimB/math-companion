"use client";

import React, { useState, useRef } from "react";
import Whiteboard from "@/components/Whiteboard";
import MathTutor from "@/components/MathTutor";
import HandTracker from "@/components/HandTracker";
import ImageOCR from "@/components/ImageOCR";
import { Sparkles, BrainCircuit } from "lucide-react";

export default function MathCompanionDashboard() {
  // Shared States between whiteboard and helpers
  const [whiteboardDataUrl, setWhiteboardDataUrl] = useState<string | null>(null);
  const [ocrTextResult, setOcrTextResult] = useState<string | null>(null);
  const [handTrackingCursor, setHandTrackingCursor] = useState<{ x: number; y: number; isDrawing: boolean } | null>(null);
  
  // Canvas reference to plot functions directly onto the whiteboard
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core callback when whiteboard draws or clears
  const handleWhiteboardChange = (dataUrl: string) => {
    setWhiteboardDataUrl(dataUrl);
  };

  // Capture canvas reference from Whiteboard component
  const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  };

  // OCR result transfer pipeline
  const handleOcrResult = (text: string) => {
    setOcrTextResult(text);
  };

  // Webcam Cursor movement pipeline
  const handleHandCursorMove = (cursor: { x: number; y: number; isDrawing: boolean } | null) => {
    setHandTrackingCursor(cursor);
  };

  // Advanced Automated Function Graphing logic (Plots curves and draws grids)
  const handlePlotFunction = (graphFnStr: string, label: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const originX = w / 2;
    const originY = h / 2;
    const scale = 40; // 1 coordinate unit = 40 pixels (matching CSS grids)

    ctx.save();
    
    // 1. Draw coordinate axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(255, 255, 255, 0.1)";

    // Horizontal X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.stroke();

    // Vertical Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Draw ticks and labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Horizontal ticks every 40px
    for (let xOffset = 40; originX + xOffset < w; xOffset += 40) {
      const val = xOffset / 40;
      ctx.fillRect(originX + xOffset, originY - 3, 1, 6);
      ctx.fillText(val.toString(), originX + xOffset, originY + 6);
    }
    for (let xOffset = -40; originX + xOffset > 0; xOffset -= 40) {
      const val = xOffset / 40;
      ctx.fillRect(originX + xOffset, originY - 3, 1, 6);
      ctx.fillText(val.toString(), originX + xOffset, originY + 6);
    }

    // Vertical ticks
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let yOffset = 40; originY + yOffset < h; yOffset += 40) {
      const val = -yOffset / 40;
      ctx.fillRect(originX - 3, originY + yOffset, 6, 1);
      ctx.fillText(val.toString(), originX - 8, originY + yOffset);
    }
    for (let yOffset = -40; originY + yOffset > 0; yOffset -= 40) {
      const val = -yOffset / 40;
      ctx.fillRect(originX - 3, originY + yOffset, 6, 1);
      ctx.fillText(val.toString(), originX - 8, originY + yOffset);
    }

    // 2. Plot mathematical curve
    try {
      const fn = new Function("x", `return ${graphFnStr}`) as (x: number) => number;
      
      ctx.beginPath();
      ctx.strokeStyle = "#c850c0"; // Neon purple curve
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(200, 80, 192, 0.6)";

      let isFirst = true;

      // Scan canvas horizontally to plot points
      for (let screenX = 0; screenX < w; screenX++) {
        const x = (screenX - originX) / scale;
        const y = fn(x);
        
        if (isNaN(y) || !isFinite(y)) continue;

        const screenY = originY - y * scale;

        if (screenY >= -100 && screenY <= h + 100) {
          if (isFirst) {
            ctx.moveTo(screenX, screenY);
            isFirst = false;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
      }
      ctx.stroke();

      // 3. Highlight roots & vertices visually
      if (graphFnStr.includes("x * x - 4 * x - 5")) {
        // y = x^2 - 4x - 5 has roots at x=5, x=-1, vertex at (2, -9)
        drawGlowingAnchor(ctx, originX + 5 * scale, originY, "Root: (5, 0)");
        drawGlowingAnchor(ctx, originX - 1 * scale, originY, "Root: (-1, 0)");
        drawGlowingAnchor(ctx, originX + 2 * scale, originY + 9 * scale, "Vertex: (2, -9)");
      } else if (graphFnStr.includes("Math.pow(3, 2 * x - 1) - 27")) {
        // 3^(2x-1) = 27 has root at x=2
        drawGlowingAnchor(ctx, originX + 2 * scale, originY, "Root: (2, 0)");
      } else if (graphFnStr.includes("x - 2") && graphFnStr.includes("- 3")) {
        // log system root at x=4
        drawGlowingAnchor(ctx, originX + 4 * scale, originY, "Root: (4, 0)");
      }

    } catch (e) {
      console.error("Function evaluation error:", e);
    }

    ctx.restore();
  };

  // Helper to draw glowing node coordinates
  const drawGlowingAnchor = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00f2fe"; // Neon cyan
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#00f2fe";
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px 'Inter', sans-serif";
    ctx.fillText(text, x + 8, y - 8);
    ctx.restore();
  };

  return (
    <div className="app-container">
      
      {/* 1. Header Navigation Navbar */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-icon-wrap">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="logo-title">
              Math Companion 
              <span className="logo-badge">
                v1.0-static
              </span>
            </h1>
            <p className="logo-subtitle">Interactive Whiteboard & Hand-Tracking Algebra II Workspace</p>
          </div>
        </div>

        {/* Brand status indicator */}
        <div className="header-status-badge">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fully Offline-Ready (Static)</span>
        </div>
      </header>

      {/* 2. Main Dashboard Grid Layout */}
      <main className="dashboard-grid">
        
        {/* Left Side: Whiteboard Canvas (Spans 3/5 width) */}
        <div className="whiteboard-column">
          <Whiteboard 
            onCanvasRef={handleCanvasRef}
            onDrawingChange={handleWhiteboardChange}
            handCursor={handTrackingCursor}
          />
        </div>

        {/* Right Side: Tutor & Fallbacks Dashboard (Spans 2/5 width) */}
        <div className="sidebar-column">
          
          {/* Top Section: Algebra 2 Tutoring Guide */}
          <div className="tutor-widget-container">
            <MathTutor 
              onPlotRequest={handlePlotFunction}
              ocrInput={ocrTextResult}
            />
          </div>

          {/* Bottom Section: MediaPipe Hand Tracker & Tesseract Image OCR (Horizontal Split) */}
          <div className="fallbacks-row-container">
            
            {/* Hand-Tracking Viewport */}
            <HandTracker onCursorMove={handleHandCursorMove} />

            {/* Handwriting Image OCR Dropzone */}
            <ImageOCR 
              whiteboardDataUrl={whiteboardDataUrl}
              onOcrResult={handleOcrResult}
            />

          </div>

        </div>

      </main>
    </div>
  );
}
