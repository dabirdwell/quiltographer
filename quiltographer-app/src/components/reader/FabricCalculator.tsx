'use client';

import React, { useMemo, useState } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import type { ReaderPattern } from '@/lib/reader/schema';

const theme = quiltographerTheme;

const DEFAULT_SEAM_ALLOWANCE = 0.25; // inches
const FABRIC_WOF = 42; // standard width of fabric in inches

interface FabricCalculatorProps {
  pattern: ReaderPattern;
}

interface FabricLineItem {
  fabric: string;
  totalArea: number; // square inches
  yardage: number;
  yardageRounded: string;
  pieces: { shape: string; quantity: number; dimensions: string; area: number }[];
  listedAmount?: string; // from materials list
}

/** Parse dimension strings like '2 1/2" x 4 1/2"' or '2 1/2" x WOF' into [width, height] */
function parseDimension(dim: string): [number, number] | null {
  // Normalize the string
  const cleaned = dim.replace(/[""″]/g, '"').replace(/\s+/g, ' ').trim();

  // Match patterns like: 2 1/2 x 4 1/2 or 2.5 x 4.5
  const parts = cleaned.split(/\s*x\s*/i);
  if (parts.length !== 2) return null;

  const w = parseFraction(parts[0]);
  const h = parseFraction(parts[1]);

  if (w === null) return null;
  if (h === null) {
    // Check for WOF (Width of Fabric)
    if (/wof/i.test(parts[1])) {
      return [w, FABRIC_WOF];
    }
    return null;
  }

  return [w, h];
}

/** Parse mixed fractions like '2 1/2' or '10 1/4' into decimals */
function parseFraction(str: string): number | null {
  const cleaned = str.replace(/[""″']/g, '').trim();

  // Try decimal first
  const decimal = parseFloat(cleaned);
  if (!isNaN(decimal) && /^\d+\.?\d*$/.test(cleaned)) return decimal;

  // Mixed fraction: "2 1/2" or "2 3/4"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const den = parseInt(mixedMatch[3]);
    if (den === 0) return null;
    return whole + num / den;
  }

  // Simple fraction: "1/4" or "3/8"
  const fracMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1]);
    const den = parseInt(fracMatch[2]);
    if (den === 0) return null;
    return num / den;
  }

  // Just a number
  if (!isNaN(decimal)) return decimal;

  return null;
}

/** Convert square inches to yardage (36" x WOF) */
function sqInchesToYardage(sqInches: number): number {
  const usableWidth = FABRIC_WOF - 2; // selvage allowance
  const lengthInches = sqInches / usableWidth;
  // Add 10% waste factor for cutting layout
  const withWaste = lengthInches * 1.1;
  return withWaste / 36;
}

/** Round up to nearest standard yardage increment */
function roundToYardage(yards: number): string {
  const increments = [
    { value: 0.125, label: '1/8 yard' },
    { value: 0.25, label: '1/4 yard' },
    { value: 0.333, label: '1/3 yard' },
    { value: 0.5, label: '1/2 yard' },
    { value: 0.667, label: '2/3 yard' },
    { value: 0.75, label: '3/4 yard' },
    { value: 1.0, label: '1 yard' },
    { value: 1.25, label: '1 1/4 yards' },
    { value: 1.5, label: '1 1/2 yards' },
    { value: 1.75, label: '1 3/4 yards' },
    { value: 2.0, label: '2 yards' },
    { value: 2.5, label: '2 1/2 yards' },
    { value: 3.0, label: '3 yards' },
    { value: 3.5, label: '3 1/2 yards' },
    { value: 4.0, label: '4 yards' },
    { value: 4.5, label: '4 1/2 yards' },
    { value: 5.0, label: '5 yards' },
  ];

  for (const inc of increments) {
    if (yards <= inc.value) return inc.label;
  }
  return `${Math.ceil(yards)} yards`;
}

function calculateFabric(pattern: ReaderPattern, seamAllowance: number): FabricLineItem[] {
  const fabricMap = new Map<string, FabricLineItem>();

  // Build a map of material names to their listed amounts
  const materialAmounts = new Map<string, string>();
  pattern.materials.forEach(m => {
    if (m.type === 'fabric' && (m.amount || m.quantity)) {
      materialAmounts.set(m.name, m.amount || m.quantity || '');
    }
  });

  pattern.cuttingInstructions.forEach(ci => {
    const fabricName = ci.fabric;
    if (!fabricMap.has(fabricName)) {
      fabricMap.set(fabricName, {
        fabric: fabricName,
        totalArea: 0,
        yardage: 0,
        yardageRounded: '',
        pieces: [],
        listedAmount: materialAmounts.get(fabricName),
      });
    }
    const entry = fabricMap.get(fabricName)!;

    ci.pieces.forEach(piece => {
      const dims = parseDimension(piece.dimensions);
      let pieceArea = 0;

      if (dims) {
        const [w, h] = dims;
        // Add seam allowance to each side
        const adjW = w + seamAllowance * 2;
        const adjH = h + seamAllowance * 2;
        pieceArea = adjW * adjH * piece.quantity;

        // Triangles use ~half the area of their bounding rectangle
        if (piece.shape === 'triangle') {
          pieceArea = pieceArea * 0.6; // slightly more than half for waste
        }
      }

      entry.pieces.push({
        shape: piece.shape,
        quantity: piece.quantity,
        dimensions: piece.dimensions,
        area: pieceArea,
      });
      entry.totalArea += pieceArea;
    });
  });

  // Convert areas to yardage
  const results: FabricLineItem[] = [];
  fabricMap.forEach(entry => {
    entry.yardage = sqInchesToYardage(entry.totalArea);
    entry.yardageRounded = roundToYardage(entry.yardage);
    results.push(entry);
  });

  // Sort by yardage descending
  results.sort((a, b) => b.yardage - a.yardage);
  return results;
}

export function FabricCalculator({ pattern }: FabricCalculatorProps) {
  const [seamAllowance, setSeamAllowance] = useState(DEFAULT_SEAM_ALLOWANCE);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fabricList = useMemo(
    () => calculateFabric(pattern, seamAllowance),
    [pattern, seamAllowance]
  );

  const totalYardage = useMemo(
    () => fabricList.reduce((sum, f) => sum + f.yardage, 0),
    [fabricList]
  );

  // Also list fabrics from materials that aren't in cutting instructions (backing, binding, etc.)
  const extraFabrics = useMemo(() => {
    const cuttingFabrics = new Set(pattern.cuttingInstructions.map(ci => ci.fabric));
    return pattern.materials.filter(
      m => m.type === 'fabric' && !cuttingFabrics.has(m.name)
    );
  }, [pattern]);

  if (fabricList.length === 0 && extraFabrics.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#2a2420',
      backgroundImage: theme.textures.washiFiber,
      borderRadius: theme.radius.lg,
      border: '1px solid rgba(132, 169, 140, 0.15)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontWeight: 600,
            color: '#f5e6d3',
            fontFamily: theme.typography.fontFamily.display,
            fontSize: theme.typography.fontSize.lg,
          }}>
            Fabric Shopping List
          </span>
          <span style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.sage,
            backgroundColor: 'rgba(132, 169, 140, 0.15)',
            padding: '2px 8px',
            borderRadius: theme.radius.full,
            fontWeight: 600,
          }}>
            {fabricList.length + extraFabrics.length} fabrics
          </span>
        </div>

        {/* Seam allowance control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: theme.typography.fontSize.xs,
          color: 'rgba(245, 230, 211, 0.5)',
        }}>
          <span>Seam:</span>
          {[0.25, 0.375, 0.5].map(sa => (
            <button
              key={sa}
              onClick={() => setSeamAllowance(sa)}
              style={{
                padding: '2px 8px',
                borderRadius: theme.radius.sm,
                border: seamAllowance === sa
                  ? `1px solid ${theme.colors.persimmon}`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: seamAllowance === sa
                  ? 'rgba(231, 111, 81, 0.15)'
                  : 'transparent',
                color: seamAllowance === sa ? theme.colors.persimmon : 'rgba(245, 230, 211, 0.5)',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
                fontFamily: theme.typography.fontFamily.body,
                transition: `all ${theme.timing.quick}`,
              }}
            >
              {sa === 0.25 ? '1/4"' : sa === 0.375 ? '3/8"' : '1/2"'}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric list */}
      <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
        {/* Calculated fabrics from cutting instructions */}
        {fabricList.map(item => {
          const isExpanded = expanded === item.fabric;
          const barWidth = totalYardage > 0
            ? Math.max(8, (item.yardage / totalYardage) * 100)
            : 0;

          return (
            <div key={item.fabric} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => setExpanded(isExpanded ? null : item.fabric)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: theme.radius.sm,
                  backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: `background-color ${theme.timing.quick}`,
                  fontFamily: theme.typography.fontFamily.body,
                  textAlign: 'left',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: '#f5e6d3',
                    fontWeight: 500,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.fabric}
                  </div>
                  {/* Yardage bar */}
                  <div style={{
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      backgroundColor: theme.colors.sage,
                      borderRadius: '2px',
                      transition: `width ${theme.timing.unfold} ${theme.timing.easeOut}`,
                    }} />
                  </div>
                </div>

                <div style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.sage,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {item.yardageRounded}
                  </div>
                  {item.listedAmount && (
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: 'rgba(245, 230, 211, 0.4)',
                      whiteSpace: 'nowrap',
                    }}>
                      pattern says: {item.listedAmount}
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded piece detail */}
              {isExpanded && (
                <div style={{
                  padding: '8px 12px 12px 24px',
                  fontSize: theme.typography.fontSize.xs,
                  color: 'rgba(245, 230, 211, 0.6)',
                }}>
                  {item.pieces.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '3px 0',
                      borderBottom: i < item.pieces.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.04)'
                        : 'none',
                    }}>
                      <span>
                        {p.quantity}× {p.shape} — {p.dimensions}
                      </span>
                      <span style={{ color: 'rgba(245, 230, 211, 0.4)', fontFamily: theme.typography.fontFamily.mono }}>
                        {p.area > 0 ? `${Math.round(p.area)} sq in` : '—'}
                      </span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    color: 'rgba(245, 230, 211, 0.7)',
                  }}>
                    <span>Total area</span>
                    <span style={{ fontFamily: theme.typography.fontFamily.mono }}>
                      {Math.round(item.totalArea)} sq in
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Extra fabrics from materials list (backing, binding, etc.) */}
        {extraFabrics.length > 0 && (
          <>
            <div style={{
              margin: '12px 0 8px',
              padding: '0 12px',
              fontSize: theme.typography.fontSize.xs,
              color: 'rgba(245, 230, 211, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}>
              Also needed
            </div>
            {extraFabrics.map(mat => (
              <div key={mat.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                fontSize: theme.typography.fontSize.sm,
              }}>
                <span style={{ color: '#f5e6d3', fontWeight: 500 }}>
                  {mat.name}
                </span>
                <span style={{
                  color: theme.colors.clay,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {mat.amount || mat.quantity || '—'}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Total summary */}
        {fabricList.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: theme.radius.sm,
            backgroundColor: 'rgba(132, 169, 140, 0.08)',
            border: '1px solid rgba(132, 169, 140, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              color: 'rgba(245, 230, 211, 0.6)',
            }}>
              Calculated total (cutting pieces only)
            </span>
            <span style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.sage,
              fontWeight: 700,
              fontFamily: theme.typography.fontFamily.display,
            }}>
              {roundToYardage(totalYardage)}
            </span>
          </div>
        )}

        {/* Info note */}
        <div style={{
          marginTop: '10px',
          padding: '0 12px',
          fontSize: theme.typography.fontSize.xs,
          color: 'rgba(245, 230, 211, 0.35)',
          lineHeight: theme.typography.lineHeight.normal,
        }}>
          Includes {seamAllowance === 0.25 ? '1/4"' : seamAllowance === 0.375 ? '3/8"' : '1/2"'} seam
          allowance + 10% waste. Based on {FABRIC_WOF}&quot; WOF. Always buy a little extra.
        </div>
      </div>
    </div>
  );
}

export default FabricCalculator;
