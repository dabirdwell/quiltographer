'use client';

import { Canvas } from '@/components/canvas/Canvas';
import { LogCabinBlock } from '@/components/patterns/LogCabinBlock';
import { Toolbar } from '@/components/tools/Toolbar';
import { useCanvasStore } from '@/store/canvas-store';

export default function Home() {
  const { addPattern } = useCanvasStore();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-light tracking-wide">
            Quiltographer
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Where tradition meets innovation in quilt design
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h2 className="text-lg font-medium mb-3">Pattern Library</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => addPattern('log-cabin')}
                  className="w-full text-left px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
                >
                  Log Cabin
                </button>                <button 
                  onClick={() => addPattern('flying-geese')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                >
                  Flying Geese
                </button>
                <button 
                  onClick={() => addPattern('nine-patch')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                >
                  Nine Patch
                </button>
                <button 
                  onClick={() => addPattern('sashiko-cross')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                >
                  Sashiko Cross
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h2 className="text-lg font-medium mb-3">Color Palette</h2>
              <div className="grid grid-cols-5 gap-2">
                <div 
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: '#e76f51' }}
                  title="Persimmon"
                />
                <div 
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: '#264653' }}
                  title="Indigo"
                />                <div 
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: '#84a98c' }}
                  title="Sage"
                />
                <div 
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: '#e9c46a' }}
                  title="Clay"
                />
                <div 
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: '#1a1a1a' }}
                  title="Sumi"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h2 className="text-lg font-medium mb-3">Controls</h2>
              <div className="text-sm space-y-1 text-gray-600">
                <p><kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> Rotate selected</p>
                <p><kbd className="px-2 py-1 bg-gray-100 rounded">Delete</kbd> Remove selected</p>
                <p>• Patterns snap to grid</p>
              </div>
            </div>
          </aside>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <Toolbar className="mb-4" />
              <Canvas className="w-full h-[600px]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}