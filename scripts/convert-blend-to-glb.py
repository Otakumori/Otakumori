#!/usr/bin/env python3
"""
Blender to GLB Converter
Converts .blend files to GLB format for use in Three.js
"""

import bpy
import sys
import os

def convert_blend_to_glb(blend_path, output_path):
    """Convert a .blend file to GLB format"""
    
    # Clear existing scene
    bpy.ops.wm.read_homefile(use_empty=True)
    
    # Import the blend file
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    
    # Export to GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_textures=True,
        export_materials='EXPORT',
        export_colors=True,
        export_cameras=False,
        export_lights=False,
        export_apply=True,
        export_yup=True,
        export_morph=True,  # Include morph targets/shape keys
        export_skins=True,  # Include armatures/bones
        export_animations=True,
        export_frame_range=False,
    )
    
    print(f"✅ Converted: {blend_path} → {output_path}")

if __name__ == "__main__":
    blend_file = "Goth Girl Sara Release Model v1.2.blend"
    output_file = "public/models/goth-girl-sara.glb"
    
    # Create output directory
    os.makedirs("public/models", exist_ok=True)
    
    convert_blend_to_glb(blend_file, output_file)
    print("🎉 Conversion complete!")

