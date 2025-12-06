// Simple Pattern Parser for MVP
const pdf = require('pdf-parse');

class SimplePatternParser {
  async parsePattern(pdfBuffer) {
    const data = await pdf(pdfBuffer);
    const text = data.text;
    
    return {
      metadata: this.extractMetadata(text),
      materials: this.extractMaterials(text),
      steps: this.extractSteps(text),
      source: {
        type: 'pdf',
        pages: data.numpages,
        textLength: text.length
      }
    };
  }
  
  extractMetadata(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const sizeMatch = text.match(/finished.*?(\d+)"?\s*x\s*(\d+)"?/i);
    const diffMatch = text.match(/difficulty.*?(beginner|easy|intermediate|advanced)/i);
    
    return {
      name: lines.find(l => l.length > 5 && l.length < 50 && !l.includes('www.')) || 'Pattern',
      difficulty: diffMatch ? diffMatch[1] : 'Unknown',
      finishedSize: sizeMatch ? `${sizeMatch[1]}" x ${sizeMatch[2]}"` : 'Not specified'
    };
  }
  
  extractMaterials(text) {
    const materials = [];
    const yardMatches = text.matchAll(/(\d+\/\d+|\d+)\s*yards?/gi);
    
    for (const match of yardMatches) {
      materials.push({
        name: `Fabric ${materials.length + 1}`,
        amount: match[0]
      });
    }
    
    return materials;
  }
  
  extractSteps(text) {
    const steps = [];
    const stepMatches = text.matchAll(/Step\s+(\d+)[:\s]([^]*?)(?=Step\s+\d+|$)/gi);
    
    for (const match of stepMatches) {
      steps.push({
        id: `step-${match[1]}`,
        number: parseInt(match[1]),
        title: `Step ${match[1]}`,
        instruction: match[2].trim().replace(/\n+/g, ' ').substring(0, 200)
      });
    }
    
    return steps;
  }
}

module.exports = { SimplePatternParser };
