#!/bin/bash
# Machine Sync Script - Coordinates work between Studio and MacBook

# Detect current machine
MEMORY=$(system_profiler SPHardwareDataType | grep Memory | awk '{print $2}')
if [ "$MEMORY" -eq "64" ]; then
    MACHINE="studio"
    echo "🖥️  Running on Mac Studio (64GB)"
else
    MACHINE="mobile"
    echo "💻 Running on MacBook Pro (24GB)"
fi

# Sync paths
VAULT_PATH="/Users/david/Documents/Claude_Vault"
ORCHESTRATION_PATH="$VAULT_PATH/05_Orchestration"
STUDIO_QUEUE="$ORCHESTRATION_PATH/Studio_Queue"
MOBILE_QUEUE="$ORCHESTRATION_PATH/Mobile_Queue"

# Create queue directories if needed
mkdir -p "$STUDIO_QUEUE"
mkdir -p "$MOBILE_QUEUE"

# Function to check queued tasks
check_queues() {
    echo ""
    echo "📋 Checking task queues..."
    
    if [ "$MACHINE" = "studio" ]; then
        # Studio checks its queue
        STUDIO_TASKS=$(ls -la "$STUDIO_QUEUE"/*.json 2>/dev/null | wc -l)
        if [ "$STUDIO_TASKS" -gt 0 ]; then
            echo "✅ Found $STUDIO_TASKS tasks in Studio queue"
            echo "Heavy compute tasks ready for processing:"
            ls "$STUDIO_QUEUE"/*.json 2>/dev/null | xargs -I {} basename {}
        else
            echo "📭 No tasks in Studio queue"
        fi
    else
        # Mobile checks its queue
        MOBILE_TASKS=$(ls -la "$MOBILE_QUEUE"/*.json 2>/dev/null | wc -l)
        if [ "$MOBILE_TASKS" -gt 0 ]; then
            echo "✅ Found $MOBILE_TASKS tasks in Mobile queue"
            echo "Lightweight tasks ready for processing:"
            ls "$MOBILE_QUEUE"/*.json 2>/dev/null | xargs -I {} basename {}
        else
            echo "📭 No tasks in Mobile queue"
        fi
    fi
}

# Function to start appropriate orchestra
start_orchestra() {
    echo ""
    echo "🎼 Starting orchestra for $MACHINE..."
    
    if [ "$MACHINE" = "studio" ]; then
        echo "Launching full AI Symphony..."
        cd /Users/david/Documents/Claude_Technical/quiltographer
        python3 ai_conductor.py
    else
        echo "Launching Mobile Ensemble..."
        cd /Users/david/Documents/Claude_Technical/quiltographer
        python3 mobile_orchestra.py
    fi
}

# Function to sync completed tasks
sync_completed() {
    echo ""
    echo "🔄 Syncing completed tasks..."
    
    COMPLETED_DIR="$ORCHESTRATION_PATH/Completed"
    mkdir -p "$COMPLETED_DIR"
    
    # Move completed tasks from both queues
    find "$STUDIO_QUEUE" -name "*_completed.json" -exec mv {} "$COMPLETED_DIR" \; 2>/dev/null
    find "$MOBILE_QUEUE" -name "*_completed.json" -exec mv {} "$COMPLETED_DIR" \; 2>/dev/null
    
    COMPLETED_COUNT=$(ls -la "$COMPLETED_DIR"/*.json 2>/dev/null | wc -l)
    echo "✅ Total completed tasks: $COMPLETED_COUNT"
}

# Main execution
echo "=================================="
echo "   Multi-Machine Orchestra Sync   "
echo "=================================="

check_queues
sync_completed

echo ""
echo "Options:"
echo "1) Start orchestra for this machine"
echo "2) Check queue status only"
echo "3) Sync and exit"
echo ""
read -p "Select option (1-3): " option

case $option in
    1)
        start_orchestra
        ;;
    2)
        check_queues
        ;;
    3)
        echo "✅ Sync complete"
        ;;
    *)
        echo "Invalid option"
        ;;
esac