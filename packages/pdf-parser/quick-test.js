const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function testPDF() {
  console.log('🧵 Testing PDF Parser\n');
  
  try {
    // Read the test PDF
    const pdfPath = path.join(__dirname, 'test-pattern.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ test-pattern.pdf not found at:', pdfPath);
      return;
    }
    
    console.log('✅ Found PDF at:', pdfPath);
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Parse PDF
    console.log('📖 Parsing PDF...');
    const data = await pdf(dataBuffer);
    
    console.log('\n📄 PDF Info:');
    console.log('   Pages:', data.numpages);
    console.log('   Text length:', data.text.length, 'characters');
    
    // Show first part of text
    console.log('\n📝 First 500 characters:');
    console.log('─'.repeat(50));
    console.log(data.text.substring(0, 500));
    console.log('─'.repeat(50));
    
    // Look for pattern sections
    const text = data.text.toLowerCase();
    console.log('\n🔍 Sections found:');
    
    if (text.includes('material') || text.includes('fabric')) {
      console.log('   ✅ Materials section');
    }
    if (text.includes('cutting')) {
      console.log('   ✅ Cutting instructions');
    }
    if (text.includes('step')) {
      console.log('   ✅ Step-by-step instructions');
    }
    
    // Save for inspection
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'raw-text.txt');
    fs.writeFileSync(outputPath, data.text);
    console.log('\n💾 Full text saved to:', outputPath);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testPDF();
