"use client";

import React, { useState, useEffect } from "react";
import katex from "katex";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  HelpCircle
} from "lucide-react";

// Safe, lightweight client-side LaTeX renderer using standard KaTeX
export function MathFormula({ formula, block = false }: { formula: string; block?: boolean }) {
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode: block,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} className="inline-block max-w-full overflow-x-auto vertical-align-middle" />;
  } catch (e) {
    return <code className="font-mono text-slate-300">{formula}</code>;
  }
}

// Curriculum Structs
interface Step {
  id: number;
  prompt: string;
  placeholder: string;
  expectedAnswers: string[]; 
  hint: string;
  successMessage: string;
}

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  formula: string;
  graphFn?: string; 
  steps: Step[];
}

interface MathTutorProps {
  onPlotRequest?: (plotFnStr: string, equationLabel: string) => void;
  ocrInput?: string | null;
}

export default function MathTutor({ onPlotRequest, ocrInput }: MathTutorProps) {
  // Curriculum data starting with Algebra 2
  const chapters: Chapter[] = [
    {
      id: 1,
      title: "1. Quadratic Equations",
      subtitle: "Factoring & Roots",
      description: "Factor and solve a standard quadratic function. Learn to find the x-intercepts visually on a coordinate plane.",
      formula: "x^2 - 4x - 5 = 0",
      graphFn: "x * x - 4 * x - 5", 
      steps: [
        {
          id: 1,
          prompt: "Factor the quadratic equation into the form (x-a)(x+b) = 0. What is the factored expression?",
          placeholder: "e.g. (x-a)(x+b)=0",
          expectedAnswers: ["(x-5)(x+1)=0", "(x+1)(x-5)=0", "(x-5)*(x+1)=0", "(x+1)*(x-5)=0"],
          hint: "Find two numbers that multiply to -5 and add to -4. They are -5 and +1.",
          successMessage: "Splendid! The factored form is indeed (x - 5)(x + 1) = 0."
        },
        {
          id: 2,
          prompt: "Now solve for x. Find both roots of the equation, separated by a comma.",
          placeholder: "e.g. 5, -1",
          expectedAnswers: ["5,-1", "-1,5", "x=5,x=-1", "x=-1,x=5", "x=5, x=-1"],
          hint: "Set each factor to zero: x - 5 = 0 or x + 1 = 0.",
          successMessage: "Correct! The roots are x = 5 and x = -1."
        }
      ]
    },
    {
      id: 2,
      title: "2. Exponential Equations",
      subtitle: "Solving Exponentials",
      description: "Learn to solve exponential equations by finding common bases and equating exponents.",
      formula: "3^{2x - 1} = 27",
      graphFn: "Math.pow(3, 2 * x - 1) - 27", 
      steps: [
        {
          id: 1,
          prompt: "Rewrite 27 as a base of 3. What is the exponential form?",
          placeholder: "e.g. 3^k",
          expectedAnswers: ["3^3", "3**3"],
          hint: "27 is 3 multiplied by itself 3 times: 3 * 3 * 3.",
          successMessage: "Yes! 27 can be written as 3^3."
        },
        {
          id: 2,
          prompt: "Since bases match, set the exponents equal: 2x - 1 = 3. Solve for x.",
          placeholder: "e.g. x=2",
          expectedAnswers: ["2", "x=2", "x = 2"],
          hint: "Add 1 to both sides: 2x = 4. Then divide by 2.",
          successMessage: "Brilliant! Equating exponents yields x = 2."
        }
      ]
    },
    {
      id: 3,
      title: "3. Logarithmic Systems",
      subtitle: "Log Product Properties",
      description: "Condense multiple log arguments using mathematical rules, then convert to exponential forms.",
      formula: "\\log_2(x) + \\log_2(x-2) = 3",
      graphFn: "Math.log2(Math.max(0.001, x)) + Math.log2(Math.max(0.001, x - 2)) - 3",
      steps: [
        {
          id: 1,
          prompt: "Combine the logarithms using the Product Rule: log_b(M) + log_b(N) = log_b(MN). Format: log_2(A) = 3",
          placeholder: "e.g. log_2(x(x-2))=3",
          expectedAnswers: ["log_2(x(x-2))=3", "log_2(x^2-2x)=3", "log_2(x*(x-2))=3", "log_2(x**2-2*x)=3"],
          hint: "Multiply the log arguments together: x * (x - 2).",
          successMessage: "Perfect! By the product property, it condenses to log_2(x^2 - 2x) = 3."
        },
        {
          id: 2,
          prompt: "Convert to exponential form (base^exponent = argument): 2^3 = x^2 - 2x. Simplify the constant: x^2 - 2x = B",
          placeholder: "e.g. x^2-2x=8",
          expectedAnswers: ["x^2-2x=8", "x^2 - 2x = 8", "x**2-2*x=8"],
          hint: "2 raised to the power of 3 is 8.",
          successMessage: "Exactly! This simplifies to the quadratic x^2 - 2x = 8."
        },
        {
          id: 3,
          prompt: "Re-arrange to x^2 - 2x - 8 = 0. Solve for x. Note: Logarithms only accept positive arguments. What is the single valid root?",
          placeholder: "e.g. 4",
          expectedAnswers: ["4", "x=4", "x = 4"],
          hint: "The factors are (x - 4)(x + 2) = 0. Thus roots are 4 and -2, but x must be greater than 2.",
          successMessage: "Excellent! The root x = -2 is extraneous, so the only valid solution is x = 4!"
        }
      ]
    },
    {
      id: 4,
      title: "4. Trigonometric Identities",
      subtitle: "Isolating Trigonometry",
      description: "Solve basic trigonometric functions on the Unit Circle within the interval [0, 2π).",
      formula: "2\\sin(\\theta) - 1 = 0",
      graphFn: "2 * Math.sin(x) - 1",
      steps: [
        {
          id: 1,
          prompt: "Isolate the sine term. What is sin(theta) equal to?",
          placeholder: "e.g. sin(theta)=1/2",
          expectedAnswers: ["sin(theta)=1/2", "sin(theta)=0.5", "sin(t)=1/2", "sin(t)=0.5"],
          hint: "Add 1 to both sides, then divide by 2.",
          successMessage: "Correct! sin(theta) = 1/2."
        },
        {
          id: 2,
          prompt: "Find the two solution angles for theta in radians on the interval [0, 2pi), separated by a comma.",
          placeholder: "e.g. pi/6, 5pi/6",
          expectedAnswers: ["pi/6,5pi/6", "5pi/6,pi/6", "pi/6, 5pi/6", "5pi/6, pi/6"],
          hint: "Sine is positive in Quadrants I and II. Ticks on unit circle are at 30 degrees and 150 degrees.",
          successMessage: "Wonderful job! The angles are pi/6 and 5pi/6."
        }
      ]
    }
  ];

  // Active Tutor State
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; text: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const activeChapter = chapters[activeChapterIndex];
  const activeStep = activeChapter.steps[activeStepIndex];

  // Feed OCR snapshots to input
  useEffect(() => {
    if (ocrInput) {
      setUserInput(ocrInput.trim());
      setFeedback(null);
    }
  }, [ocrInput]);

  // Swap Module
  const selectChapter = (index: number) => {
    setActiveChapterIndex(index);
    setActiveStepIndex(0);
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    setCompletedSteps(new Array(chapters[index].steps.length).fill(false));
  };

  const handleSubmitAnswer = () => {
    if (!userInput.trim()) return;

    const cleanStr = (str: string) => {
      return str
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/\*\*/g, "^")
        .replace(/theta/g, "t");
    };

    const userClean = cleanStr(userInput);
    const isCorrect = activeStep.expectedAnswers.some(
      (ans) => cleanStr(ans) === userClean
    );

    if (isCorrect) {
      setFeedback({
        isSuccess: true,
        text: activeStep.successMessage,
      });

      const updated = [...completedSteps];
      updated[activeStepIndex] = true;
      setCompletedSteps(updated);
      setScore((prev) => prev + 10);
      setShowHint(false);
    } else {
      setFeedback({
        isSuccess: false,
        text: "Incorrect steps. Click 'Reveal Tutorial Hint' below for key math rules.",
      });
    }
  };

  const handleNextStep = () => {
    setFeedback(null);
    setUserInput("");
    setShowHint(false);
    if (activeStepIndex < activeChapter.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    } else {
      setFeedback({
        isSuccess: true,
        text: "👑 Chapter completed successfully! Sigma has unlocked the coordinate plotter for you.",
      });
    }
  };

  const handleGraphPlot = () => {
    if (activeChapter.graphFn && onPlotRequest) {
      onPlotRequest(activeChapter.graphFn, activeChapter.title.split(".")[1].trim());
    }
  };

  return (
    <div className="glass-panel">
      
      {/* Chapter Selection Tab list */}
      <div className="tutor-tabs-list">
        {chapters.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => selectChapter(idx)}
            className={`tutor-tab-btn ${activeChapterIndex === idx ? "active" : ""}`}
          >
            Ch {ch.id}
          </button>
        ))}
      </div>

      <div className="card-body">
        
        {/* Active Module overview */}
        <div className="flex flex-col gap-1">
          <div className="tutor-meta-row">
            <span className="tutor-subtitle">
              {activeChapter.subtitle}
            </span>
            <div className="tutor-score-badge">
              <Sparkles className="w-3 h-3" />
              <span>Score: {score} XP</span>
            </div>
          </div>
          <h2 className="tutor-title">{activeChapter.title}</h2>
          <p className="tutor-desc">{activeChapter.description}</p>
        </div>

        {/* Dynamic KaTeX formula card */}
        <div className="tutor-formula-card">
          <span className="tutor-formula-label">Problem Equation</span>
          <MathFormula formula={activeChapter.formula} block={true} />
        </div>

        {/* Floating Animated Tutor Agent 'Sigma' card */}
        <div className="tutor-companion-card">
          <div className="tutor-avatar float-animation">
            <div className="tutor-avatar-ring pulse-ring-cyan" />
            <div className="tutor-avatar-face">
              Σ
            </div>
          </div>
          
          <div className="tutor-companion-info">
            <div className="tutor-companion-header">
              <span className="tutor-companion-name">Sigma Assistant</span>
              <span className="tutor-companion-version">Tutor v1.0</span>
            </div>
            <p className="tutor-companion-bubble">
              Solve this on your whiteboard! When you are ready, feed your final answer into the check box below.
            </p>
          </div>
        </div>

        {/* Active Step Panel */}
        <div className="tutor-step-card">
          <div className="tutor-step-meta">
            <div className="tutor-step-num">
              {activeStepIndex + 1}
            </div>
            <span className="tutor-step-title">Step {activeStepIndex + 1} of {activeChapter.steps.length}</span>
          </div>

          <p className="tutor-step-prompt">
            {activeStep.prompt}
          </p>

          {/* Interactive Input row */}
          <div className="tutor-input-row">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                setFeedback(null);
              }}
              placeholder={activeStep.placeholder}
              className="math-input-field"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
              disabled={completedSteps[activeStepIndex]}
            />
            
            {!completedSteps[activeStepIndex] ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!userInput.trim()}
                className="btn-neon"
                style={{ padding: '0.5rem' }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-2" style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Live Feedback cards */}
          {feedback && (
            <div className={`tutor-feedback-box ${feedback.isSuccess ? "success" : "error"}`}>
              {feedback.isSuccess ? (
                <CheckCircle2 className="w-4 h-4 tutor-feedback-icon" />
              ) : (
                <AlertCircle className="w-4 h-4 tutor-feedback-icon" />
              )}
              <div className="tutor-feedback-content">
                <p>{feedback.text}</p>
                {feedback.isSuccess && activeStepIndex < activeChapter.steps.length - 1 && (
                  <button
                    onClick={handleNextStep}
                    className="btn-neon btn-neon-xs"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Next Step <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hint options */}
          <div className="tutor-step-actions">
            <button
              onClick={() => setShowHint(!showHint)}
              className="tutor-hint-trigger"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? "Hide Hint" : "Reveal Hint"}
            </button>
            
            {showHint && (
              <div className="tutor-hint-box">
                💡 <strong>Hint:</strong> {activeStep.hint}
              </div>
            )}
          </div>
        </div>

        {/* Visual Coordinate Plotter option */}
        {activeChapter.graphFn && (
          <button
            onClick={handleGraphPlot}
            className="btn-neon btn-neon-purple"
            style={{ width: '100%', padding: '0.75rem 1rem' }}
            title="Automatically plot this algebraic function onto your whiteboard grids"
          >
            <TrendingUp className="w-4 h-4" />
            Plot Sigma's Graph on Whiteboard
          </button>
        )}

      </div>
      
      {/* Footer Info reset */}
      <div className="tutor-footer-nav">
        <span className="tutor-footer-label">Algebra II Path</span>
        <button
          onClick={() => {
            selectChapter(activeChapterIndex);
            setScore(0);
          }}
          className="tutor-restart-btn"
          title="Restart active module"
        >
          <RotateCcw className="w-3 h-3" /> Restart Chapter
        </button>
      </div>
    </div>
  );
}
