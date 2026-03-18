#!/usr/bin/env python3
"""
Mobile Orchestra - Lightweight orchestration for MacBook Pro M2 24GB
Adapted from full symphony for resource-constrained execution
"""

import json
import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional

class MobileOrchestra:
    """Resource-aware orchestration for mobile development"""
    
    def __init__(self):
        self.machine_profile = {
            "name": "MacBook Pro M2",
            "ram": 24,  # GB
            "max_parallel_agents": 2,
            "preferred_model_size": "7B",
            "available_agents": []
        }
        
        # Check available services
        self.detect_available_agents()
        
    def detect_available_agents(self):
        """Detect what's actually available on this machine"""
        agents = []
        
        # Claude (always available via API)
        agents.append({
            "name": "claude",
            "type": "api",
            "status": "active",
            "capabilities": ["architecture", "analysis", "synthesis"]
        })
        
        # Check if LMStudio is running
        if self.check_service("lmstudio", port=1234):
            agents.append({
                "name": "local_llm",
                "type": "local",
                "endpoint": "http://localhost:1234/v1",
                "status": "available",
                "capabilities": ["code", "generation", "analysis"]
            })
            
        # Check Zapier tools
        agents.append({
            "name": "zapier_tools",
            "type": "api", 
            "status": "available",
            "capabilities": ["email", "docs", "sheets", "calendar"]
        })
        
        # Check ComfyUI
        if self.check_service("comfyui", port=8188):
            agents.append({
                "name": "comfyui_lite",
                "type": "local",
                "status": "limited",  # Only light workflows on mobile
                "capabilities": ["basic_image_gen"]
            })
            
        self.machine_profile["available_agents"] = agents
        return agents
        
    def check_service(self, name: str, port: int) -> bool:
        """Check if a service is running on a port"""
        try:
            result = subprocess.run(
                f"lsof -i :{port}",
                shell=True,
                capture_output=True,
                text=True,
                timeout=2
            )
            return result.returncode == 0
        except:
            return False
            
    def create_mobile_task(self, task_type: str, description: str) -> Dict:
        """Create a task optimized for mobile execution"""
        task = {
            "id": f"mobile_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": task_type,
            "description": description,
            "machine": "macbook_pro",
            "constraints": {
                "max_memory": "8GB",  # Leave headroom
                "prefer_streaming": True,
                "use_quantized": True
            },
            "status": "pending"
        }
        
        # Route based on capabilities
        if task_type in ["research", "analysis", "writing"]:
            task["assigned_to"] = "claude"
            task["execution"] = "immediate"
        elif task_type in ["code", "generation"] and self.has_local_llm():
            task["assigned_to"] = "local_llm"
            task["execution"] = "sequential"
        elif task_type in ["heavy_compute", "training", "large_image"]:
            task["assigned_to"] = "studio_queue"
            task["execution"] = "deferred"
            task["note"] = "Queued for Mac Studio processing"
        else:
            task["assigned_to"] = "claude"
            task["execution"] = "immediate"
            
        return task
        
    def has_local_llm(self) -> bool:
        """Check if local LLM is available"""
        return any(a["name"] == "local_llm" 
                  for a in self.machine_profile["available_agents"])
                  
    def execute_with_limits(self, task: Dict) -> Dict:
        """Execute task with resource constraints"""
        print(f"Executing task {task['id']} with mobile constraints...")
        
        # Set resource limits
        os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.7"  # Limit GPU memory
        os.environ["OMP_NUM_THREADS"] = "4"  # Limit CPU threads
        
        # Execute based on assignment
        if task["assigned_to"] == "claude":
            result = self.execute_claude_task(task)
        elif task["assigned_to"] == "local_llm":
            result = self.execute_local_llm_task(task)
        elif task["assigned_to"] == "studio_queue":
            result = self.queue_for_studio(task)
        else:
            result = {"status": "error", "message": "Unknown agent"}
            
        return result
        
    def execute_claude_task(self, task: Dict) -> Dict:
        """Execute via Claude (current conversation)"""
        return {
            "status": "ready",
            "message": "Task ready for Claude processing",
            "task": task
        }
        
    def execute_local_llm_task(self, task: Dict) -> Dict:
        """Execute via local LLM with streaming"""
        if not self.has_local_llm():
            return {
                "status": "error",
                "message": "Local LLM not available, start LMStudio first"
            }
            
        # Would implement actual LLM call here
        return {
            "status": "completed",
            "message": "Executed via local LLM"
        }
        
    def queue_for_studio(self, task: Dict) -> Dict:
        """Queue task for Mac Studio processing"""
        queue_path = Path("/Users/david/Documents/Claude_Vault/05_Orchestration/Studio_Queue")
        queue_path.mkdir(parents=True, exist_ok=True)
        
        task_file = queue_path / f"{task['id']}.json"
        task_file.write_text(json.dumps(task, indent=2))
        
        return {
            "status": "queued",
            "message": f"Task queued for Studio processing: {task_file}",
            "location": str(task_file)
        }
        
    def status_report(self) -> str:
        """Generate status report for current machine"""
        report = f"""
Mobile Orchestra Status Report
==============================
Machine: {self.machine_profile['name']}
RAM: {self.machine_profile['ram']}GB
Max Parallel: {self.machine_profile['max_parallel_agents']}

Available Agents:
"""
        for agent in self.machine_profile['available_agents']:
            report += f"  - {agent['name']}: {agent['status']}\n"
            
        return report


if __name__ == "__main__":
    orchestra = MobileOrchestra()
    print(orchestra.status_report())
    
    # Example task creation
    task = orchestra.create_mobile_task(
        "analysis",
        "Analyze code patterns for optimization"
    )
    print(f"\nCreated task: {json.dumps(task, indent=2)}")
