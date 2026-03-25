'use client';

import React, { useState, useRef } from 'react';
import { Text, Stack, Surface, Button, Badge } from '@/components/ui';
import type { ReaderPattern, CuttingInstruction } from '@/lib/reader/schema';

interface PatternResultsProps {
  pattern: ReaderPattern;
  onStartReading: () => void;
  highContrast?: boolean;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Beginner',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

function AccordionSection({
  title,
  defaultOpen = false,
  children,
  highContrast,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  highContrast?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`border rounded-xl overflow-hidden ${
        highContrast ? 'border-gray-600 bg-gray-800' : 'border-ink-faint/20 bg-white'
      }`}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left font-semibold transition-colors min-h-[48px] ${
          highContrast
            ? 'text-white hover:bg-gray-700'
            : 'text-indigo hover:bg-indigo/5'
        }`}
      >
        <span>{title}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className={`px-5 pb-5 ${highContrast ? 'text-gray-200' : 'text-ink-black'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function CuttingTable({
  instructions,
  highContrast,
}: {
  instructions: CuttingInstruction[];
  highContrast?: boolean;
}) {
  if (instructions.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`text-left ${
              highContrast ? 'bg-gray-700 text-gray-200' : 'bg-indigo/10 text-indigo'
            }`}
          >
            <th className="px-4 py-3 font-semibold">Fabric</th>
            <th className="px-4 py-3 font-semibold text-center">Qty</th>
            <th className="px-4 py-3 font-semibold">Dimensions</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${highContrast ? 'divide-gray-600' : 'divide-ink-faint/10'}`}>
          {instructions.flatMap((ci) =>
            ci.pieces.map((piece, pi) => (
              <tr
                key={`${ci.id}-${pi}`}
                className={highContrast ? 'hover:bg-gray-700' : 'hover:bg-washi/50'}
              >
                <td className="px-4 py-2.5 font-medium">{pi === 0 ? ci.fabric : ''}</td>
                <td className="px-4 py-2.5 text-center font-semibold">{piece.quantity}</td>
                <td className="px-4 py-2.5">{piece.dimensions}</td>
                <td className={`px-4 py-2.5 text-sm ${highContrast ? 'text-gray-400' : 'text-ink-gray'}`}>
                  {piece.notes || '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PatternResults({ pattern, onStartReading, highContrast = false }: PatternResultsProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${pattern.name} — Quiltographer</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #2d2d2d; }
  h1 { color: #264653; margin-bottom: 0.25rem; }
  h2 { color: #264653; border-bottom: 2px solid #264653; padding-bottom: 0.5rem; margin-top: 2rem; }
  h3 { color: #264653; margin-top: 1.5rem; }
  .meta { color: #6b7280; margin-bottom: 1.5rem; }
  .summary { background: #f9f0dc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th { background: #264653; color: white; text-align: left; padding: 8px 12px; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  .materials-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .material { padding: 0.25rem 0; }
  .material-qty { color: #e76f51; font-weight: 500; }
  .step { margin-bottom: 1.5rem; page-break-inside: avoid; }
  .step-num { color: #e76f51; font-weight: 700; }
  .step-section { color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .warning { background: #fef3c7; padding: 0.5rem 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.875rem; }
  .tip { background: #ecfdf5; padding: 0.5rem 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.875rem; }
  @media print { body { padding: 0; } }
</style></head><body>`);

    printWindow.document.write(`<h1>${pattern.name}</h1>`);
    printWindow.document.write(
      `<p class="meta">${pattern.finishedSize.width}" x ${pattern.finishedSize.height}" — ${DIFFICULTY_LABELS[pattern.difficulty] || 'Intermediate'} — ~${pattern.estimatedTime}h</p>`
    );

    if (pattern.summary) {
      printWindow.document.write(`<div class="summary">${pattern.summary}</div>`);
    }

    // Materials
    if (pattern.materials.length > 0) {
      printWindow.document.write('<h2>Materials</h2><div class="materials-grid">');
      pattern.materials.forEach((m) => {
        printWindow.document.write(
          `<div class="material">${m.name} ${m.quantity || m.amount ? `<span class="material-qty">${m.quantity || m.amount}</span>` : ''}</div>`
        );
      });
      printWindow.document.write('</div>');
    }

    // Cutting
    if (pattern.cuttingInstructions.length > 0) {
      printWindow.document.write('<h2>Cutting Instructions</h2><table><tr><th>Fabric</th><th>Qty</th><th>Dimensions</th><th>Notes</th></tr>');
      pattern.cuttingInstructions.forEach((ci) => {
        ci.pieces.forEach((p, pi) => {
          printWindow.document.write(
            `<tr><td>${pi === 0 ? ci.fabric : ''}</td><td>${p.quantity}</td><td>${p.dimensions}</td><td>${p.notes || '—'}</td></tr>`
          );
        });
      });
      printWindow.document.write('</table>');
    }

    // Steps
    printWindow.document.write('<h2>Assembly Steps</h2>');
    let lastSection = '';
    pattern.steps.forEach((step) => {
      if (step.section && step.section !== lastSection) {
        printWindow.document.write(`<h3>${step.section}</h3>`);
        lastSection = step.section;
      }
      printWindow.document.write(`<div class="step">`);
      printWindow.document.write(
        `<p><span class="step-num">Step ${step.number}.</span> ${step.title ? `<strong>${step.title}</strong> — ` : ''}${step.instruction}</p>`
      );
      step.warnings.forEach((w) => {
        printWindow.document.write(`<div class="warning">⚠ ${w.message}</div>`);
      });
      step.tips.forEach((t) => {
        printWindow.document.write(`<div class="tip">💡 ${t.text}</div>`);
      });
      printWindow.document.write('</div>');
    });

    printWindow.document.write('<hr><p style="color:#6b7280;font-size:0.75rem;text-align:center;">Generated by Quiltographer Pattern Reader</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // Group steps by section
  const stepsBySection: { section: string; steps: typeof pattern.steps }[] = [];
  let currentSection = '';
  pattern.steps.forEach((step) => {
    const section = step.section || 'General';
    if (section !== currentSection) {
      stepsBySection.push({ section, steps: [step] });
      currentSection = section;
    } else {
      stepsBySection[stepsBySection.length - 1].steps.push(step);
    }
  });

  const fabricMaterials = pattern.materials.filter((m) => m.type === 'fabric');
  const otherMaterials = pattern.materials.filter((m) => m.type !== 'fabric');

  return (
    <div ref={printRef} className="max-w-[900px] mx-auto">
      {/* Pattern header */}
      <Surface elevated className="mb-6">
        <div className="p-6 md:p-8">
          <Stack gap="sm">
            <Text variant="heading" size="3xl" color={highContrast ? 'default' : 'indigo'}>
              {pattern.name}
            </Text>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge color="indigo">
                {pattern.finishedSize.width}&quot; x {pattern.finishedSize.height}&quot;
              </Badge>
              <Badge color={pattern.difficulty <= 2 ? 'sage' : pattern.difficulty <= 3 ? 'clay' : 'persimmon'}>
                {DIFFICULTY_LABELS[pattern.difficulty] || 'Intermediate'}
              </Badge>
              {pattern.estimatedTime > 0 && (
                <Badge color="indigo">~{pattern.estimatedTime}h</Badge>
              )}
              <Badge color="indigo">{pattern.steps.length} steps</Badge>
            </div>
            {pattern.summary && (
              <Text color="muted" className="leading-relaxed mt-2">
                {pattern.summary}
              </Text>
            )}
          </Stack>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={onStartReading}
              className="px-6 py-3 min-h-[48px] bg-persimmon text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
            >
              Start Reading Step-by-Step
            </button>
            <button
              onClick={handlePrint}
              className={`px-5 py-3 min-h-[48px] rounded-xl font-semibold border-2 transition-colors ${
                highContrast
                  ? 'border-gray-500 text-white hover:bg-gray-700'
                  : 'border-indigo text-indigo hover:bg-indigo hover:text-white'
              }`}
            >
              Print-Friendly Version
            </button>
          </div>
        </div>
      </Surface>

      {/* Materials */}
      {pattern.materials.length > 0 && (
        <AccordionSection title={`Materials (${pattern.materials.length})`} defaultOpen highContrast={highContrast}>
          {fabricMaterials.length > 0 && (
            <>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${highContrast ? 'text-gray-400' : 'text-indigo'}`}>
                Fabrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                {fabricMaterials.map((m) => (
                  <div key={m.id} className="flex justify-between items-baseline gap-2 py-1">
                    <span className="font-medium">{m.name}</span>
                    {(m.quantity || m.amount) && (
                      <span className={`text-sm font-semibold flex-shrink-0 ${highContrast ? 'text-orange-300' : 'text-persimmon'}`}>
                        {m.quantity || m.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {otherMaterials.length > 0 && (
            <>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${highContrast ? 'text-gray-400' : 'text-indigo'}`}>
                Notions &amp; Tools
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {otherMaterials.map((m) => (
                  <div key={m.id} className="flex justify-between items-baseline gap-2 py-1">
                    <span className="font-medium">{m.name}</span>
                    {(m.quantity || m.amount) && (
                      <span className={`text-sm ${highContrast ? 'text-gray-400' : 'text-ink-gray'}`}>
                        {m.quantity || m.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </AccordionSection>
      )}

      {/* Cutting Instructions */}
      {pattern.cuttingInstructions.length > 0 && (
        <div className="mt-4">
          <AccordionSection title="Cutting Instructions" defaultOpen highContrast={highContrast}>
            <CuttingTable instructions={pattern.cuttingInstructions} highContrast={highContrast} />
          </AccordionSection>
        </div>
      )}

      {/* Assembly Steps grouped by section */}
      <div className="mt-4">
        <h3 className={`text-lg font-semibold mb-3 ${highContrast ? 'text-white' : 'text-indigo'}`}>
          Assembly Steps
        </h3>
        <Stack gap="sm">
          {stepsBySection.map((group) => (
            <AccordionSection
              key={group.section}
              title={`${group.section} (${group.steps.length} step${group.steps.length > 1 ? 's' : ''})`}
              defaultOpen={group === stepsBySection[0]}
              highContrast={highContrast}
            >
              <Stack gap="md">
                {group.steps.map((step) => (
                  <div key={step.id} className={`pb-4 ${highContrast ? 'border-b border-gray-600 last:border-0' : 'border-b border-ink-faint/10 last:border-0'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`font-bold ${highContrast ? 'text-orange-300' : 'text-persimmon'}`}>
                        Step {step.number}.
                      </span>
                      {step.title && (
                        <span className={`font-semibold ${highContrast ? 'text-white' : 'text-indigo'}`}>
                          {step.title}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{step.instruction}</p>
                    {step.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {step.warnings.map((w, wi) => (
                          <div
                            key={wi}
                            className={`text-sm px-3 py-2 rounded-lg ${
                              w.type === 'critical'
                                ? highContrast ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'
                                : highContrast ? 'bg-yellow-900/30 text-yellow-300' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {w.type === 'critical' ? '⚠️' : '💡'} {w.message}
                          </div>
                        ))}
                      </div>
                    )}
                    {step.techniques.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.techniques.map((t, ti) => (
                          <span
                            key={ti}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              highContrast ? 'bg-gray-700 text-gray-300' : 'bg-indigo/10 text-indigo'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Stack>
            </AccordionSection>
          ))}
        </Stack>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={onStartReading}
          className="px-8 py-4 min-h-[56px] bg-persimmon text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
        >
          Start Reading Step-by-Step
        </button>
        <Text size="sm" color="muted" className="mt-3 block">
          Follow each instruction one at a time, with AI help when you need it
        </Text>
      </div>
    </div>
  );
}

export default PatternResults;
