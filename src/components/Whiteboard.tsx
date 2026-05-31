"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Square, 
  Grid3X3, 
  Trash2, 
  Undo2, 
  Redo2, 
  Paintbrush, 
  Highlighter, 
  Eraser, 
  Activity
} from "lucide-react";

interface WhiteboardProps {
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
  onDrawingChange?: (dataUrl: string) => void;
  handCursor?: { x: number; y: number; isDrawing: boolean } | null;
}

export default function Whiteboard({
  onCanvasRef,
  onDrawingChange,
  handCursor
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Whiteboard States
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [brushColor, setBrushColor] = useState("#00f2fe"); // Neon Cyan
  const [brushSize, setBrushSize] = useState(4);
  const [bgType, setBgType] = useState<"grid" | "dot" | "blank">("grid");
  
  // History Undo/Redo Stacks
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Pen Color Choices
  const colors = [
    { name: "Cyan", value: "#00f2fe" },
    { name: "Purple", value: "#c850c0" },
    { name: "Blue", value: "#4facfe" },
    { name: "Green", value: "#00ff87" },
    { name: "Orange", value: "#ff9900" },
    { name: "White", value: "#ffffff" }
  ];

  // Set up canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 600;
      
      let savedImage: ImageData | null = null;
      if (contextRef.current) {
        try {
          savedImage = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          console.warn("Failed to backup canvas before resize:", e);
        }
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;
        onCanvasRef?.(canvas);
        
        if (savedImage) {
          context.putImageData(savedImage, 0, 0);
        } else {
          clearCanvas(false);
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [onCanvasRef]);

  // Handle external webcam cursor drawing
  useEffect(() => {
    if (!handCursor || !canvasRef.current || !contextRef.current) return;
    const ctx = contextRef.current;
    
    const x = handCursor.x * canvasRef.current.width;
    const y = handCursor.y * canvasRef.current.height;

    ctx.save();
    if (handCursor.isDrawing) {
      ctx.lineWidth = tool === "eraser" ? brushSize * 4 : tool === "highlighter" ? brushSize * 3 : brushSize;
      ctx.strokeStyle = tool === "eraser" ? "#070913" : tool === "highlighter" ? `${brushColor}55` : brushColor;
      
      ctx.globalCompositeOperation = "source-over";

      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      
      triggerDrawingChange();
    }
    ctx.restore();
  }, [handCursor]);

  // Drawing event handlers for Mouse/Touch/Stylus (PointerEvents)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);

    let currentWidth = brushSize;
    if (e.pointerType === "pen" && e.pressure > 0) {
      currentWidth = brushSize * e.pressure * 2.0;
    }
    ctx.lineWidth = tool === "eraser" ? brushSize * 6 : tool === "highlighter" ? brushSize * 3.5 : currentWidth;
    ctx.strokeStyle = tool === "eraser" ? "#070913" : tool === "highlighter" ? `${brushColor}44` : brushColor;
    
    setIsDrawing(true);

    ctx.lineTo(x + 0.1, y);
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !contextRef.current) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = contextRef.current;
    
    let currentWidth = brushSize;
    if (e.pointerType === "pen" && e.pressure > 0) {
      currentWidth = brushSize * e.pressure * 2.0;
    }
    ctx.lineWidth = tool === "eraser" ? brushSize * 6 : tool === "highlighter" ? brushSize * 3.5 : currentWidth;
    ctx.strokeStyle = tool === "eraser" ? "#070913" : tool === "highlighter" ? `${brushColor}44` : brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !contextRef.current) return;
    
    e.preventDefault();
    canvasRef.current.releasePointerCapture(e.pointerId);
    contextRef.current.closePath();
    setIsDrawing(false);
    
    saveHistoryState();
    triggerDrawingChange();
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    try {
      const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(currentSnapshot);
      
      if (nextHistory.length > 25) {
        nextHistory.shift();
      }

      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    } catch (e) {
      console.error("Failed to save undo history state:", e);
    }
  };

  const handleUndo = () => {
    if (historyIndex <= 0 || !canvasRef.current || !contextRef.current) return;
    const prevIndex = historyIndex - 1;
    const ctx = contextRef.current;
    ctx.putImageData(history[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
    triggerDrawingChange();
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current || !contextRef.current) return;
    const nextIndex = historyIndex + 1;
    const ctx = contextRef.current;
    ctx.putImageData(history[nextIndex], 0, 0);
    setHistoryIndex(nextIndex);
    triggerDrawingChange();
  };

  const clearCanvas = (resetHistoryState: boolean = true) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (resetHistoryState) {
      setTimeout(() => {
        saveHistoryState();
        triggerDrawingChange();
      }, 50);
    }
  };

  const triggerDrawingChange = () => {
    if (!canvasRef.current || !onDrawingChange) return;
    onDrawingChange(canvasRef.current.toDataURL());
  };

  return (
    <div className="glass-panel">
      
      {/* 1. Header Toolbar */}
      <div className="card-header">
        
        {/* Tool selection group */}
        <div className="wb-toolbar-group">
          <button 
            onClick={() => setTool("pen")}
            className={`wb-toolbar-btn wb-toolbar-btn-pen ${tool === "pen" ? "active" : ""}`}
            title="Sleek stylus pen"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setTool("highlighter")}
            className={`wb-toolbar-btn wb-toolbar-btn-highlighter ${tool === "highlighter" ? "active" : ""}`}
            title="Semi-transparent highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setTool("eraser")}
            className={`wb-toolbar-btn wb-toolbar-btn-eraser ${tool === "eraser" ? "active" : ""}`}
            title="Brush eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic color picker (hidden if eraser is selected) */}
        {tool !== "eraser" && (
          <div className="flex items-center gap-1.5 px-1">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setBrushColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`wb-color-dot ${brushColor === c.value ? "active" : ""}`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Thickness slider */}
        <div className="wb-slider-wrapper">
          <span className="wb-slider-label">Size</span>
          <input 
            type="range"
            min="2"
            max="40"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="wb-size-slider"
          />
          <span className="wb-slider-value">{brushSize}px</span>
        </div>

        {/* Grid backgrounds */}
        <div className="wb-toolbar-group">
          <button 
            onClick={() => setBgType("grid")}
            className={`wb-toolbar-btn ${bgType === "grid" ? "wb-toolbar-btn-pen active" : ""}`}
            title="Math coordinate grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setBgType("dot")}
            className={`wb-toolbar-btn ${bgType === "dot" ? "wb-toolbar-btn-eraser active" : ""}`}
            title="Dotted paper"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setBgType("blank")}
            className={`wb-toolbar-btn ${bgType === "blank" ? "wb-toolbar-btn-eraser active" : ""}`}
            title="Blank notebook"
          >
            <div className="w-4 h-4 rounded border border-slate-500 bg-transparent" />
          </button>
        </div>

        {/* History actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="btn-neon btn-neon-sm"
            title="Undo drawing stroke"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="btn-neon btn-neon-sm"
            title="Redo drawing stroke"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => clearCanvas(true)}
            className="btn-neon btn-neon-rose btn-neon-sm"
            title="Clear whiteboard board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Drawing Area Canvas */}
      <div className="wb-canvas-area">
        
        {/* Background Grids Layer */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
          bgType === "grid" ? "canvas-grid-square" : bgType === "dot" ? "canvas-grid-dot" : ""
        }`} />

        {/* Core Canvas element */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="wb-canvas-el"
        />

        {/* Hand Cursor Virtual Overlay */}
        {handCursor && (
          <div 
            className={`wb-hand-cursor ${handCursor.isDrawing ? "drawing" : ""}`}
            style={{ 
              left: `${handCursor.x * 100}%`, 
              top: `${handCursor.y * 100}%`
            }}
          >
            <div className="wb-hand-cursor-dot" />
          </div>
        )}

        {/* Canvas coordinates grid labels */}
        {bgType === "grid" && (
          <div className="wb-grid-indicator">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Active Math Whiteboard (40px Scale)
          </div>
        )}
      </div>
    </div>
  );
}
