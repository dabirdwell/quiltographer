'use client';

import React, { useState } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { calculateBinding, calculateBacking, convertMeasurement, formatAsFraction } from '@/lib/reader/calculators';

const theme = quiltographerTheme;

type CalculatorTab = 'binding' | 'backing' | 'convert';

interface MiniCalculatorsProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWidth?: number;
  defaultHeight?: number;
}

export function MiniCalculators({ isOpen, onClose, defaultWidth, defaultHeight }: MiniCalculatorsProps) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('binding');

  // Binding calculator state
  const [quiltWidth, setQuiltWidth] = useState(defaultWidth || 60);
  const [quiltHeight, setQuiltHeight] = useState(defaultHeight || 72);
  const [bindingWidth, setBindingWidth] = useState(2.5);

  // Backing calculator state
  const [backingFabricWidth, setBackingFabricWidth] = useState(42);

  // Conversion state
  const [convertValue, setConvertValue] = useState(10);
  const [convertFrom, setConvertFrom] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const bindingResult = calculateBinding(quiltWidth, quiltHeight, bindingWidth);
  const backingResult = calculateBacking(quiltWidth, quiltHeight, backingFabricWidth);
  const conversionResult = convertMeasurement(convertValue, convertFrom);

  const tabs: Array<{ id: CalculatorTab; label: string; icon: string }> = [
    { id: 'binding', label: 'Binding', icon: '🎀' },
    { id: 'backing', label: 'Backing', icon: '📦' },
    { id: 'convert', label: 'Convert', icon: '↔️' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 998,
          animation: `fadeIn ${theme.timing.quick} ${theme.timing.easeOut}`,
        }}
      />

      {/* Calculator drawer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '80vh',
        backgroundColor: theme.colors.washi,
        backgroundImage: theme.textures.washiFiber,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        zIndex: 999,
        overflow: 'hidden',
        animation: `slideUp ${theme.timing.unfold} ${theme.timing.spring}`,
      }}>
        {/* Handle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0.75rem',
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: theme.colors.inkGray,
            borderRadius: theme.radius.full,
            opacity: 0.3,
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem 1rem',
          borderBottom: theme.borders.hairline,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
          }}>
            🧮 Quick Calculators
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.washiDark,
              border: 'none',
              borderRadius: theme.radius.full,
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: theme.colors.inkGray,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem 1.5rem',
          borderBottom: theme.borders.hairline,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === tab.id ? theme.colors.indigo : theme.colors.rice,
                color: activeTab === tab.id ? theme.colors.rice : theme.colors.inkBlack,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 180px)',
        }}>
          {/* Binding Calculator */}
          {activeTab === 'binding' && (
            <div>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: theme.colors.inkGray,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Calculate how much binding fabric you need for your quilt.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Quilt Width (inches)
                    </span>
                    <input
                      type="number"
                      value={quiltWidth}
                      onChange={e => setQuiltWidth(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.base,
                      }}
                    />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Quilt Height (inches)
                    </span>
                    <input
                      type="number"
                      value={quiltHeight}
                      onChange={e => setQuiltHeight(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.base,
                      }}
                    />
                  </label>
                </div>

                <label style={{ display: 'block' }}>
                  <span style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.inkGray,
                  }}>
                    Binding Strip Width
                  </span>
                  <select
                    value={bindingWidth}
                    onChange={e => setBindingWidth(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: theme.borders.subtle,
                      borderRadius: theme.radius.md,
                      fontSize: theme.typography.fontSize.base,
                      backgroundColor: theme.colors.rice,
                    }}
                  >
                    <option value={2}>2" (single fold)</option>
                    <option value={2.25}>2¼" (standard double)</option>
                    <option value={2.5}>2½" (generous double)</option>
                    <option value={3}>3" (wide binding)</option>
                  </select>
                </label>
              </div>

              {/* Results */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: theme.colors.rice,
                borderRadius: theme.radius.lg,
                border: `2px solid ${theme.colors.sage}40`,
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: theme.colors.sage,
                  fontSize: theme.typography.fontSize.base,
                }}>
                  You'll Need:
                </h4>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: 600,
                  color: theme.colors.indigo,
                  marginBottom: '1rem',
                  fontFamily: theme.typography.fontFamily.display,
                }}>
                  {bindingResult.cutInstruction}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.inkGray,
                }}>
                  <div>
                    <div style={{ fontWeight: 500, color: theme.colors.inkBlack }}>Total length</div>
                    <div>{bindingResult.totalLength}" ({Math.round(bindingResult.totalLength / 36 * 10) / 10} yards)</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: theme.colors.inkBlack }}>Fabric needed</div>
                    <div>{bindingResult.fabricNeeded}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backing Calculator */}
          {activeTab === 'backing' && (
            <div>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: theme.colors.inkGray,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Calculate backing fabric yardage with piecing instructions.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Quilt Width (inches)
                    </span>
                    <input
                      type="number"
                      value={quiltWidth}
                      onChange={e => setQuiltWidth(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.base,
                      }}
                    />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Quilt Height (inches)
                    </span>
                    <input
                      type="number"
                      value={quiltHeight}
                      onChange={e => setQuiltHeight(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.base,
                      }}
                    />
                  </label>
                </div>

                <label style={{ display: 'block' }}>
                  <span style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.inkGray,
                  }}>
                    Fabric Width (inches)
                  </span>
                  <select
                    value={backingFabricWidth}
                    onChange={e => setBackingFabricWidth(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: theme.borders.subtle,
                      borderRadius: theme.radius.md,
                      fontSize: theme.typography.fontSize.base,
                      backgroundColor: theme.colors.rice,
                    }}
                  >
                    <option value={42}>42" (standard quilting cotton)</option>
                    <option value={44}>44" (quilting cotton)</option>
                    <option value={54}>54" (home dec)</option>
                    <option value={60}>60" (wide backing)</option>
                    <option value={108}>108" (extra-wide backing)</option>
                  </select>
                </label>
              </div>

              {/* Results */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: theme.colors.rice,
                borderRadius: theme.radius.lg,
                border: `2px solid ${theme.colors.clay}40`,
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: theme.colors.clay,
                  fontSize: theme.typography.fontSize.base,
                }}>
                  You'll Need:
                </h4>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: 600,
                  color: theme.colors.indigo,
                  marginBottom: '1rem',
                  fontFamily: theme.typography.fontFamily.display,
                }}>
                  {backingResult.yardageNeeded} yards
                </div>
                {backingResult.seamPlacement !== 'none' && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: `${theme.colors.clay}15`,
                    borderRadius: theme.radius.md,
                    marginBottom: '1rem',
                  }}>
                    <div style={{ fontWeight: 500, color: theme.colors.clay, marginBottom: '0.5rem' }}>
                      {backingResult.seamPlacement === 'vertical' ? '↕️' : '↔️'} {backingResult.seamPlacement.charAt(0).toUpperCase() + backingResult.seamPlacement.slice(1)} seam
                    </div>
                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.inkGray }}>
                      You'll need to piece {backingResult.pieceCount} pieces
                    </div>
                  </div>
                )}
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.inkGray }}>
                  {backingResult.cutInstructions.map((instruction, i) => (
                    <div key={i} style={{ marginBottom: '0.25rem' }}>• {instruction}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Calculator */}
          {activeTab === 'convert' && (
            <div>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: theme.colors.inkGray,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Convert between inches and centimeters.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Value
                    </span>
                    <input
                      type="number"
                      value={convertValue}
                      onChange={e => setConvertValue(Number(e.target.value))}
                      step="0.1"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.lg,
                      }}
                    />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.inkGray,
                    }}>
                      Unit
                    </span>
                    <select
                      value={convertFrom}
                      onChange={e => setConvertFrom(e.target.value as 'inches' | 'cm')}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: theme.borders.subtle,
                        borderRadius: theme.radius.md,
                        fontSize: theme.typography.fontSize.base,
                        backgroundColor: theme.colors.rice,
                      }}
                    >
                      <option value="inches">inches</option>
                      <option value="cm">cm</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Results */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: theme.colors.rice,
                borderRadius: theme.radius.lg,
                border: `2px solid ${theme.colors.indigo}40`,
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.inkGray,
                  marginBottom: '0.5rem',
                }}>
                  {convertValue} {convertFrom} =
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize['3xl'],
                  fontWeight: 600,
                  color: theme.colors.indigo,
                  fontFamily: theme.typography.fontFamily.display,
                }}>
                  {conversionResult.converted} {conversionResult.toUnit}
                </div>
                {convertFrom === 'cm' && (
                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.sage,
                  }}>
                    ≈ {formatAsFraction(conversionResult.converted)}"
                  </div>
                )}
              </div>

              {/* Quick reference */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: theme.colors.washiDark,
                borderRadius: theme.radius.md,
              }}>
                <h5 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.inkGray,
                }}>
                  Common Conversions
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.inkBlack,
                }}>
                  {[
                    { in: '¼"', cm: '0.6cm' },
                    { in: '½"', cm: '1.3cm' },
                    { in: '1"', cm: '2.5cm' },
                    { in: '2½"', cm: '6.4cm' },
                    { in: '5"', cm: '12.7cm' },
                    { in: '10"', cm: '25.4cm' },
                  ].map(item => (
                    <div key={item.in} style={{
                      padding: '0.5rem',
                      backgroundColor: theme.colors.rice,
                      borderRadius: theme.radius.sm,
                      textAlign: 'center',
                    }}>
                      {item.in} = {item.cm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// Calculator trigger button
interface CalculatorButtonProps {
  onClick: () => void;
}

export function CalculatorButton({ onClick }: CalculatorButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '56px',
        height: '56px',
        backgroundColor: theme.colors.indigo,
        color: theme.colors.rice,
        border: 'none',
        borderRadius: theme.radius.full,
        cursor: 'pointer',
        boxShadow: theme.shadows.lifted,
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
        zIndex: 100,
      }}
      title="Open calculators"
    >
      🧮
    </button>
  );
}

export default MiniCalculators;
