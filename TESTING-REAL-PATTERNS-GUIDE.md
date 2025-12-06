# Testing Pattern Reader with Real PDFs - Quick Guide

## 🎯 Where to Find Free Quilt Patterns (PDFs)

### Quick Links for Free Patterns:

1. **Robert Kaufman Fabrics**
   - https://www.robertkaufman.com/quilting/quilts_patterns/
   - Hundreds of free PDFs
   - Professional format

2. **Free Spirit Fabrics**
   - https://www.freespiritfabrics.com/free-patterns
   - Modern patterns
   - Clear PDFs

3. **Moda Fabrics**
   - https://modafabrics.com/free-patterns
   - Traditional & modern
   - Well-formatted

4. **All People Quilt**
   - https://www.allpeoplequilt.com/quilt-patterns/quilt-downloads
   - Variety of styles
   - Magazine quality

5. **Connecting Threads**
   - https://www.connectingthreads.com/free_patterns
   - Simple patterns
   - Good for testing

## 📥 Quick Download & Test

```bash
# 1. Create samples directory
cd /Users/david/Documents/Claude_Technical/quiltographer/packages/pdf-parser
mkdir -p samples

# 2. Download a pattern (example)
# Go to one of the sites above and download to samples/

# 3. Install dependencies (if not done)
npm install

# 4. Test the parser
npm run dev

# 5. Check output
# Look in output/parsed-pattern.json
```

## 🧪 Testing Checklist

### For Each Pattern, Check:

1. **Section Detection**
   - [ ] Materials found?
   - [ ] Cutting instructions found?
   - [ ] Assembly steps found?

2. **Measurement Parsing**
   - [ ] "2½ inches" parsed correctly?
   - [ ] "2 1/2 yards" parsed correctly?
   - [ ] Strip measurements work?

3. **Abbreviation Expansion**
   - [ ] RST → Right Sides Together?
   - [ ] WOF → Width of Fabric?
   - [ ] SA → Seam Allowance?

4. **Step Clarity**
   - [ ] Steps numbered correctly?
   - [ ] Warnings generated?
   - [ ] Techniques identified?

## 📊 Test Patterns Priority

### Start With These Types:

1. **Simple Nine Patch** - Basic parsing test
2. **Log Cabin** - Multiple fabric parsing
3. **Half Square Triangles** - Complex cutting
4. **Paper Pieced** - Different format
5. **Appliqué Pattern** - Mixed techniques

## 🐛 Common Issues to Watch

1. **Scanned PDFs** - No selectable text
2. **Image-heavy PDFs** - Parser can't read diagrams yet
3. **Non-standard headers** - "You'll Need" vs "Materials"
4. **Metric patterns** - Different measurement format
5. **Multi-page cutting** - Instructions split across pages

## 📝 Testing Log Template

```markdown
## Pattern: [Name]
**Source**: [URL]
**Date**: July 29, 2025

### Parse Results:
- Sections detected: ✅/❌
- Materials parsed: ✅/❌  
- Cutting parsed: ✅/❌
- Steps parsed: ✅/❌

### Issues Found:
- 

### Regex Fixes Needed:
- 

### Notes:
- 
```

## 🚀 Quick Wins

If parser fails on a pattern:

1. **Check the console output** - Shows what sections were found
2. **Look at raw text** - Parser might be getting bad input
3. **Adjust regex** - Add new pattern variations
4. **Add abbreviations** - New terms to expand

## Next Actions

1. Download 3-5 diverse patterns
2. Run parser on each
3. Document what works/fails
4. We'll refine regex based on results

Ready to test? Just grab a few PDFs and let's see how our parser performs in the real world!