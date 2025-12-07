import { create } from 'zustand';

export interface PatternInstance {
  id: string;
  type: 'log-cabin' | 'flying-geese' | 'nine-patch' | 'sashiko-cross';
  x: number;
  y: number;
  rotation: number;
  scale: number;
  colors: Record<string, string | string[]>;
}

interface CanvasState {
  patterns: PatternInstance[];
  selectedPatternId: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  
  // Actions
  addPattern: (type: PatternInstance['type']) => void;
  updatePattern: (id: string, updates: Partial<PatternInstance>) => void;
  deletePattern: (id: string) => void;
  selectPattern: (id: string | null) => void;
  clearCanvas: () => void;
  startDragging: (id: string, offsetX: number, offsetY: number) => void;
  updateDragging: (x: number, y: number) => void;
  stopDragging: () => void;
}

// Default colors for each pattern type
const defaultColors = {
  'log-cabin': {
    center: '#e76f51',
    light: ['#faf8f3', '#f4a261', '#e9c46a'],
    dark: ['#264653', '#2a9d8f', '#457b9d']
  },
  'flying-geese': {
    triangle: '#264653',
    background: '#faf8f3'
  },
  'nine-patch': {
    corner: '#e76f51',
    center: '#264653',
    edge: '#84a98c'
  },
  'sashiko-cross': {
    thread: '#264653',
    background: '#faf8f3'
  }
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  patterns: [],
  selectedPatternId: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },

  addPattern: (type) => {
    const existingPatterns = get().patterns;
    // Wrap around if we're going off canvas
    const offset = (existingPatterns.length * 30) % 400;
    const row = Math.floor(existingPatterns.length / 10);
    
    const newPattern: PatternInstance = {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 100 + offset, // Keep within canvas bounds
      y: 100 + (row * 120), // Stack in rows
      rotation: 0,
      scale: 1,
      colors: defaultColors[type] || {}
    };

    set((state) => ({
      patterns: [...state.patterns, newPattern],
      selectedPatternId: newPattern.id
    }));
  },

  updatePattern: (id, updates) => {
    set((state) => ({
      patterns: state.patterns.map((pattern) =>
        pattern.id === id ? { ...pattern, ...updates } : pattern
      )
    }));
  },

  deletePattern: (id) => {
    set((state) => ({
      patterns: state.patterns.filter((pattern) => pattern.id !== id),
      selectedPatternId: state.selectedPatternId === id ? null : state.selectedPatternId
    }));
  },

  selectPattern: (id) => {
    set({ selectedPatternId: id });
  },

  clearCanvas: () => {
    set({ patterns: [], selectedPatternId: null });
  },

  startDragging: (id, offsetX, offsetY) => {
    set({ 
      selectedPatternId: id,
      isDragging: true,
      dragOffset: { x: offsetX, y: offsetY }
    });
  },

  updateDragging: (x, y) => {
    const state = get();
    if (state.isDragging && state.selectedPatternId) {
      // Snap to grid corners (50px grid) - offset by half pattern size
      const gridSize = 50;
      const halfPattern = 50; // Half of our 100px patterns
      
      // Snap pattern center to nearest grid corner
      const snappedX = Math.round((x - state.dragOffset.x) / gridSize) * gridSize;
      const snappedY = Math.round((y - state.dragOffset.y) / gridSize) * gridSize;
      
      set((state) => ({
        patterns: state.patterns.map((pattern) =>
          pattern.id === state.selectedPatternId
            ? { ...pattern, x: snappedX, y: snappedY }
            : pattern
        )
      }));
    }
  },

  stopDragging: () => {
    set({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  }
}));