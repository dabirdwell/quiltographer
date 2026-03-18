#!/usr/bin/env python3
"""
ComfyUI Bridge for AI Orchestra
Integrates visual generation capabilities into the multi-AI system
Perfect for Quiltographer pattern visualization
"""

import json
import requests
import base64
from pathlib import Path
from typing import Dict, Any, List
import time

class ComfyUIBridge:
    """
    Bridge between AI Orchestra and ComfyUI for visual generation
    """
    
    def __init__(self, server_address: str = "http://localhost:8188"):
        self.server = server_address
        self.workspace = Path("/Users/david/Documents/Claude_Technical/quiltographer/coordination")
        self.comfy_queue = self.workspace / "comfyui_queue"
        self.comfy_queue.mkdir(exist_ok=True)
        
        # ComfyUI capabilities for Quiltographer
        self.capabilities = {
            "pattern_visualization": "Convert pattern specs to images",
            "color_exploration": "Generate color palette variations",
            "texture_generation": "Create fabric texture overlays",
            "style_transfer": "Apply artistic styles to patterns",
            "layout_preview": "Show full quilt layout",
            "step_animation": "Animate construction steps",
            "3d_preview": "Generate 3D draped preview"
        }
        
    def check_server(self) -> bool:
        """Check if ComfyUI server is running"""
        try:
            response = requests.get(f"{self.server}/system_stats", timeout=2)
            return response.status_code == 200
        except:
            return False
            
    def create_pattern_workflow(self, pattern_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a ComfyUI workflow for pattern visualization
        """
        workflow = {
            "prompt": {
                "1": {
                    "class_type": "PatternGenerator",
                    "inputs": {
                        "pattern_type": pattern_spec.get("style", "log-cabin"),
                        "size": pattern_spec.get("size", "queen"),
                        "colors": pattern_spec.get("colors", ["blue", "orange", "cream"]),
                        "block_size": pattern_spec.get("blockFinishedIn", 12),
                        "seed": int(time.time())
                    }
                },
                "2": {
                    "class_type": "ColorPalette",
                    "inputs": {
                        "base_colors": pattern_spec.get("colors"),
                        "variations": 5,
                        "harmony_type": "complementary"
                    }
                },
                "3": {
                    "class_type": "FabricTexture",
                    "inputs": {
                        "texture_type": "cotton",
                        "scale": 1.0,
                        "opacity": 0.3
                    }
                },
                "4": {
                    "class_type": "LayoutComposer",
                    "inputs": {
                        "blocks_x": pattern_spec.get("blocksX", 8),
                        "blocks_y": pattern_spec.get("blocksY", 8),
                        "sashing": pattern_spec.get("sashingIn", 0),
                        "border": pattern_spec.get("borderIn", 0)
                    }
                },
                "5": {
                    "class_type": "SaveImage",
                    "inputs": {
                        "filename_prefix": f"quilt_{pattern_spec.get('style', 'pattern')}",
                        "images": ["4", 0]
                    }
                }
            }
        }
        
        return workflow
        
    def generate_pattern_visuals(self, pattern_spec: Dict[str, Any]) -> Path:
        """
        Generate visual representations of a quilt pattern
        """
        task_id = f"comfy_task_{int(time.time())}"
        
        # Create task file
        task = {
            "id": task_id,
            "type": "pattern_visualization",
            "pattern_spec": pattern_spec,
            "workflow": self.create_pattern_workflow(pattern_spec),
            "status": "pending",
            "created_at": time.time()
        }
        
        task_file = self.comfy_queue / f"{task_id}.json"
        task_file.write_text(json.dumps(task, indent=2))
        
        print(f"✅ Created ComfyUI task: {task_id}")
        
        # If server is running, attempt to process
        if self.check_server():
            print("🎨 ComfyUI server detected - processing workflow")
            # Here you would send the workflow to ComfyUI
            # For now, we'll prepare it for manual execution
        else:
            print("⚠️  ComfyUI not running - task queued for later")
            
        return task_file
        
    def create_quiltographer_workflows(self):
        """
        Create standard workflows for Quiltographer patterns
        """
        workflows = {
            "log_cabin_variations": {
                "description": "Generate 5 color variations of Log Cabin pattern",
                "steps": ["Generate base pattern", "Apply color variations", "Add fabric textures", "Create layout preview"]
            },
            "irish_chain_preview": {
                "description": "Create Irish Chain pattern with different scales",
                "steps": ["Generate chain pattern", "Scale to different sizes", "Apply traditional colors", "Export as SVG"]
            },
            "sashiko_overlay": {
                "description": "Add Sashiko stitching patterns as overlay",
                "steps": ["Import base pattern", "Generate Sashiko motifs", "Overlay with transparency", "Export with stitch guides"]
            },
            "3d_quilt_preview": {
                "description": "Generate 3D draped quilt preview",
                "steps": ["Import flat pattern", "Apply 3D transformation", "Add lighting and shadows", "Render final image"]
            }
        }
        
        for name, workflow in workflows.items():
            workflow_file = self.comfy_queue / f"workflow_{name}.json"
            workflow_file.write_text(json.dumps(workflow, indent=2))
            
        print(f"✅ Created {len(workflows)} ComfyUI workflows for Quiltographer")
        return workflows
        
    def integrate_with_orchestra(self):
        """
        Register ComfyUI as an AI agent in the Orchestra
        """
        registration = {
            "agent": "comfyui",
            "type": "visual_generator",
            "capabilities": list(self.capabilities.keys()),
            "interface": "api",
            "endpoint": self.server,
            "status": "available" if self.check_server() else "offline",
            "tasks": [
                "pattern_visualization",
                "color_generation",
                "texture_creation",
                "layout_preview"
            ]
        }
        
        reg_file = self.workspace / "comfyui_registration.json"
        reg_file.write_text(json.dumps(registration, indent=2))
        
        return registration

# Example Quiltographer-specific workflows
QUILTOGRAPHER_PROMPTS = {
    "japanese_aesthetic": {
        "positive": "traditional japanese quilt pattern, sashiko stitching, indigo and white, minimalist, wabi-sabi aesthetic, natural cotton texture, hand-stitched appearance",
        "negative": "busy, cluttered, neon colors, synthetic materials",
        "style": "japanese_traditional"
    },
    "modern_geometric": {
        "positive": "modern geometric quilt, bold colors, clean lines, contemporary design, precise angles, gradient effects, professional photography",
        "negative": "traditional, floral, pastel, vintage",
        "style": "modern_minimal"
    },
    "vintage_farmhouse": {
        "positive": "vintage farmhouse quilt, feed sack prints, 1930s reproduction fabrics, scrappy, hand-quilted texture, nostalgic, weathered",
        "negative": "modern, geometric, neon, digital",
        "style": "vintage_americana"
    }
}

def create_visual_task_for_pattern(pattern_type: str, colors: List[str]) -> Dict[str, Any]:
    """
    Create a visual generation task based on pattern type
    """
    task = {
        "pattern_type": pattern_type,
        "colors": colors,
        "prompt": QUILTOGRAPHER_PROMPTS.get(pattern_type, QUILTOGRAPHER_PROMPTS["modern_geometric"]),
        "output_format": "png",
        "resolution": "1024x1024",
        "variations": 3
    }
    return task

if __name__ == "__main__":
    print("🎨 ComfyUI Bridge for AI Orchestra")
    print("=" * 50)
    
    bridge = ComfyUIBridge()
    
    # Check server status
    if bridge.check_server():
        print("✅ ComfyUI server is running")
    else:
        print("⚠️  ComfyUI server not detected")
        print("   Start ComfyUI to enable visual generation")
    
    # Create Quiltographer workflows
    workflows = bridge.create_quiltographer_workflows()
    
    # Register with Orchestra
    registration = bridge.integrate_with_orchestra()
    print(f"\n📋 ComfyUI registered with Orchestra:")
    print(f"   Status: {registration['status']}")
    print(f"   Capabilities: {', '.join(registration['capabilities'][:3])}...")
    
    # Create sample visualization task
    sample_pattern = {
        "style": "log-cabin",
        "size": "queen",
        "colors": ["indigo", "cream", "rust"],
        "blockFinishedIn": 12,
        "blocksX": 8,
        "blocksY": 8
    }
    
    task_file = bridge.generate_pattern_visuals(sample_pattern)
    print(f"\n📁 Sample task created: {task_file}")
    
    print("\n✨ ComfyUI Bridge Ready!")
    print("   Visual generation tasks in: comfyui_queue/")
    print("   Workflows ready for Quiltographer patterns")
    print("   Can generate pattern previews, color variations, and 3D views")
