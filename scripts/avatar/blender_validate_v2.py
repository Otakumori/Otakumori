#!/usr/bin/env python3
"""Validate an Otaku-mori Avatar V2 .blend file in Blender background mode.

Example:
  blender character.blend --background --python scripts/avatar/blender_validate_v2.py -- \
    --contract docs/avatar/contracts/om-humanoid-v1.json \
    --report .cache/avatar-validation/character.json

This script validates source-authoring invariants only. glTF/KTX2/Meshopt
validation remains a separate build stage.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from pathlib import Path

import bpy


EPSILON = 1e-5


def parse_args() -> argparse.Namespace:
    argv = sys.argv
    args = argv[argv.index("--") + 1 :] if "--" in argv else []

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--contract",
        default="docs/avatar/contracts/om-humanoid-v1.json",
    )
    parser.add_argument("--report")
    parser.add_argument(
        "--allow-blender-version-drift",
        action="store_true",
        help="Development escape hatch only. Production validation must remain pinned.",
    )
    return parser.parse_args(args)


def nearly(value: float, target: float) -> bool:
    return math.isclose(value, target, abs_tol=EPSILON)


def object_transform_errors(obj: bpy.types.Object) -> list[str]:
    errors: list[str] = []

    scale = obj.scale
    if not all(nearly(component, 1.0) for component in scale):
        errors.append(f"{obj.name}: object scale must be 1,1,1; got {tuple(scale)}")

    if any(component < 0 for component in scale):
        errors.append(f"{obj.name}: negative scale is prohibited")

    rotation = obj.rotation_euler
    if not all(nearly(component, 0.0) for component in rotation):
        errors.append(
            f"{obj.name}: object Euler rotation must be applied; got "
            f"{tuple(round(component, 6) for component in rotation)}"
        )

    return errors


def validate_armature(
    armature_obj: bpy.types.Object,
    contract: dict,
) -> list[str]:
    errors: list[str] = []
    errors.extend(object_transform_errors(armature_obj))

    bones = armature_obj.data.bones

    for required in contract["requiredBones"]:
        bone = bones.get(required["name"])
        if bone is None:
            errors.append(f"Missing required bone: {required['name']}")
            continue

        actual_parent = bone.parent.name if bone.parent else None
        if actual_parent != required["parent"]:
            errors.append(
                f"Bone {required['name']} expected parent "
                f"{required['parent']!r}, got {actual_parent!r}"
            )

    for socket_name in contract["requiredSockets"]:
        if bones.get(socket_name) is None:
            errors.append(f"Missing required socket/helper bone: {socket_name}")

    return errors


def validate_mesh(
    obj: bpy.types.Object,
    max_influences: int,
) -> tuple[list[str], dict]:
    errors: list[str] = []
    mesh = obj.data

    errors.extend(object_transform_errors(obj))

    unweighted = 0
    too_many_influences = 0
    max_seen = 0

    for vertex in mesh.vertices:
        active = [group for group in vertex.groups if group.weight > EPSILON]
        count = len(active)
        max_seen = max(max_seen, count)

        if count == 0:
            unweighted += 1
        elif count > max_influences:
            too_many_influences += 1

    if unweighted:
        errors.append(f"{obj.name}: {unweighted} vertices have no non-zero skin weights")

    if too_many_influences:
        errors.append(
            f"{obj.name}: {too_many_influences} vertices exceed "
            f"{max_influences} skin influences"
        )

    shape_keys = []
    if mesh.shape_keys:
        shape_keys = [key.name for key in mesh.shape_keys.key_blocks if key.name != "Basis"]

    stats = {
        "name": obj.name,
        "vertices": len(mesh.vertices),
        "polygons": len(mesh.polygons),
        "trianglesEstimate": sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons),
        "materials": len(obj.material_slots),
        "maxSkinInfluencesSeen": max_seen,
        "shapeKeys": shape_keys,
    }

    return errors, stats


def main() -> int:
    args = parse_args()
    root = Path(bpy.path.abspath("//")).resolve()
    contract_path = Path(args.contract)
    if not contract_path.is_absolute():
        contract_path = (root / contract_path).resolve()

    with contract_path.open("r", encoding="utf-8") as handle:
        contract = json.load(handle)

    expected_version = contract["authoring"]["blenderVersion"]
    actual_version = ".".join(str(value) for value in bpy.app.version)

    errors: list[str] = []
    warnings: list[str] = []

    if actual_version != expected_version:
        message = (
            f"Blender version drift: expected {expected_version}, "
            f"running {actual_version}"
        )
        if args.allow_blender_version_drift:
            warnings.append(message)
        else:
            errors.append(message)

    armatures = [obj for obj in bpy.data.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        errors.append(
            f"Expected exactly one production armature, found {len(armatures)}"
        )

    if armatures:
        errors.extend(validate_armature(armatures[0], contract))

    mesh_stats = []
    max_influences = int(contract["authoring"]["maxSkinInfluences"])

    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue

        mesh_errors, stats = validate_mesh(obj, max_influences)
        errors.extend(mesh_errors)
        mesh_stats.append(stats)

    if not mesh_stats:
        errors.append("No mesh objects found")

    report = {
        "schemaVersion": 1,
        "valid": not errors,
        "blendFile": bpy.data.filepath,
        "blenderVersion": actual_version,
        "rigId": contract["rigId"],
        "errors": errors,
        "warnings": warnings,
        "meshes": mesh_stats,
    }

    rendered = json.dumps(report, indent=2)
    print(rendered)

    if args.report:
        report_path = Path(args.report)
        if not report_path.is_absolute():
            report_path = (root / report_path).resolve()
        os.makedirs(report_path.parent, exist_ok=True)
        report_path.write_text(rendered + "\n", encoding="utf-8")

    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
