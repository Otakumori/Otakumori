"""Render a fixed-angle, versioned female_base_v1 artist review packet.

The open .blend remains authoritative. This script never changes registry or
review state and never substitutes missing range shapes. Missing review-only
shape keys are recorded honestly in metadata.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy


EXPECTED_CAMERA_PREFIX = "OM_REVIEW_"
RANGE_STATES = {
    "default": "OM_REVIEW_Default",
    "petite": "OM_REVIEW_Petite",
    "soft-curvy": "OM_REVIEW_Soft_Curvy",
    "athletic-strong": "OM_REVIEW_Athletic_Strong",
}


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--notes", default="")
    return parser.parse_args(argv)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def mesh_counts(objects: list[bpy.types.Object]) -> tuple[int, int]:
    vertices = 0
    triangles = 0
    for obj in objects:
        vertices += len(obj.data.vertices)
        triangles += sum(max(0, len(poly.vertices) - 2) for poly in obj.data.polygons)
    return vertices, triangles


def artist_meshes() -> list[bpy.types.Object]:
    collection = bpy.data.collections.get("FEMALE_BASE_V1_CANDIDATE_01")
    if collection is None:
        raise RuntimeError("Artist collection FEMALE_BASE_V1_CANDIDATE_01 is missing")
    meshes = [obj for obj in collection.all_objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("Artist collection contains no mesh objects")
    return meshes


def render_camera(camera: bpy.types.Object, output: Path) -> None:
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.resolution_x = int(camera["om_resolution_x"])
    scene.render.resolution_y = int(camera["om_resolution_y"])
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def shape_key_on_body(meshes: list[bpy.types.Object], name: str):
    for obj in meshes:
        if not obj.name.endswith(".body") or obj.data.shape_keys is None:
            continue
        return obj.data.shape_keys.key_blocks.get(name)
    return None


def main() -> None:
    args = parse_args()
    if not re.fullmatch(r"v\d{3}(?:-[a-z0-9-]+)?", args.revision):
        raise ValueError("Revision must use vNNN or vNNN-lowercase-label")
    scene = bpy.context.scene
    required_properties = ("candidate_id", "source_archive_sha256", "production_registry_state", "review_state")
    missing_properties = [key for key in required_properties if key not in scene]
    if missing_properties:
        raise RuntimeError(f"Workspace metadata missing: {', '.join(missing_properties)}")

    blend_path = Path(bpy.data.filepath)
    if not blend_path.is_file():
        raise RuntimeError("Save the working .blend before rendering")
    output_dir = (args.output_root / args.revision).resolve()
    output_dir.mkdir(parents=True, exist_ok=False)

    meshes = artist_meshes()
    vertices, triangles = mesh_counts(meshes)
    run_timestamp = datetime.now(timezone.utc).isoformat()
    cameras = sorted(
        (
            obj
            for obj in bpy.data.objects
            if obj.type == "CAMERA" and obj.name.startswith(EXPECTED_CAMERA_PREFIX) and "om_review_slug" in obj
        ),
        key=lambda obj: obj["om_review_slug"],
    )
    if len(cameras) != 16:
        raise RuntimeError(f"Expected 16 locked review cameras, found {len(cameras)}")

    rendered = []
    for camera in cameras:
        slug = str(camera["om_review_slug"])
        filename = f"{slug}.png"
        render_camera(camera, output_dir / filename)
        rendered.append(
            {
                "camera": camera.name,
                "slug": slug,
                "file": filename,
                "resolution": [int(camera["om_resolution_x"]), int(camera["om_resolution_y"])],
            }
        )

    range_results = []
    front_camera = bpy.data.objects.get("OM_REVIEW_FULL_FRONT")
    range_keys = {name: shape_key_on_body(meshes, name) for name in RANGE_STATES.values()}
    original_range_values = {name: key.value for name, key in range_keys.items() if key is not None}
    for slug, key_name in RANGE_STATES.items():
        key = range_keys[key_name]
        if key is None:
            range_results.append({"state": slug, "shapeKey": key_name, "status": "MISSING"})
            continue
        for available_key in range_keys.values():
            if available_key is not None:
                available_key.value = 0.0
        key.value = 1.0
        filename = f"range-{slug}.png"
        render_camera(front_camera, output_dir / filename)
        range_results.append({"state": slug, "shapeKey": key_name, "status": "RENDERED", "file": filename})
    for name, value in original_range_values.items():
        range_keys[name].value = value

    complete_range = all(result["status"] == "RENDERED" for result in range_results)
    metadata = {
        "candidateId": scene["candidate_id"],
        "source": scene.get("source_name", "unknown"),
        "sourceArchiveSha256": scene["source_archive_sha256"],
        "workingSource": str(blend_path.resolve()),
        "workingSourceSha256": sha256(blend_path),
        "dccVersion": bpy.app.version_string,
        "revision": args.revision,
        "timestampUtc": run_timestamp,
        "productionRegistryState": scene["production_registry_state"],
        "reviewState": scene["review_state"],
        "vertexCount": vertices,
        "triangleCount": triangles,
        "qualityTier": "ARTIST_REVIEW",
        "notes": args.notes,
        "views": rendered,
        "rangeStates": range_results,
        "ownerPacketComplete": scene["review_state"] == "CANDIDATE_FOR_OWNER_REVIEW" and complete_range,
    }
    (output_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
