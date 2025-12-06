"use strict";
// Universal Pattern Schema for Quiltographer
// Works across all features: Pattern Reader, AI Chat, Canvas, Sharing, Export
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUILT_ABBREVIATIONS = void 0;
exports.validateUniversalPattern = validateUniversalPattern;
exports.expandAbbreviation = expandAbbreviation;
exports.parseImperialMeasurement = parseImperialMeasurement;
exports.convertToMetric = convertToMetric;
exports.toEQ8Format = toEQ8Format;
exports.toPrintableHTML = toPrintableHTML;
exports.analyzeComplexity = analyzeComplexity;
exports.migratePattern = migratePattern;
// Validation
function validateUniversalPattern(pattern) {
    const errors = [];
    const warnings = [];
    // Required fields
    if (!pattern.id)
        errors.push('Pattern ID required');
    if (!pattern.metadata?.name)
        errors.push('Pattern name required');
    if (!pattern.source?.type)
        errors.push('Source type required');
    // Pattern Reader specifics
    if (pattern.source.type === 'pdf') {
        if (!pattern.construction?.steps?.length) {
            errors.push('PDF patterns must have construction steps');
        }
        if (!pattern.materials?.fabrics?.length) {
            warnings.push('PDF patterns should include fabric requirements');
        }
    }
    // AI generated specifics
    if (pattern.source.type === 'ai-generated') {
        if (!pattern.extensions?.ai?.prompt) {
            warnings.push('AI patterns should include the original prompt');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
// Common abbreviations to expand
exports.QUILT_ABBREVIATIONS = {
    'RST': 'Right Sides Together',
    'WST': 'Wrong Sides Together',
    'HST': 'Half Square Triangle',
    'QST': 'Quarter Square Triangle',
    'WOF': 'Width of Fabric',
    'LOF': 'Length of Fabric',
    'FQ': 'Fat Quarter',
    'FE': 'Fat Eighth',
    'SA': 'Seam Allowance',
    'BOM': 'Block of the Month',
    'UFO': 'UnFinished Object',
    'WIP': 'Work In Progress',
    'FMQ': 'Free Motion Quilting',
    'EPP': 'English Paper Piecing',
    'Y2Y': 'Yard to Yard',
}; // Additional type definitions for Universal Pattern Schema
// Helper functions for Pattern Reader
function expandAbbreviation(text) {
    let expanded = text;
    Object.entries(exports.QUILT_ABBREVIATIONS).forEach(([abbr, full]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'g');
        expanded = expanded.replace(regex, `${full} (${abbr})`);
    });
    return expanded;
}
function parseImperialMeasurement(text) {
    // Handles "2½", "2 1/2", "2.5" inches
    const match = text.match(/(\d+)(?:\s*(\d+)\/(\d+)|\.(\d+)|½)?/);
    if (!match)
        return null;
    const whole = parseInt(match[1]);
    let fraction = 0;
    if (match[2] && match[3]) {
        fraction = parseInt(match[2]) / parseInt(match[3]);
    }
    else if (match[4]) {
        fraction = parseInt(match[4]) / Math.pow(10, match[4].length);
    }
    else if (text.includes('½')) {
        fraction = 0.5;
    }
    return whole + fraction;
}
// Pattern transformation utilities
function convertToMetric(pattern) {
    // Deep clone and convert all measurements
    const metricPattern = JSON.parse(JSON.stringify(pattern));
    // Convert dimensions throughout
    // ... implementation
    return metricPattern;
}
// Export utilities for different platforms
function toEQ8Format(pattern) {
    // Convert to Electric Quilt 8 format
    // ... implementation
}
function toPrintableHTML(pattern) {
    // Generate printer-friendly HTML
    // ... implementation
    return '';
}
// Pattern complexity analyzer
function analyzeComplexity(pattern) {
    let score = 1; // Base difficulty
    const factors = [];
    // Check number of different fabrics
    if (pattern.materials.fabrics.length > 5) {
        score += 1;
        factors.push('Many fabrics');
    }
    // Check techniques used
    const advancedTechniques = ['paper-piecing', 'curved-piecing', 'y-seams'];
    const usedTechniques = pattern.construction.techniques.map(t => t.id);
    if (usedTechniques.some(t => advancedTechniques.includes(t))) {
        score += 2;
        factors.push('Advanced techniques');
    }
    // Check piece count
    const totalPieces = pattern.construction.cuttingInstructions
        .reduce((sum, cut) => sum + cut.pieces.reduce((s, p) => s + p.quantity, 0), 0);
    if (totalPieces > 100) {
        score += 1;
        factors.push('Many pieces');
    }
    return { score: Math.min(score, 5), factors };
}
// Migration utilities for future schema changes
function migratePattern(pattern, fromVersion) {
    // Handle migrations as schema evolves
    switch (fromVersion) {
        case '0.9.0':
            // Migrate from beta schema
            // ... implementation
            break;
    }
    return pattern;
}
