#!/bin/bash
# Bridge to local AI models via LM Studio

# Check if LM Studio is running
check_lm_studio() {
    curl -s http://localhost:1234/v1/models > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ LM Studio is running"
        curl -s http://localhost:1234/v1/models | jq -r '.data[].id'
    else
        echo "❌ LM Studio not detected on port 1234"
        echo "Start LM Studio and load a model first"
    fi
}

# Send prompt to local model
query_local_model() {
    local prompt="$1"
    local response=$(curl -s http://localhost:1234/v1/chat/completions \
        -H "Content-Type: application/json" \
        -d "{
            \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}],
            \"temperature\": 0.7,
            \"max_tokens\": 1000
        }")
    
    echo "$response" | jq -r '.choices[0].message.content'
}

# Test pattern generation
generate_pattern_variation() {
    local pattern_type="$1"
    query_local_model "Generate a variation of a $pattern_type quilt pattern. Include block dimensions and color suggestions. Format as JSON."
}

# Main
case "$1" in
    check) check_lm_studio ;;
    query) query_local_model "$2" ;;
    pattern) generate_pattern_variation "$2" ;;
    *) echo "Usage: $0 {check|query|pattern} [args]" ;;
esac
