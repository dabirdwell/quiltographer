// Test file for PDF parser
// Run with: npm run dev

import { parseQuiltPattern } from './parser';
import * as fs from 'fs';
import * as path from 'path';

async function testParser() {
  console.log('🧵 Quiltographer PDF Parser Test\n');
  
  // Test with a sample PDF
  const pdfPath = path.join(__dirname, '../samples/test-pattern.pdf');
  
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.log('⚠️  No test PDF found at:', pdfPath);
      console.log('📄 Please add a quilt pattern PDF to test with\n');
      
      // Test with mock data instead
      console.log('🧪 Testing with mock PDF data...\n');
      await testWithMockData();
      return;
    }
    
    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('📄 Parsing PDF:', pdfPath);
    console.log('📏 File size:', (pdfBuffer.length / 1024).toFixed(2), 'KB\n');
    
    // Parse the pattern
    const pattern = await parseQuiltPattern(pdfBuffer, {
      expandAbbreviations: true,
      addClarifications: true,
      generateDiagrams: false // Not implemented yet
    });
    
    // Display results
    console.log('✅ Pattern parsed successfully!\n');
    console.log('📋 Pattern Details:');
    console.log('   Name:', pattern.metadata.name);
    console.log('   Difficulty:', '⭐'.repeat(pattern.metadata.difficulty));
    console.log('   Category:', pattern.metadata.category);
    console.log('   Estimated Time:', pattern.metadata.estimatedTime, 'hours');
    
    if (pattern.metadata.size?.finished) {
      console.log('   Finished Size:', 
        `${pattern.metadata.size.finished.width}" x ${pattern.metadata.size.finished.height}"`
      );
    }
    
    console.log('\n🧵 Materials:');
    pattern.materials.fabrics.forEach(fabric => {
      console.log(`   - ${fabric.name}: ${fabric.amount} ${fabric.unit}`);
    });
    
    console.log('\n✂️  Cutting Instructions:');
    pattern.construction.cuttingInstructions.forEach((cut, i) => {
      console.log(`   ${i + 1}. From ${cut.fabric}:`);
      cut.pieces.forEach(piece => {
        if (typeof piece.dimensions === 'object') {
          console.log(`      - Cut ${piece.quantity} ${piece.shape}s ${piece.dimensions.width}" x ${piece.dimensions.height}"`);
        } else {
          console.log(`      - Cut ${piece.quantity} ${piece.shape}s ${piece.dimensions}`);
        }
      });
    });
    
    console.log('\n🪡 Construction Steps:');
    pattern.construction.steps.forEach(step => {
      console.log(`\n   Step ${step.number}: ${step.title || ''}`);
      console.log(`   Original: ${step.instruction.substring(0, 100)}...`);
      if (step.clarifiedInstruction) {
        console.log(`   Clarified: ${step.clarifiedInstruction.substring(0, 100)}...`);
      }
      if (step.techniques.length > 0) {
        console.log(`   Techniques: ${step.techniques.join(', ')}`);
      }
      if (step.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${step.warnings.map(w => w.message).join('; ')}`);
      }
    });
    
    // Save parsed pattern
    const outputPath = path.join(__dirname, '../output/parsed-pattern.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(pattern, null, 2));
    console.log('\n💾 Saved parsed pattern to:', outputPath);
    
  } catch (error) {
    console.error('❌ Error parsing PDF:', error);
  }
}

/**
 * Test with mock data when no PDF is available
 */
async function testWithMockData() {
  // Create mock PDF text that mimics a real pattern
  const mockPdfText = `
Simple Nine Patch Quilt Pattern

Finished Size: 36" x 48"

Materials:
Background fabric: 1 1/2 yards
Dark fabric: 1 yard  
Batting: 40" x 52"
Backing: 1 1/2 yards

Cutting Instructions:
From background fabric:
- Cut 20 squares 3 1/2" x 3 1/2"
- Cut 4 strips 2" x WOF

From dark fabric:
- Cut 16 squares 3 1/2" x 3 1/2"
- Cut 5 strips 2 1/2" x WOF for binding

Instructions:
Step 1. Arrange squares in a nine patch formation with dark squares in corners and center. Light squares go on the sides.

Step 2. Sew squares RST with 1/4" SA. Press to dark.

Step 3. Join rows, matching seams carefully. Press seams open.

Step 4. Square up blocks to 9 1/2".

Step 5. Arrange blocks in a 4 x 5 layout. Sew blocks together in rows, then join rows.

Tip: Chain piecing will speed up the process!
`;

  // Create a mock PDF buffer
  const mockBuffer = Buffer.from(JSON.stringify({
    text: mockPdfText,
    info: {
      Title: 'Simple Nine Patch Pattern',
      Author: 'Mock Pattern Designer'
    }
  }));
  
  // Mock the pdf-parse behavior
  const pdfParse = require('pdf-parse');
  pdfParse.mockImplementation = async (buffer: Buffer) => {
    const data = JSON.parse(buffer.toString());
    return data;
  };
  
  console.log('📋 Mock Pattern Text:');
  console.log('---');
  console.log(mockPdfText);
  console.log('---\n');
  
  try {
    const { QuiltPatternParser } = require('./parser');
    const parser = new QuiltPatternParser({
      expandAbbreviations: true,
      addClarifications: true
    });
    
    // Parse mock data
    const pattern = await parser.parsePattern(mockBuffer);
    
    console.log('✅ Mock pattern parsed!\n');
    console.log('📊 Parse Results:');
    console.log(JSON.stringify(pattern.metadata, null, 2));
    
  } catch (error) {
    console.log('⚠️  Mock parsing not fully implemented yet');
    console.log('   This would parse the pattern text into our schema');
  }
}

// Run the test
testParser().catch(console.error);