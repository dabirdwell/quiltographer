#!/usr/bin/env python3
"""
Test LM Studio connection with OpenAI OSS 20B model
"""

import requests
import json
import time

def test_lm_studio():
    """Test connection to LM Studio"""
    
    print("🤖 Testing LM Studio with OpenAI OSS 20B...")
    print("-" * 50)
    
    # Common LM Studio endpoints
    endpoints = [
        "http://localhost:1234",
        "http://127.0.0.1:1234",
        "http://localhost:8080",
        "http://localhost:5000"
    ]
    
    for endpoint in endpoints:
        print(f"\nTrying {endpoint}...")
        
        try:
            # Test models endpoint
            response = requests.get(f"{endpoint}/v1/models", timeout=2)
            if response.status_code == 200:
                print(f"✅ Connected to LM Studio at {endpoint}")
                models = response.json()
                print(f"Available models: {json.dumps(models, indent=2)}")
                
                # Test chat completion
                test_prompt = """You are part of an AI Orchestra system. 
                Generate a test case for a quilt pattern parser that handles mixed units."""
                
                chat_response = requests.post(
                    f"{endpoint}/v1/chat/completions",
                    json={
                        "messages": [
                            {"role": "system", "content": "You are a helpful test case generator."},
                            {"role": "user", "content": test_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 200
                    },
                    timeout=10
                )
                
                if chat_response.status_code == 200:
                    result = chat_response.json()
                    print("\n✅ Successfully generated response:")
                    print("-" * 40)
                    print(result['choices'][0]['message']['content'])
                    
                    # Save configuration
                    config = {
                        "endpoint": endpoint,
                        "model": models.get('data', [{}])[0].get('id', 'unknown'),
                        "status": "active",
                        "tested_at": time.time()
                    }
                    
                    with open("lm_studio_config.json", "w") as f:
                        json.dump(config, f, indent=2)
                    
                    print("\n✅ Configuration saved to lm_studio_config.json")
                    return True
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed: {str(e)[:50]}")
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}")
    
    print("\n❌ Could not connect to LM Studio")
    print("Please ensure:")
    print("1. LM Studio is running")
    print("2. A model is loaded")
    print("3. The server is started (look for 'Server' tab in LM Studio)")
    return False

if __name__ == "__main__":
    test_lm_studio()
