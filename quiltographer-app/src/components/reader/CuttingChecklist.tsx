'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { quiltographerTheme } from '../japanese/theme';

const theme = quiltographerTheme;

export interface CuttingItem {
  id: string;
  fabric: string;
  fabricColor?: string;
  quantity: number;
  size: string;
  notes?: string;
}

interface CuttingChecklistProps {
  items: CuttingItem[];
  patternId: string;
  onComplete?: () => void;
}

export function CuttingChecklist({ items, patternId, onComplete }: CuttingChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const STORAGE_KEY = `cutting-checklist-${patternId}`;

  // Load checked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load cutting checklist:', e);
    }
  }, [STORAGE_KEY]);

  // Save checked state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    } catch (e) {
      console.warn('Failed to save cutting checklist:', e);
    }
  }, [checkedItems, STORAGE_KEY]);

  // Group items by fabric
  const groupedItems = useMemo(() => {
    const groups: Record<string, CuttingItem[]> = {};
    items.forEach(item => {
      if (!groups[item.fabric]) {
        groups[item.fabric] = [];
      }
      groups[item.fabric].push(item);
    });
    return groups;
  }, [items]);

  // Calculate progress
  const progress = useMemo(() => {
    const total = items.length;
    const completed = Object.values(checkedItems).filter(Boolean).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [items, checkedItems]);

  // Check for completion
  useEffect(() => {
    if (progress.percent === 100 && progress.total > 0) {
      setShowCelebration(true);
      onComplete?.();
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progress.percent, progress.total, onComplete]);

  // Toggle item
  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Reset checklist
  const resetChecklist = () => {
    if (window.confirm('Reset all cutting progress?')) {
      setCheckedItems({});
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: theme.colors.rice,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.inkGray}20`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing.breathe,
          backgroundColor: theme.colors.washi,
          border: 'none',
          borderBottom: isCollapsed ? 'none' : theme.borders.hairline,
          cursor: 'pointer',
          transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>✂️</span>
          <span style={{
            fontWeight: 600,
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
            fontSize: theme.typography.fontSize.lg,
          }}>
            Cutting Checklist
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Progress indicator */}
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            color: progress.percent === 100 ? theme.colors.sage : theme.colors.inkGray,
            fontWeight: progress.percent === 100 ? 600 : 400,
          }}>
            {progress.completed} of {progress.total}
          </span>

          {/* Chevron */}
          <span style={{
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: `transform ${theme.timing.quick} ${theme.timing.easeOut}`,
            color: theme.colors.inkGray,
          }}>
            ▼
          </span>
        </div>
      </button>

      {/* Celebration message */}
      {showCelebration && (
        <div style={{
          padding: theme.spacing.breathe,
          backgroundColor: `${theme.colors.sage}20`,
          textAlign: 'center',
          animation: `fadeIn ${theme.timing.breathe} ${theme.timing.easeOut}`,
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎉</span>
          <span style={{
            color: theme.colors.sage,
            fontWeight: 600,
            fontFamily: theme.typography.fontFamily.display,
          }}>
            All pieces ready! Time to sew!
          </span>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <div style={{
          padding: theme.spacing.breathe,
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {/* Progress bar */}
          <div style={{
            height: '4px',
            backgroundColor: theme.colors.washiDark,
            borderRadius: theme.radius.full,
            marginBottom: theme.spacing.breathe,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress.percent}%`,
              backgroundColor: progress.percent === 100 ? theme.colors.sage : theme.colors.indigo,
              borderRadius: theme.radius.full,
              transition: `width ${theme.timing.unfold} ${theme.timing.easeOut}`,
            }} />
          </div>

          {/* Grouped items */}
          {Object.entries(groupedItems).map(([fabric, fabricItems]) => (
            <div key={fabric} style={{ marginBottom: '1.25rem' }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.indigo,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: theme.typography.fontFamily.body,
              }}>
                {fabric}
              </h4>

              {fabricItems.map(item => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    marginBottom: '0.25rem',
                    borderRadius: theme.radius.sm,
                    cursor: 'pointer',
                    backgroundColor: checkedItems[item.id] ? `${theme.colors.sage}15` : 'transparent',
                    transition: `background-color ${theme.timing.quick} ${theme.timing.easeOut}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggleItem(item.id)}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: theme.colors.sage,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: theme.typography.fontSize.base,
                      color: checkedItems[item.id] ? theme.colors.inkGray : theme.colors.inkBlack,
                      textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                      transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                    }}>
                      <span style={{ fontWeight: 500 }}>({item.quantity})</span>{' '}
                      {item.size}
                    </div>

                    {item.notes && (
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.inkGray,
                        marginTop: '0.25rem',
                      }}>
                        {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Color swatch */}
                  {item.fabricColor && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: theme.radius.sm,
                      backgroundColor: item.fabricColor,
                      border: `1px solid ${theme.colors.inkGray}40`,
                    }} />
                  )}
                </label>
              ))}
            </div>
          ))}

          {/* Reset button */}
          <div style={{
            marginTop: theme.spacing.breathe,
            paddingTop: theme.spacing.breathe,
            borderTop: theme.borders.hairline,
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={resetChecklist}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: theme.colors.inkGray,
                border: theme.borders.subtle,
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              <span>⟳</span>
              Reset checklist
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Helper to extract cutting instructions from pattern steps
export function extractCuttingItems(steps: Array<{ instruction: string; title?: string }>): CuttingItem[] {
  const items: CuttingItem[] = [];
  let itemId = 0;

  // Pattern to match cutting instructions like "(4) 5" squares" or "2 strips 2½" x WOF"
  const cuttingPatterns = [
    /\((\d+)\)\s*(\d+(?:½|¼|¾|\.?\d*)?["″]?\s*(?:x\s*\d+(?:½|¼|¾|\.?\d*)?["″]?)?\s*(?:squares?|strips?|rectangles?|pieces?))/gi,
    /(\d+)\s*(?:strips?|pieces?|squares?|rectangles?)\s*(\d+(?:½|¼|¾|\.?\d*)?["″]?\s*(?:x\s*(?:\d+(?:½|¼|¾|\.?\d*)?["″]?|WOF))?)/gi,
    /cut\s*(\d+)\s*(\d+(?:½|¼|¾|\.?\d*)?["″]?\s*(?:x\s*\d+(?:½|¼|¾|\.?\d*)?["″]?)?\s*(?:squares?|strips?|rectangles?|pieces?))/gi,
  ];

  // Track which fabric we're currently processing
  let currentFabric = 'Fabric';

  steps.forEach(step => {
    const text = step.instruction;

    // Try to detect fabric references
    const fabricMatch = text.match(/(?:from|with|using)\s+(?:the\s+)?(\w+(?:\s+\w+)?)\s+(?:fabric|strips?)/i);
    if (fabricMatch) {
      currentFabric = fabricMatch[1];
    }

    // Also check for fabric color hints
    if (text.toLowerCase().includes('light')) currentFabric = 'Light Fabric';
    else if (text.toLowerCase().includes('dark')) currentFabric = 'Dark Fabric';
    else if (text.toLowerCase().includes('background')) currentFabric = 'Background';
    else if (text.toLowerCase().includes('accent')) currentFabric = 'Accent';
    else if (text.toLowerCase().includes('binding')) currentFabric = 'Binding';

    // Extract cutting instructions
    cuttingPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const quantity = parseInt(match[1]) || 1;
        const size = match[2].trim();

        // Avoid duplicates
        const isDuplicate = items.some(
          item => item.fabric === currentFabric && item.size === size && item.quantity === quantity
        );

        if (!isDuplicate) {
          items.push({
            id: `cut-${itemId++}`,
            fabric: currentFabric,
            quantity,
            size,
          });
        }
      }
    });
  });

  return items;
}

export default CuttingChecklist;
