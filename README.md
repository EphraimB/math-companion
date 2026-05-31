# 🧠 Math Companion

An interactive, high-fidelity math learning workspace designed to guide you step-by-step through your math journey, starting with **Algebra II**.

Math Companion is built to be **100% serverless and offline-ready**, compiled as a Next.js static site export. It does not rely on any remote AI models, processing all handwriting recognition, camera hand tracking, and math checking completely client-side in the user's browser.

---

## ✨ Features

- **🎨 Advanced Interactive Whiteboard**:
  - Full pointer support optimized for active styluses (e.g., Apple Pencil, Surface Pen) with pressure-sensitive strokes.
  - Variable-size Pens, Erasers, and semi-transparent Highlighters.
  - Multiple backing templates including coordinate planes, dot-grids, and clean paper.
  - Native browser-based Undo & Redo stack.

- **🖐️ Webcam Hand-Tracking (Mid-Air Writing)**:
  - Powered by local **MediaPipe Hands** compiled entirely inside the browser.
  - **Pinch-to-Draw air gesture**: Pinch your index and thumb together to draw. Open your hand to hover and navigate.
  - Mirrored camera feeds mapped relative to the canvas coordinate plane with joint bones skeleton rendering overlay.

- **📷 Local Handwriting Image OCR Fallback**:
  - Local processing utilizing **Tesseract.js** running in an offline Web Worker inside the browser.
  - Drag and drop or browse standard images to extract written text and load them as solvers.
  - **Scan Whiteboard Mode**: Directly capture your whiteboard strokes, run OCR on the canvas image, and feed equations into the tutor.

- **🤖 Deterministic AI-Style Companion ("Sigma")**:
  - A space-themed, animated glassmorphic dashboard assistant.
  - Pure rules-based, step-by-step Algebra II course solver (Quadratics, Exponentials, Logarithms, Trigonometry).
  - Programmatic checking logic supporting factoring formulations and root sorting variations.
  - **Automated Coordinate Plotter**: Interactive function curve rendering. Instruct Sigma to plot graphs (like parabolas) directly onto the whiteboard's active coordinate plane!

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed.

### Installation

Install local packages inside the project root:

```bash
npm install
```

### Run Local Development Server

Fire up the development environment:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the Math Companion.

### 📦 Static HTML Export (Launch Build)

Math Companion is configured to build as a fully static, serverless export. To compile the website:

```bash
npm run build
```

This generates an `/out` directory containing plain, standalone HTML/CSS/JS assets that can be hosted on:
- GitHub Pages
- Vercel (Static)
- Netlify / Cloudflare Pages
- Standard AWS S3 / Nginx server blocks
