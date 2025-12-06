const fs = require('fs');
const path = require('path');
const { SimplePatternParser } = require('./simple-parser');

async function test() {
  console.log('🧵 Testing Simple Pattern Parser\n');
  
  try {
    const parser = new SimplePatternParser();
    const pdfPath = path.join(__dirname, 'test-pattern.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('📖 Parsing PDF...');
    const pattern = await parser.parsePattern(pdfBuffer);
    
    console.log('\n✅ Pattern Parsed Successfully!\n');
    console.log('📋 Metadata:');
    console.log('   Name:', pattern.metadata.name);
    console.log('   Difficulty:', pattern.metadata.difficulty);
    console.log('   Size:', pattern.metadata.finishedSize);
    console.log('   Designer:', pattern.metadata.designer);
    
    console.log('\n🧵 Materials:', pattern.materials.length, 'fabrics');
    pattern.materials.forEach(m => {
      console.log(`   - ${m.name}: ${m.amount}`);
    });
    
    console.log('\n📝 Construction Steps:', pattern.steps.length);
    pattern.steps.forEach(step => {
      console.log(`   Step ${step.number}: ${step.instruction.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
