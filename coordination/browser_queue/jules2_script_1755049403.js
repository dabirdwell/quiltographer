
// Jules 2 Automation Script
// Task: Generate test cases for Pattern Reader

(function() {
    // Configuration
    const TASK_ID = 'task_demo_001';
    const PROMPT = `Create 5 edge case test scenarios for a PDF quilt pattern parser. Include unusual abbreviations and mixed units.`;
    const OUTPUT_FILE = 'jules2_test_cases.json';
    
    // Helper functions
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(checkInterval);
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Element ${selector} not found`));
                }
            }, 100);
        });
    }
    
    function simulateTyping(element, text) {
        return new Promise((resolve) => {
            element.focus();
            element.value = '';
            let index = 0;
            
            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    element.value += text[index];
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, 10); // Fast typing
        });
    }
    
    async function automateJules2() {
        try {
            console.log('🤖 Jules 2 Automation Starting...');
            
            // Wait for input field
            const inputField = await waitForElement('textarea, input[type="text"]');
            console.log('✅ Found input field');
            
            // Type the prompt
            await simulateTyping(inputField, PROMPT);
            console.log('✅ Typed prompt');
            
            // Find and click submit button
            const submitButton = await waitForElement('button[type="submit"], button:contains("Send"), button:contains("Generate")');
            submitButton.click();
            console.log('✅ Clicked submit');
            
            // Wait for response
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Extract response
            const responseElement = await waitForElement('.response, .output, [role="log"], .message-content');
            const response = responseElement.textContent;
            
            // Create result object
            const result = {
                task_id: TASK_ID,
                prompt: PROMPT,
                response: response,
                timestamp: new Date().toISOString(),
                success: true
            };
            
            // Copy to clipboard for manual save
            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
            console.log('✅ Response copied to clipboard');
            
            // Log for console extraction
            console.log('JULES2_RESULT:', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ Automation failed:', error);
            return {
                task_id: TASK_ID,
                error: error.message,
                success: false
            };
        }
    }
    
    // Run automation
    automateJules2();
})();
