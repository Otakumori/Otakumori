#!/usr/bin/env python
"""
Blender Python Script - GLB Export
Run this from Blender command line to export .blend to .glb
"""

import bpy
import sys
import os

def main():
    """Export current blend file to GLB format"""
    
    # Get output path from command line args
    argv = sys.argv
    argv = argv[argv.index("--") + 1:]  # Get args after --
    
    if not argv:
        print("❌ Error: No output path specified")
        sys.exit(1)
    
    output_path = argv[0]
    
    print(f"📦 Exporting to: {output_path}")
    
    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)
    
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    
    # Export settings optimized for character models
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        
        # Mesh settings
        export_textures=True,
        export_materials='EXPORT',
        export_colors=True,
        export_attributes=True,
        
        # No cameras/lights (we'll add in Three.js)
        export_cameras=False,
        export_lights=False,
        
        # Important for character models
        export_apply=True,  # Apply modifiers
        export_yup=True,    # Y-up for Three.js
        
        # Animation & Deformation
        export_morph=True,          # ✅ SHAPE KEYS for sliders!
        export_morph_normal=True,
        export_morph_tangent=True,
        export_skins=True,          # ✅ BONES for physics!
        export_def_bones=True,
        export_animations=False,     # Static pose for now
        
        # Optimization
        export_draco_mesh_compression_enable=False,  # Better compatibility
        export_unused_images=False,
        export_unused_textures=False,
    )
    
    # Verify export
    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"✅ Export successful!")
        print(f"   Size: {size_mb:.2f} MB")
    else:
        print(f"❌ Export failed - file not created")
        sys.exit(1)

if __name__ == "__main__":
    main()

