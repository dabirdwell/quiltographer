'use client';

import { HSTDiagram } from '@/components/diagrams/HSTDiagram';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Technique Diagrams</h1>
          <p className="text-stone-600">Click to step through • Click diagram or use arrows</p>
        </div>

        {/* HST Diagram - Default */}
        <div>
          <h2 className="text-xl font-semibold text-stone-700 mb-4">Half Square Triangle (HST)</h2>
          <HSTDiagram />
        </div>

        {/* HST - Warm palette */}
        <div>
          <h2 className="text-xl font-semibold text-stone-700 mb-4">HST - Amber and Rust</h2>
          <HSTDiagram 
            lightColor="#fef3c7"
            darkColor="#92400e"
            finishedSize='5"'
          />
        </div>

        {/* HST - Cool palette */}
        <div>
          <h2 className="text-xl font-semibold text-stone-700 mb-4">HST - Sky and Ocean</h2>
          <HSTDiagram 
            lightColor="#e0f2fe"
            darkColor="#0c4a6e"
            finishedSize='3.5"'
          />
        </div>
      </div>
    </div>
  );
}
