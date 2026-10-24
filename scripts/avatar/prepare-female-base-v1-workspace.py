"""Prepare a reversible Blender workspace for the female_base_v1 artist pass.

Run with Blender in background mode. This script copies only the verified body
and eye objects from the immutable CC0 source, creates a hidden reference copy,
and sets up neutral materials, fixed review cameras, lighting, and checkpoint
notes. It intentionally performs no sculpting, remeshing, or rigging.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Vector


CANDIDATE_ID = "female_base_v1_candidate_01"
SOURCE_SHA256 = "811F43ACCBB31A88266D932F8F5563B2D13586FCA0BA2693AAD1F5FE582B3515"
BODY_SOURCE_NAME = "GEO-body_female_realistic"
EYE_SOURCE_PREFIX = f"{BODY_SOURCE_NAME}.eye."

CHECKPOINTS = {
    "A_SILHOUETTE": """CHECKPOINT A - SILHOUETTE
Judge adult proportion, 7.2-7.5 head relationship, shoulders, ribcage, waist,
pelvis, limbs, and hands/feet scale. Do not spend time on face micro-detail.
Exit only when front, 3/4, profile, and back read as one coherent adult body.
""",
    "B_FACE_PRIMARY": """CHECKPOINT B - FACE PRIMARY FORMS
Judge skull silhouette, orbits, eye scale/projection, cheek planes, jaw, chin,
nose bridge/projection, mouth placement, and profile depth. Eye size alone is
not the stylization strategy.
""",
    "C_FACE_SECONDARY": """CHECKPOINT C - FACE SECONDARY FORMS
Judge upper/lower lids, brow transition, nose tip and alar forms, nostrils,
philtrum, lips, mouth corners, chin/lower-lip transition, and cheek transitions.
""",
    "D_BODY_ANATOMY": """CHECKPOINT D - BODY ANATOMY POLISH
Judge clavicle, shoulder/deltoid, elbows, hands, pelvis, knees, ankles, and feet.
Reject obvious deformation or proportion defects before owner-review rendering.
""",
    "E_OWNER_REVIEW": """CHECKPOINT E - OWNER REVIEW CANDIDATE
Only enter after A-D pass internal quality. Set scene property review_state to
CANDIDATE_FOR_OWNER_REVIEW only after a qualified artist confirms the minimum
bar. This does not change production registry state, which remains MISSING.
""",
}

CAMERAS = {
    "full-front": ((0.0, -3.35, 0.86), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "full-three-quarter-left": ((2.45, -2.55, 0.90), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "full-profile": ((3.35, 0.0, 0.88), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "full-back": ((0.0, 3.35, 0.86), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "full-slight-high": ((0.0, -3.25, 1.18), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "full-slight-low": ((0.0, -3.25, 0.55), (0.0, 0.0, 0.82), 64, (900, 1200)),
    "face-front": ((0.0, -1.05, 1.52), (0.0, 0.0, 1.50), 82, (1000, 1000)),
    "face-three-quarter-left": ((0.72, -0.82, 1.52), (0.0, 0.0, 1.50), 82, (1000, 1000)),
    "face-profile": ((1.05, 0.0, 1.52), (0.0, 0.0, 1.50), 82, (1000, 1000)),
    "face-slight-high": ((0.0, -1.0, 1.68), (0.0, 0.0, 1.50), 82, (1000, 1000)),
    "face-slight-low": ((0.0, -1.0, 1.35), (0.0, 0.0, 1.50), 82, (1000, 1000)),
    "detail-hand-left": ((-0.39, -0.80, 0.77), (-0.39, 0.0, 0.77), 80, (1000, 1000)),
    "detail-hand-right": ((0.39, -0.80, 0.77), (0.39, 0.0, 0.77), 80, (1000, 1000)),
    "detail-feet": ((0.0, -1.10, 0.12), (0.0, 0.0, 0.12), 70, (1200, 700)),
    "detail-clavicle-neck": ((0.0, -1.10, 1.27), (0.0, 0.0, 1.27), 80, (1000, 800)),
    "detail-hip-thigh-knee": ((0.0, -1.60, 0.68), (0.0, 0.0, 0.68), 75, (1000, 1200)),
}


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--baseline-output", type=Path, required=True)
    return parser.parse_args(argv)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def load_source_objects(source: Path) -> list[bpy.types.Object]:
    with bpy.data.libraries.load(str(source), link=False) as (available, requested):
        selected = [
            name
            for name in available.objects
            if name == BODY_SOURCE_NAME or name.lower().startswith(EYE_SOURCE_PREFIX.lower())
        ]
        requested.objects = selected
    objects = [obj for obj in requested.objects if obj is not None and obj.type == "MESH"]
    if not any(obj.name == BODY_SOURCE_NAME for obj in objects):
        raise RuntimeError(f"Source body {BODY_SOURCE_NAME!r} was not found")
    if len(objects) < 2:
        raise RuntimeError("Expected the body and at least one eye mesh in the source")
    return objects


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_material(name: str, color: tuple[float, float, float, float], roughness: float) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Roughness"].default_value = roughness
    return material


def aim_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_camera(collection: bpy.types.Collection, slug: str, spec: tuple) -> None:
    location, target, lens, resolution = spec
    data = bpy.data.cameras.new(f"OM_REVIEW_{slug.upper().replace('-', '_')}")
    data.lens = lens
    camera = bpy.data.objects.new(data.name, data)
    camera.location = location
    aim_at(camera, target)
    camera["om_review_slug"] = slug
    camera["om_resolution_x"] = resolution[0]
    camera["om_resolution_y"] = resolution[1]
    camera.lock_location = (True, True, True)
    camera.lock_rotation = (True, True, True)
    camera.lock_scale = (True, True, True)
    collection.objects.link(camera)


def add_area_light(
    collection: bpy.types.Collection,
    name: str,
    location: tuple[float, float, float],
    target: tuple[float, float, float],
    energy: float,
    color: tuple[float, float, float],
    size: float,
) -> None:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = color
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    light.location = location
    aim_at(light, target)
    collection.objects.link(light)


def create_workspace(args: argparse.Namespace) -> dict:
    source = args.source.resolve()
    if not source.is_file():
        raise FileNotFoundError(source)

    clear_scene()
    source_objects = load_source_objects(source)
    scene = bpy.context.scene
    scene.name = "female_base_v1_candidate_01_artist_workspace"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new("OM_REVIEW_WORLD")
    scene.world.color = (0.012, 0.015, 0.020)

    scene["candidate_id"] = CANDIDATE_ID
    scene["source_name"] = "Blender Human Base Meshes v1.4.1 / Body Female - Realistic"
    scene["source_license"] = "CC0-1.0"
    scene["source_archive_sha256"] = SOURCE_SHA256
    scene["production_registry_state"] = "MISSING"
    scene["review_state"] = "ARTIST_WORKING_SOURCE"
    scene["skeleton_state"] = "NOT_STARTED"
    scene["morph_state"] = "REVIEW_ONLY_NOT_STARTED"
    scene["prepared_utc"] = datetime.now(timezone.utc).isoformat()

    raw_collection = bpy.data.collections.new("RAW_CC0_REFERENCE")
    artist_collection = bpy.data.collections.new("FEMALE_BASE_V1_CANDIDATE_01")
    review_collection = bpy.data.collections.new("OM_FIXED_REVIEW_STAGE")
    scene.collection.children.link(raw_collection)
    scene.collection.children.link(artist_collection)
    scene.collection.children.link(review_collection)

    skin_material = make_material("OM_REVIEW_SKIN_NEUTRAL", (0.55, 0.31, 0.24, 1.0), 0.62)
    source_body = next(obj for obj in source_objects if obj.name == BODY_SOURCE_NAME)
    source_body_location = source_body.location.copy()
    prepared_objects = []
    for source_obj in source_objects:
        raw = source_obj.copy()
        raw.data = source_obj.data.copy()
        raw.name = f"RAW_CC0.{source_obj.name}"
        raw.hide_viewport = True
        raw.hide_render = True
        raw.lock_location = (True, True, True)
        raw.lock_rotation = (True, True, True)
        raw.lock_scale = (True, True, True)
        raw_collection.objects.link(raw)

        # The bundle's separate eye specimens are retained in the immutable
        # source reference only. They are not a final eye system and their
        # catalog transforms are not production presentation authority.
        if source_obj.name != BODY_SOURCE_NAME:
            continue

        artist = source_obj.copy()
        artist.data = source_obj.data.copy()
        artist.name = f"{CANDIDATE_ID}.body"
        # The source bundle offsets each catalog family in the scene. Remove the
        # shared body offset while preserving the body's source rotation, scale,
        # mesh coordinates, topology, and modifiers.
        artist.location = source_obj.location - source_body_location
        artist.rotation_euler = source_obj.rotation_euler.copy()
        artist.scale = source_obj.scale.copy()
        artist.data.materials.clear()
        artist.data.materials.append(skin_material)
        artist["source_object"] = source_obj.name
        artist["artist_editable"] = True
        artist_collection.objects.link(artist)
        prepared_objects.append(artist)

    bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0.0, 0.0, 0.0))
    created_floor = bpy.context.object
    created_floor.name = "OM_REVIEW_FLOOR"
    # Move the operator-created plane into the fixed review collection.
    for collection in list(created_floor.users_collection):
        collection.objects.unlink(created_floor)
    review_collection.objects.link(created_floor)
    floor_material = make_material("OM_REVIEW_CHARCOAL", (0.018, 0.022, 0.030, 1.0), 0.82)
    created_floor.data.materials.append(floor_material)

    for slug, spec in CAMERAS.items():
        add_camera(review_collection, slug, spec)
    scene.camera = bpy.data.objects["OM_REVIEW_FULL_FRONT"]

    add_area_light(review_collection, "OM_REVIEW_KEY", (-2.6, -3.2, 3.4), (0.0, 0.0, 1.0), 850, (1.0, 0.86, 0.76), 3.1)
    add_area_light(review_collection, "OM_REVIEW_FILL", (2.5, -2.4, 2.1), (0.0, 0.0, 1.0), 360, (0.78, 0.84, 1.0), 3.8)
    add_area_light(review_collection, "OM_REVIEW_RIM", (0.7, 2.5, 2.7), (0.0, 0.0, 1.1), 520, (0.86, 0.76, 1.0), 2.2)

    for key, contents in CHECKPOINTS.items():
        text = bpy.data.texts.new(f"OM_CHECKPOINT_{key}")
        text.write(contents)
    readme = bpy.data.texts.new("OM_ARTIST_README")
    readme.write(
        "This is an artist working source, not a production candidate.\n"
        "Do not alter RAW_CC0_REFERENCE. Version each sculpt revision.\n"
        "Complete checkpoints A-D before changing review_state for checkpoint E.\n"
        "Production registry female_base_v1 remains MISSING.\n"
    )

    if hasattr(scene.tool_settings, "sculpt") and hasattr(scene.tool_settings.sculpt, "use_symmetry_x"):
        scene.tool_settings.sculpt.use_symmetry_x = True

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.baseline_output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(args.output.resolve()))
    shutil.copy2(args.output, args.baseline_output)

    manifest = {
        "candidateId": CANDIDATE_ID,
        "reviewState": "ARTIST_WORKING_SOURCE",
        "productionRegistryState": "MISSING",
        "source": str(source),
        "sourceArchiveSha256": SOURCE_SHA256,
        "workingSource": str(args.output.resolve()),
        "workingSourceSha256": sha256(args.output),
        "baselineVersion": str(args.baseline_output.resolve()),
        "baselineVersionSha256": sha256(args.baseline_output),
        "dccVersion": bpy.app.version_string,
        "preparedObjects": [obj.name for obj in prepared_objects],
        "reviewCameras": sorted(CAMERAS),
        "checkpoints": list(CHECKPOINTS),
        "anatomyModified": False,
        "topologyModified": False,
    }
    manifest_path = args.output.parent / "workspace-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    return manifest


if __name__ == "__main__":
    create_workspace(parse_args())
