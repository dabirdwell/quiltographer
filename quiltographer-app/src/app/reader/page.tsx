'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FanNavigation } from '@/components/fan/FanNavigation';
import { PatternUpload } from '@/components/reader/PatternUpload';
import { StepContent } from '@/components/reader/StepContent';
import { MaterialsList } from '@/components/reader/MaterialsList';
import { DifficultyEstimator } from '@/components/reader/DifficultyEstimator';
import { FabricCalculator } from '@/components/reader/FabricCalculator';
import { PatternResults } from '@/components/reader/PatternResults';
import { quiltographerTheme } from '@/components/japanese/theme';
import { Text, Stack, Surface, Button, Callout, ProgressBar } from '@/components/ui';
import { useClarification } from '@/hooks/useClarification';
import { usePatternSession } from '@/hooks/usePatternSession';
import type { PatternSession } from '@/hooks/usePatternSession';
import type { ReaderPattern, ConstructionStep } from '@/lib/reader/schema';

const FONT_SCALE_OPTIONS = [1, 1.5, 2, 3] as const;
type FontScale = (typeof FONT_SCALE_OPTIONS)[number];
const FREE_PATTERNS_PER_MONTH = 3;

type ViewState = 'upload' | 'processing' | 'results' | 'reading';

// --- Breadcrumb Navigation ---
function Breadcrumbs({
  viewState,
  patternName,
  highContrast,
  onNavigate,
}: {
  viewState: ViewState;
  patternName?: string;
  highContrast: boolean;
  onNavigate: (target: 'home' | 'upload' | 'results') => void;
}) {
  const crumbs: { label: string; target?: 'home' | 'upload' | 'results' }[] = [
    { label: 'Home', target: 'home' },
  ];

  if (viewState === 'upload') {
    crumbs.push({ label: 'Upload' });
  } else if (viewState === 'processing') {
    crumbs.push({ label: 'Upload', target: 'upload' });
    crumbs.push({ label: 'Processing...' });
  } else if (viewState === 'results') {
    crumbs.push({ label: 'Upload', target: 'upload' });
    crumbs.push({ label: patternName || 'Results' });
  } else if (viewState === 'reading') {
    crumbs.push({ label: 'Upload', target: 'upload' });
    crumbs.push({ label: patternName || 'Results', target: 'results' });
    crumbs.push({ label: 'Reading' });
  }

  const linkClass = highContrast
    ? 'text-blue-300 hover:text-blue-200 hover:underline'
    : 'text-persimmon hover:text-persimmon/80 hover:underline';
  const currentClass = highContrast ? 'text-gray-400' : 'text-ink-gray';
  const separatorClass = highContrast ? 'text-gray-600' : 'text-ink-faint/40';

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className={separatorClass} aria-hidden="true">/</span>}
            {crumb.target ? (
              <button
                onClick={() => {
                  const t = crumb.target!;
                  if (t === 'home') {
                    window.location.href = '/';
                  } else {
                    onNavigate(t);
                  }
                }}
                className={`${linkClass} font-medium transition-colors`}
              >
                {crumb.label}
              </button>
            ) : (
              <span className={`${currentClass} font-medium`} aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// --- Mock Pattern for Demo Flow ---
const MOCK_PATTERN: ReaderPattern = {
  id: 'mock-demo-pattern',
  name: 'Log Cabin Classic',
  description: 'A timeless log cabin quilt block pattern — perfect for beginners and satisfying for experienced quilters.',
  difficulty: 2,
  estimatedTime: 8,
  finishedSize: { width: 60, height: 72, unit: 'inches' },
  materials: [
    { id: 'm1', name: 'Center squares fabric (red)', type: 'fabric', amount: '1/4 yard' },
    { id: 'm2', name: 'Light strips fabric (cream)', type: 'fabric', amount: '1.5 yards' },
    { id: 'm3', name: 'Dark strips fabric (navy)', type: 'fabric', amount: '1.5 yards' },
    { id: 'm4', name: 'Backing fabric', type: 'fabric', amount: '4 yards' },
    { id: 'm5', name: 'Batting', type: 'notion', amount: '68" x 80"' },
    { id: 'm6', name: 'Binding fabric', type: 'fabric', amount: '5/8 yard' },
    { id: 'm7', name: 'Rotary cutter & mat', type: 'tool' },
    { id: 'm8', name: 'Quilting ruler', type: 'tool' },
  ],
  cuttingInstructions: [
    {
      id: 'c1',
      fabric: 'Center squares (red)',
      pieces: [{ shape: 'square', quantity: 20, dimensions: '2.5" x 2.5"', notes: 'Cut precisely — these are the heart of each block' }],
    },
    {
      id: 'c2',
      fabric: 'Light strips (cream)',
      pieces: [
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 2.5"', notes: 'Round 1 light' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 3.5"', notes: 'Round 1 light' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 4.5"', notes: 'Round 2 light' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 5.5"', notes: 'Round 2 light' },
      ],
    },
    {
      id: 'c3',
      fabric: 'Dark strips (navy)',
      pieces: [
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 3.5"', notes: 'Round 1 dark' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 4.5"', notes: 'Round 1 dark' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 5.5"', notes: 'Round 2 dark' },
        { shape: 'strip', quantity: 20, dimensions: '1.5" x 6.5"', notes: 'Round 2 dark' },
      ],
    },
  ],
  steps: [
    {
      id: 's1', number: 1, section: 'Cutting',
      title: 'Prepare your fabrics',
      instruction: 'Pre-wash and press all fabrics. Fold each fabric in half selvage to selvage and align the grain. Using your rotary cutter and ruler, trim the selvage edges to create a clean, straight edge.',
      techniques: ['Rotary cutting', 'Grain alignment'],
      warnings: [{ type: 'important', message: 'Pre-washing prevents shrinkage after quilting. Use warm water and low heat in the dryer.' }],
      tips: [{ text: 'Starch your fabrics lightly before cutting for more precise strips.', source: 'ai' }],
    },
    {
      id: 's2', number: 2, section: 'Cutting',
      title: 'Cut center squares and strips',
      instruction: 'From the red fabric, cut (20) 2.5" x 2.5" squares for block centers. From the cream and navy fabrics, cut strips according to the cutting chart. Stack-cut up to 4 layers at a time for efficiency.',
      techniques: ['Strip cutting', 'Stack cutting'],
      warnings: [],
      tips: [{ text: 'Label each strip size with a sticky note as you cut — it saves time during assembly.', source: 'ai' }],
    },
    {
      id: 's3', number: 3, section: 'Block Assembly',
      title: 'Sew the first light strip',
      instruction: 'Take one center square and one 1.5" x 2.5" cream strip. Place Right Sides Together (RST) and sew with a 1/4" seam allowance along the right edge. Press the seam toward the strip.',
      techniques: ['1/4" seam', 'Pressing'],
      warnings: [{ type: 'critical', message: 'A consistent 1/4" seam allowance is essential. Test on scrap fabric first.' }],
      tips: [{ text: 'Press seams toward the darker fabric to prevent show-through.', source: 'pattern' }],
    },
    {
      id: 's4', number: 4, section: 'Block Assembly',
      title: 'Add the second light strip',
      instruction: 'Rotate your unit 90 degrees counter-clockwise. Sew a 1.5" x 3.5" cream strip to the top edge, RST. Press toward the strip. You should now have an L-shaped light border around your center.',
      techniques: ['Strip piecing', 'Pressing'],
      warnings: [],
      tips: [{ text: 'Always rotate in the same direction (counter-clockwise) to maintain the log cabin spiral.', source: 'ai' }],
    },
    {
      id: 's5', number: 5, section: 'Block Assembly',
      title: 'Add dark strips (Round 1)',
      instruction: 'Continue rotating counter-clockwise. Sew a 1.5" x 3.5" navy strip to the next edge, then a 1.5" x 4.5" navy strip to complete Round 1. Press all seams toward the most recent strip.',
      techniques: ['Strip piecing', 'Log cabin construction'],
      warnings: [],
      tips: [{ text: 'Chain-piece all 20 blocks at once for each strip to save time and thread.', source: 'ai' }],
    },
    {
      id: 's6', number: 6, section: 'Block Assembly',
      title: 'Complete Round 2',
      instruction: 'Repeat the process for Round 2: two light strips (1.5" x 4.5" and 1.5" x 5.5"), then two dark strips (1.5" x 5.5" and 1.5" x 6.5"). Each finished block should measure 6.5" square (unfinished).',
      techniques: ['Strip piecing', 'Measuring'],
      warnings: [{ type: 'important', message: 'Measure each completed block — they should all be 6.5" square. Trim if needed.' }],
      tips: [],
    },
    {
      id: 's7', number: 7, section: 'Quilt Assembly',
      title: 'Arrange blocks in layout',
      instruction: 'Lay out all 20 blocks in a 4x5 grid on your design wall or floor. Rotate blocks to create the classic "barn raising" or "straight furrow" pattern. Take a photo of your layout before sewing.',
      techniques: ['Design layout'],
      warnings: [],
      tips: [{ text: 'Step back and view from a distance — or take a photo and view it in grayscale to check value contrast.', source: 'ai' }],
    },
    {
      id: 's8', number: 8, section: 'Quilt Assembly',
      title: 'Sew blocks into rows',
      instruction: 'Sew blocks together into rows, matching seams carefully. Press seams in alternating directions for each row (Row 1 left, Row 2 right, etc.) to help seams nest when joining rows.',
      techniques: ['Row assembly', 'Nesting seams'],
      warnings: [],
      tips: [{ text: 'Pin at each seam intersection to ensure perfect alignment.', source: 'pattern' }],
    },
    {
      id: 's9', number: 9, section: 'Finishing',
      title: 'Layer and baste',
      instruction: 'Press the quilt top thoroughly. Layer backing (face down), batting, and quilt top (face up). Baste with safety pins every 4-6 inches or use spray baste. Smooth from the center outward.',
      techniques: ['Basting', 'Layering'],
      warnings: [{ type: 'important', message: 'Make sure backing and batting extend at least 3" beyond the quilt top on all sides.' }],
      tips: [],
    },
    {
      id: 's10', number: 10, section: 'Finishing',
      title: 'Quilt and bind',
      instruction: 'Quilt as desired — stitch-in-the-ditch along seam lines works beautifully for log cabin. Trim edges even, then attach binding using your preferred method. Hand-stitch the binding to the back.',
      techniques: ['Quilting', 'Binding'],
      warnings: [],
      tips: [{ text: 'For a classic look, quilt diagonal lines through the blocks to emphasize the light/dark contrast.', source: 'ai' }],
    },
  ],
  summary: 'This Log Cabin pattern creates 20 blocks arranged in a 4x5 layout. The traditional light-and-dark strip construction builds outward from a center square, creating a beautiful spiral effect.',
  source: {
    fileName: 'demo-pattern',
    parsedAt: new Date().toISOString(),
    designer: 'Quiltographer Demo',
  },
};

// Track pattern usage for free tier
function getPatternUsage(): { count: number; month: string } {
  try {
    const raw = localStorage.getItem('quiltographer-usage');
    if (raw) {
      const data = JSON.parse(raw);
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (data.month === currentMonth) return data;
    }
  } catch {}
  return { count: 0, month: new Date().toISOString().slice(0, 7) };
}

function recordPatternUsage() {
  const usage = getPatternUsage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newUsage = {
    count: usage.month === currentMonth ? usage.count + 1 : 1,
    month: currentMonth,
  };
  localStorage.setItem('quiltographer-usage', JSON.stringify(newUsage));
  return newUsage;
}

function hasFullAccess(): boolean {
  try {
    return localStorage.getItem('quiltographer-beta') === 'true';
  } catch {
    return false;
  }
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export default function PatternReaderPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [pattern, setPattern] = useState<ReaderPattern | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [clarifications, setClarifications] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>(1);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Session persistence
  const [pendingSession, setPendingSession] = useState<PatternSession | null>(null);
  const { saveSession, loadSession, clearSession, findLatestSession } = usePatternSession();

  const { isLoading: isClarifying, requestClarification } = useClarification();
  const previewUrlRef = useRef<string | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Check for beta pass and demo mode in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('beta') === 'quilt2026') {
      localStorage.setItem('quiltographer-beta', 'true');
    }

    // Demo mode: load a sample pattern by ID
    const demoId = params.get('demo');
    if (demoId && !pattern) {
      const fileMap: Record<string, string> = {
        'demo-log-cabin': 'log-cabin-classic',
        'demo-flying-geese': 'flying-geese-runner',
        'demo-nine-patch': 'nine-patch-baby',
        'demo-lone-star': 'lone-star-wall-hanging',
        'demo-irish-chain': 'irish-chain-throw',
      };
      const fileName = fileMap[demoId];
      if (fileName) {
        setViewState('processing');
        setProcessingMessage('Loading demo pattern...');
        setProcessingProgress(50);
        fetch(`/sample-patterns/${fileName}.json`)
          .then((res) => res.json())
          .then((data: ReaderPattern) => {
            setPattern(data);
            setCurrentStepIndex(0);
            setCompletedSteps([]);
            setCheckedMaterials([]);
            setClarifications({});
            setProcessingProgress(100);
            setViewState('results');
            setPendingSession(null);
            setIsDemoMode(true);
          })
          .catch(() => {
            setError('Failed to load demo pattern.');
            setViewState('upload');
          });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount, check for a saved session to offer resume
  useEffect(() => {
    const latest = findLatestSession();
    if (latest && latest.pattern.steps.length > 0) {
      setPendingSession(latest);
    }
  }, [findLatestSession]);

  // Auto-save session whenever relevant state changes
  useEffect(() => {
    if (pattern && viewState === 'reading') {
      saveSession({
        pattern,
        currentStepIndex,
        completedSteps,
        checkedMaterials,
        lastAccessed: new Date().toISOString(),
      });
    }
  }, [pattern, currentStepIndex, completedSteps, checkedMaterials, viewState, saveSession]);

  // Load high contrast preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reader-high-contrast');
      if (saved === 'true') setHighContrast(true);
      const savedScale = localStorage.getItem('reader-font-scale');
      if (savedScale) {
        const parsed = parseFloat(savedScale);
        if (FONT_SCALE_OPTIONS.includes(parsed as FontScale)) {
          setFontScale(parsed as FontScale);
        }
      }
    } catch {}
  }, []);

  // Persist high contrast preference
  useEffect(() => {
    try {
      localStorage.setItem('reader-high-contrast', String(highContrast));
    } catch {}
  }, [highContrast]);

  // Persist font scale preference
  useEffect(() => {
    try {
      localStorage.setItem('reader-font-scale', String(fontScale));
    } catch {}
  }, [fontScale]);

  // Resume a saved session
  const handleResumeSession = useCallback((session: PatternSession) => {
    setPattern(session.pattern);
    setCurrentStepIndex(session.currentStepIndex);
    setCompletedSteps(session.completedSteps);
    setCheckedMaterials(session.checkedMaterials);
    setClarifications({});
    setViewState('results');
    setPendingSession(null);
  }, []);

  // Dismiss the resume banner and start fresh
  const handleStartFresh = useCallback(() => {
    if (pendingSession?.pattern.source.fileName) {
      clearSession(pendingSession.pattern.source.fileName);
    }
    setPendingSession(null);
  }, [pendingSession, clearSession]);

  // --- Mock flow for image uploads ---
  const runMockFlow = useCallback(async (file: File) => {
    setPendingSession(null);
    setIsProcessing(true);
    setViewState('processing');
    setError(null);
    setUploadedFileName(file.name);

    // Create preview URL for image files
    if (isImageFile(file)) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setUploadedFilePreview(url);
    } else {
      setUploadedFilePreview(null);
    }

    // Simulate processing stages
    setProcessingMessage('Uploading pattern...');
    setProcessingProgress(10);
    await new Promise((r) => setTimeout(r, 600));

    setProcessingMessage('Analyzing pattern image...');
    setProcessingProgress(35);
    await new Promise((r) => setTimeout(r, 800));

    setProcessingMessage('Extracting steps and materials...');
    setProcessingProgress(65);
    await new Promise((r) => setTimeout(r, 700));

    setProcessingMessage('Generating step-by-step instructions...');
    setProcessingProgress(90);
    await new Promise((r) => setTimeout(r, 500));

    setProcessingMessage('Done!');
    setProcessingProgress(100);

    setShowSuccess(true);
    await new Promise((r) => setTimeout(r, 1000));
    setShowSuccess(false);

    setPattern(MOCK_PATTERN);
    setViewState('results');
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setCheckedMaterials([]);
    setClarifications({});
    setIsDemoMode(true);
    setIsProcessing(false);
  }, []);

  const handlePatternLoaded = useCallback(async (file: File) => {
    // Check free tier usage
    if (!hasFullAccess()) {
      const usage = getPatternUsage();
      if (usage.count >= FREE_PATTERNS_PER_MONTH) {
        setError(`You've used ${FREE_PATTERNS_PER_MONTH} free patterns this month. Upgrade to Pro for unlimited patterns, or come back next month!`);
        return;
      }
    }

    // Image files go through the mock/demo flow
    if (isImageFile(file)) {
      runMockFlow(file);
      return;
    }

    // Dismiss any pending session banner
    setPendingSession(null);

    setIsProcessing(true);
    setViewState('processing');
    setError(null);
    setUploadedFileName(file.name);
    setUploadedFilePreview(null);
    setProcessingMessage('Uploading pattern...');
    setProcessingProgress(5);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProcessingMessage('Parsing your pattern PDF...');
      setProcessingProgress(15);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'Failed to process pattern');
      }

      setProcessingMessage('Processing complete!');
      setProcessingProgress(100);

      const readerPattern: ReaderPattern = data;

      // Record usage for free tier tracking
      recordPatternUsage();

      // Show success animation briefly
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setShowSuccess(false);

      setPattern(readerPattern);
      setViewState('results');
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      setCheckedMaterials([]);
      setClarifications({});
    } catch (err) {
      console.error('Pattern processing error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to process pattern';
      // Detect image-heavy/empty parse failures
      if (errorMsg.toLowerCase().includes('no text') || errorMsg.toLowerCase().includes('image') || errorMsg.toLowerCase().includes('empty') || errorMsg.toLowerCase().includes('0 steps')) {
        setError('This pattern appears to be primarily visual. Try a pattern with text-based instructions.');
      } else {
        setError(errorMsg);
      }
      setViewState('upload');
    } finally {
      setIsProcessing(false);
    }
  }, [runMockFlow]);

  const handleStepSelect = useCallback(
    (index: number) => {
      if (index > currentStepIndex && !completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex(index);
    },
    [currentStepIndex, completedSteps]
  );

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  }, [currentStepIndex]);

  const handleNext = useCallback(() => {
    if (pattern && currentStepIndex < pattern.steps.length - 1) {
      if (!completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, pattern, completedSteps]);

  const handleRequestClarification = useCallback(
    async (step: ConstructionStep) => {
      const result = await requestClarification(step.instruction);
      if (result) {
        setClarifications((prev) => ({ ...prev, [step.id]: result }));
      }
    },
    [requestClarification]
  );

  const handleBackToUpload = useCallback(() => {
    // Clear saved session for the current pattern
    if (pattern?.source.fileName) {
      clearSession(pattern.source.fileName);
    }
    setViewState('upload');
    setPattern(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setCheckedMaterials([]);
    setClarifications({});
    setError(null);
    setIsDemoMode(false);
    setUploadedFilePreview(null);
    setUploadedFileName(null);
  }, [pattern, clearSession]);

  const handleBreadcrumbNavigate = useCallback((target: 'home' | 'upload' | 'results') => {
    if (target === 'upload') {
      handleBackToUpload();
    } else if (target === 'results') {
      setViewState('results');
    }
  }, [handleBackToUpload]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (viewState !== 'reading') {
        if (e.key === 'Escape') {
          if (viewState === 'processing') handleBackToUpload();
          if (viewState === 'results') handleBackToUpload();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'p':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
        case 'n':
          e.preventDefault();
          handleNext();
          break;
        case 'm':
          e.preventDefault();
          setShowMaterials((prev) => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          handleBackToUpload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, handlePrevious, handleNext, handleBackToUpload]);

  const cycleFontScale = useCallback(() => {
    setFontScale((prev) => {
      const idx = FONT_SCALE_OPTIONS.indexOf(prev);
      return FONT_SCALE_OPTIONS[(idx + 1) % FONT_SCALE_OPTIONS.length];
    });
  }, []);

  const currentStep = pattern?.steps[currentStepIndex];
  const navItems =
    pattern?.steps.map((step) => ({
      id: step.id,
      label: step.title || `Step ${step.number}`,
      shortLabel: `${step.number}`,
      section: step.section,
    })) || [];

  const highContrastStyles: React.CSSProperties = highContrast
    ? ({
        '--reader-font-scale': fontScale,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontSize: `calc(1rem * ${fontScale})`,
      } as React.CSSProperties)
    : ({
        '--reader-font-scale': fontScale,
        backgroundImage: quiltographerTheme.textures.washiFiber,
        fontSize: `calc(1rem * ${fontScale})`,
      } as React.CSSProperties);

  return (
    <div className={`min-h-screen ${highContrast ? '' : 'bg-washi'}`} style={highContrastStyles}>
      {/* Header — responsive with 48px min touch targets */}
      <header
        className={`px-4 md:px-6 py-3 md:py-4 border-b flex justify-between items-center gap-2 ${
          highContrast ? 'bg-[#111] border-gray-600' : 'bg-rice border-ink-faint/20'
        }`}
      >
        <Stack direction="horizontal" gap="sm" align="center" className="min-w-0">
          <span className="text-2xl flex-shrink-0">🧵</span>
          <Text variant="heading" size="xl" color={highContrast ? 'default' : 'indigo'} className="hidden sm:block">
            Pattern Reader
          </Text>
          {(viewState === 'reading' || viewState === 'results') && pattern && (
            <Text size="sm" color="muted" className="truncate hidden md:block">
              — {pattern.name}
            </Text>
          )}
          {isDemoMode && (
            <span className="px-2 py-0.5 rounded-full bg-persimmon/15 text-persimmon text-xs font-semibold hidden sm:inline">
              Demo
            </span>
          )}
        </Stack>
        <Stack direction="horizontal" gap="xs" align="center" className="flex-shrink-0">
          {/* Font scale control — 48px touch target */}
          <button
            onClick={cycleFontScale}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
              highContrast
                ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
            }`}
            aria-label={`Font scale: ${fontScale}x. Click to cycle.`}
            title={`Text size: ${fontScale}x`}
          >
            {fontScale === 1 ? 'A' : fontScale === 1.5 ? 'A+' : fontScale === 2 ? 'A++' : 'A+++'}
          </button>

          {/* High contrast toggle — 48px touch target */}
          <button
            onClick={() => setHighContrast((prev) => !prev)}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
              highContrast
                ? 'border-yellow-400 bg-yellow-400 text-black'
                : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
            }`}
            aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
            aria-pressed={highContrast}
            title="Toggle high contrast"
          >
            {highContrast ? '◑' : '◐'}
          </button>

          {viewState === 'reading' && pattern && (
            <button
              onClick={() => {
                sessionStorage.setItem('quiltographer-assistant-pattern', JSON.stringify(pattern));
                window.location.href = '/assistant';
              }}
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
                highContrast
                  ? 'border-persimmon bg-persimmon/20 text-persimmon hover:bg-persimmon/30'
                  : 'border-persimmon/40 bg-persimmon/10 text-persimmon hover:bg-persimmon/20'
              }`}
              aria-label="Ask AI Assistant about this pattern"
              title="Ask AI Assistant"
            >
              <span className="hidden sm:inline">Ask AI</span>
              <span className="sm:hidden">AI</span>
            </button>
          )}

          {(viewState === 'reading' || viewState === 'processing' || viewState === 'results') && (
            <button
              onClick={handleBackToUpload}
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm border transition-colors ${
                highContrast
                  ? 'border-gray-500 text-white hover:bg-gray-700'
                  : 'border-ink-faint/30 text-ink-black hover:bg-washi-dark'
              }`}
              aria-label="New pattern"
            >
              <span className="hidden sm:inline">← New</span>
              <span className="sm:hidden">✕</span>
            </button>
          )}
        </Stack>
      </header>

      {/* Main content — responsive padding */}
      <main className="px-3 py-4 md:p-breathe max-w-[1200px] mx-auto">
        {/* Breadcrumb navigation */}
        <Breadcrumbs
          viewState={viewState}
          patternName={pattern?.name}
          highContrast={highContrast}
          onNavigate={handleBreadcrumbNavigate}
        />

        {/* Resume session banner */}
        {viewState === 'upload' && pendingSession && (
          <div className="max-w-[600px] mx-auto mb-6">
            <Surface variant="rice" elevated padding="md">
              <Stack direction="horizontal" gap="md" align="center" className="justify-between">
                <Stack gap="xs">
                  <Text size="sm" color="indigo" className="font-semibold">
                    Resume reading {pendingSession.pattern.name}?
                  </Text>
                  <Text size="xs" color="muted">
                    Step {pendingSession.currentStepIndex + 1} of{' '}
                    {pendingSession.pattern.steps.length}
                    {pendingSession.completedSteps.length > 0 &&
                      ` — ${pendingSession.completedSteps.length} step${pendingSession.completedSteps.length === 1 ? '' : 's'} completed`}
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap="sm">
                  <Button variant="primary" onClick={() => handleResumeSession(pendingSession)}>
                    Resume
                  </Button>
                  <Button variant="ghost" onClick={handleStartFresh}>
                    Start Fresh
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          </div>
        )}

        {/* Upload view */}
        {viewState === 'upload' && (
          <div className="max-w-[600px] mx-auto mt-8">
            <Stack gap="rest" align="center" className="text-center mb-8">
              <Text variant="heading" size="3xl" color="indigo">
                Understand any quilt pattern
              </Text>
              <Text size="lg" color="muted">
                Upload a PDF or photo and get clear, step-by-step guidance
              </Text>
            </Stack>

            {error && (
              <Callout variant="critical" icon="⚠️" className="mb-6">
                {error}
              </Callout>
            )}

            <PatternUpload onPatternLoaded={handlePatternLoaded} isProcessing={isProcessing} />
          </div>
        )}

        {/* Processing view — with file preview */}
        {viewState === 'processing' && (
          <div className="max-w-[600px] mx-auto mt-8 text-center">
            <Surface variant="rice" elevated padding="xl">
              <Stack gap="breathe" align="center">
                {showSuccess ? (
                  <>
                    <span className="text-6xl animate-bounce">✅</span>
                    <Text variant="heading" size="xl" color="indigo">
                      Pattern parsed successfully!
                    </Text>
                  </>
                ) : (
                  <>
                    {/* Show image preview if available */}
                    {uploadedFilePreview && (
                      <div className="w-full max-w-[300px] mx-auto mb-2 rounded-xl overflow-hidden border border-ink-faint/20 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedFilePreview}
                          alt="Uploaded pattern"
                          className="w-full h-auto max-h-[240px] object-contain bg-white"
                        />
                      </div>
                    )}
                    {!uploadedFilePreview && (
                      <span className="text-5xl animate-pulse">🪡</span>
                    )}
                    {uploadedFileName && (
                      <Text size="sm" color="muted" className="truncate max-w-full">
                        {uploadedFileName}
                      </Text>
                    )}
                    <Text variant="heading" size="xl" color="indigo">
                      {processingMessage}
                    </Text>
                    <ProgressBar value={processingProgress} color="indigo" />
                    <Text size="sm" color="muted">
                      This usually takes just a few seconds
                    </Text>
                  </>
                )}
              </Stack>
            </Surface>
          </div>
        )}

        {/* Results overview */}
        {viewState === 'results' && pattern && (
          <>
            {/* Demo mode banner */}
            {isDemoMode && (
              <div className="max-w-[900px] mx-auto mb-4">
                <Callout variant="info" icon="✨">
                  <strong>Sample Parsed Pattern.</strong> In production, our AI reads your pattern and generates these instructions automatically.
                  This demo shows what the experience looks like.
                </Callout>
              </div>
            )}

            {/* Show uploaded image alongside results if available */}
            {isDemoMode && uploadedFilePreview && (
              <div className="max-w-[900px] mx-auto mb-4">
                <Surface elevated padding="md">
                  <Stack direction="horizontal" gap="md" align="center" className="flex-wrap justify-center">
                    <div className="rounded-xl overflow-hidden border border-ink-faint/20 shadow-sm flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedFilePreview}
                        alt="Your uploaded pattern"
                        className="w-auto h-[120px] object-contain bg-white"
                      />
                    </div>
                    <Stack gap="xs">
                      <Text size="sm" color="muted">Your uploaded pattern</Text>
                      <Text size="sm" color="indigo" className="font-semibold">
                        {uploadedFileName}
                      </Text>
                    </Stack>
                  </Stack>
                </Surface>
              </div>
            )}

            <PatternResults
              pattern={pattern}
              onStartReading={() => setViewState('reading')}
              highContrast={highContrast}
            />
          </>
        )}

        {/* Reading view */}
        {viewState === 'reading' && pattern && currentStep && (
          <Stack gap="breathe">
            {/* Demo banner in reading view */}
            {isDemoMode && (
              <Callout variant="info" icon="✨">
                <strong>Demo mode.</strong> These are sample instructions to show the reading experience.
              </Callout>
            )}

            {/* Toggle buttons — Materials, Analysis & Overview */}
            {pattern.materials && pattern.materials.length > 0 && (
              <div className="flex justify-end gap-2 flex-wrap">
                <button
                  onClick={() => setViewState('results')}
                  className={`min-h-[48px] px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    highContrast
                      ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                      : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
                  }`}
                >
                  ← Overview
                </button>
                <button
                  onClick={() => setShowAnalysis(prev => !prev)}
                  className={`min-h-[48px] px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    showAnalysis
                      ? highContrast
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                        : 'border-persimmon/30 bg-persimmon/10 text-persimmon'
                      : highContrast
                        ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                        : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
                  }`}
                >
                  {showAnalysis ? '📊 Hide Analysis' : '📊 Analysis'}
                </button>
                <button
                  onClick={() => setShowMaterials(prev => !prev)}
                  className={`min-h-[48px] px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    showMaterials
                      ? highContrast
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                        : 'border-indigo/30 bg-indigo/10 text-indigo'
                      : highContrast
                        ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                        : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
                  }`}
                >
                  {showMaterials ? '📋 Hide Materials' : '📋 Materials'}
                  {checkedMaterials.length > 0 && ` (${checkedMaterials.length}/${pattern.materials.length})`}
                </button>
              </div>
            )}

            {/* Materials panel */}
            {showMaterials && pattern.materials && pattern.materials.length > 0 && (
              <MaterialsList
                materials={pattern.materials}
                checkedIds={checkedMaterials}
                onToggle={(id) => {
                  setCheckedMaterials(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                  );
                }}
              />
            )}

            {/* Analysis panels — Difficulty & Fabric Calculator */}
            {showAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DifficultyEstimator pattern={pattern} />
                <FabricCalculator pattern={pattern} />
              </div>
            )}

            {/* Section header divider — show when entering a new section */}
            {currentStep.section && currentStep.section !== 'General' && (
              currentStepIndex === 0 ||
              pattern.steps[currentStepIndex - 1]?.section !== currentStep.section
            ) && (
              <div className={`text-center py-2 px-4 rounded-lg font-semibold text-sm uppercase tracking-wider ${
                highContrast
                  ? 'bg-gray-700 text-yellow-300 border border-gray-600'
                  : 'bg-indigo/10 text-indigo border border-indigo/20'
              }`}>
                {currentStep.section}
              </div>
            )}

            {pattern.summary && currentStepIndex === 0 && (
              <Surface variant="rice" elevated padding="md">
                <Text color="default" className="leading-relaxed">
                  <strong className="text-indigo">Pattern Summary:</strong> {pattern.summary}
                </Text>
              </Surface>
            )}

            <StepContent
              step={currentStep}
              stepNumber={currentStepIndex + 1}
              totalSteps={pattern.steps.length}
              onRequestClarification={handleRequestClarification}
              isLoadingClarification={isClarifying}
              clarification={clarifications[currentStep.id]}
            />

            {/* Large prev/next buttons — primary touch navigation */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className={`flex-1 min-h-[56px] md:min-h-[48px] rounded-xl text-lg font-semibold transition-colors disabled:opacity-30 ${
                  highContrast
                    ? 'bg-gray-700 text-white disabled:bg-gray-800'
                    : 'bg-washi-dark text-indigo hover:bg-indigo hover:text-white'
                }`}
                aria-label="Previous step"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!pattern || currentStepIndex >= pattern.steps.length - 1}
                className={`flex-1 min-h-[56px] md:min-h-[48px] rounded-xl text-lg font-semibold transition-colors disabled:opacity-30 ${
                  highContrast
                    ? 'bg-gray-200 text-black disabled:bg-gray-800 disabled:text-gray-500'
                    : 'bg-persimmon text-white hover:opacity-90'
                }`}
                aria-label="Next step"
              >
                Next →
              </button>
            </div>

            {/* Step counter */}
            <div className={`text-center text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-ink-gray'}`}>
              Step {currentStepIndex + 1} of {pattern.steps.length}
              {completedSteps.length > 0 && ` — ${completedSteps.length} completed`}
            </div>

            {/* Fan navigation — step dots for quick jump (hidden on very small screens) */}
            <div className="hidden sm:block">
              <FanNavigation
                items={navItems}
                currentIndex={currentStepIndex}
                completedIndices={completedSteps}
                onSelect={handleStepSelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>

            {/* Keyboard shortcut hint — desktop only */}
            <Text
              size="sm"
              color="muted"
              className="text-center mt-2 hidden md:block"
              style={highContrast ? { color: '#999' } : undefined}
            >
              ← → navigate • M materials • Esc back
            </Text>
          </Stack>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-ink-faint/20 mt-8">
        <Text size="sm" color="muted">
          Quiltographer Pattern Reader • Built with care for quilters
        </Text>
      </footer>
    </div>
  );
}
