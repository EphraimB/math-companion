"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Upload, Eye, ClipboardCopy, Wand2, FileImage } from "lucide-react";

interface ImageOCRProps {
  whiteboardDataUrl?: string | null;
  onOcrResult?: (text: string) => void;
}

export default function ImageOCR({ whiteboardDataUrl, onOcrResult }: ImageOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Run OCR on standard file upload
  const processImage = async (file: File) => {
    if (!file) return;

    // Build preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setProgress(0);
    setStatusText("Initializing OCR...");

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatusText(`Decoding: ${Math.round(m.progress * 100)}%`);
          } else {
            setStatusText(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
          }
        },
      });

      const text = cleanOcrResult(result.data.text);
      setOcrText(text);
      setStatusText("Complete!");
      onOcrResult?.(text);
    } catch (error) {
      console.error("Tesseract local OCR error:", error);
      setStatusText("Error scanning image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run OCR directly on the active Whiteboard Canvas snapshot
  const processWhiteboardDrawing = async () => {
    if (!whiteboardDataUrl) {
      setStatusText("Write on whiteboard first!");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setImagePreview(whiteboardDataUrl);
    setStatusText("Analyzing whiteboard...");

    try {
      const result = await Tesseract.recognize(whiteboardDataUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatusText(`Reading: ${Math.round(m.progress * 100)}%`);
          } else {
            setStatusText(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
          }
        },
      });

      const text = cleanOcrResult(result.data.text);
      setOcrText(text);
      setStatusText("Complete!");
      onOcrResult?.(text);
    } catch (error) {
      console.error("Whiteboard OCR error:", error);
      setStatusText("Failed to read whiteboard.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const cleanOcrResult = (rawText: string): string => {
    let text = rawText.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/o/gi, "0");
    text = text.replace(/l/gi, "1");
    text = text.replace(/[–—]/g, "-");
    return text;
  };

  return (
    <div className="glass-panel" style={{ minHeight: '250px' }}>
      
      <div className="card-header">
        <div className="card-header-title">
          <Upload className="w-4 h-4 text-[var(--neon-cyan)]" />
          <span>Image OCR Fallback</span>
        </div>
        
        {whiteboardDataUrl && (
          <button
            onClick={processWhiteboardDrawing}
            disabled={isProcessing}
            className="btn-neon btn-neon-sm"
            title="Perform local OCR directly on whiteboard canvas content"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Scan Canvas
          </button>
        )}
      </div>

      <div className="card-body">
        {/* Upload Drag & Drop Interface */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="ocr-drop-zone"
        >
          <input 
            type="file" 
            id="ocr-file-upload" 
            accept="image/*" 
            onChange={handleFileChange}
            className="ocr-file-input"
            disabled={isProcessing}
          />
          
          {imagePreview ? (
            <div className="ocr-preview-container">
              <img 
                src={imagePreview} 
                alt="Scan source" 
                className="ocr-preview-img" 
              />
              <div className="ocr-preview-gradient">
                <span className="ocr-preview-tag">
                  Uploaded Image Preview
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="ocr-drop-icon-wrap">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <p className="ocr-drop-title">Drag & drop handwritten image</p>
                <p className="ocr-drop-subtitle">or click to browse local files (PNG, JPEG)</p>
              </div>
            </div>
          )}
        </div>

        {/* OCR Status & Processing meter */}
        {isProcessing && (
          <div className="ocr-progress-card">
            <div className="ocr-progress-meta">
              <span className="ocr-progress-status">{statusText}</span>
              <span className="ocr-progress-percent">{progress}%</span>
            </div>
            <div className="ocr-progress-track">
              <div 
                style={{ width: `${progress}%` }} 
                className="ocr-progress-bar"
              />
            </div>
          </div>
        )}

        {/* OCR Output Text area */}
        {ocrText && !isProcessing && (
          <div className="flex flex-col gap-2">
            <div className="ocr-output-meta">
              <span className="ocr-output-label">Extracted Equation:</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(ocrText);
                  setStatusText("Copied!");
                  setTimeout(() => setStatusText(""), 1500);
                }}
                className="ocr-output-copy-btn"
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
                {statusText || "Copy"}
              </button>
            </div>
            <div className="ocr-output-box">
              <span>{ocrText}</span>
              <button
                onClick={() => onOcrResult?.(ocrText)}
                className="ocr-output-inspect-btn"
                title="Load equation into intermediate math solver"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Info indicator */}
        {!ocrText && !isProcessing && (
          <div className="fallback-alert-info">
            <span className="text-[var(--neon-cyan)]">ℹ</span>
            <span>
              Offline fallback: upload a snapshot of your notebook. Tesseract OCR will read your handwriting in the browser and load equations directly.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
