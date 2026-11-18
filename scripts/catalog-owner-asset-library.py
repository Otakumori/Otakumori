#!/usr/bin/env python3
"""Build durable manifests for the owner-managed SFX and Avatar source libraries.

The script inventories source files without copying them into runtime directories. Install its
pinned metadata dependencies before use:

    python -m pip install -r scripts/requirements-asset-catalog.txt

Usage:
    python scripts/catalog-owner-asset-library.py \
      --sfx-root <owner SFX directory> \
      --avatar-root <owner Avatar directory>
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from mutagen import File as MutagenFile
except ImportError as error:  # pragma: no cover - exercised by operators, not CI
    raise SystemExit("mutagen is required: python -m pip install mutagen") from error

try:
    import imageio_ffmpeg
except ImportError:  # pragma: no cover - waveform analysis is optional
    imageio_ffmpeg = None


AUDIO_EXTENSIONS = {".wav", ".ogg", ".mp3", ".flac", ".m4a", ".aac"}
AVATAR_EXTENSIONS = {
    ".ma", ".mb", ".fbx", ".glb", ".gltf", ".pmx", ".vrm", ".obj",
    ".png", ".jpg", ".jpeg", ".bmp", ".tga", ".webp", ".ktx2", ".fx",
    ".fxsub", ".swatch", ".txt", ".md", ".pdf",
}

EVIDENCE_CAPTURED_AT = "2026-10-30"
GENERATED_AT = f"{EVIDENCE_CAPTURED_AT}T00:00:00+00:00"
CC_BY_4_URL = "https://creativecommons.org/licenses/by/4.0/"
PIXABAY_LICENSE_URL = "https://pixabay.com/service/license-summary/"

PUBLISHER_EVIDENCE: dict[str, dict[str, Any]] = {
    "tommusic-free-fantasy-200": {
        "publisher": "TomMusic",
        "title": "Free Fantasy 200 SFX Pack",
        "sourceUrl": "https://tommusic.itch.io/free-fantasy-200-sfx-pack",
        "licenseId": "CUSTOM_ROYALTY_FREE",
        "licenseUrl": "https://tommusic.itch.io/free-fantasy-200-sfx-pack",
        "rightsSummary": "Commercial and noncommercial project use permitted; credit optional; standalone resale or redistribution prohibited.",
        "attribution": "OPTIONAL",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
    "dillon-becker-sdap-v1": {
        "publisher": "Dillon Becker",
        "title": "Super Dialogue Audio Pack v1",
        "sourceUrl": "https://dillonbecker.itch.io/sdap",
        "licenseId": "CC_BY_4_0",
        "licenseUrl": CC_BY_4_URL,
        "rightsSummary": "Commercial use and adaptation permitted with creator attribution and modification disclosure.",
        "attribution": "REQUIRED",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
    "kenney-asset-pages": {
        "publisher": "Kenney",
        "title": "Kenney asset-page licensing",
        "sourceUrl": "https://kenney.nl/support",
        "licenseId": "CC0",
        "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
        "rightsSummary": "Exact assets published on Kenney asset pages are CC0; no local files matched during this intake.",
        "attribution": "OPTIONAL",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
    "pixabay-content-license": {
        "publisher": "Pixabay",
        "title": "Pixabay Content License",
        "sourceUrl": PIXABAY_LICENSE_URL,
        "licenseId": "PIXABAY_CONTENT_LICENSE",
        "licenseUrl": PIXABAY_LICENSE_URL,
        "rightsSummary": "Free use and adaptation permitted under the Content License; standalone redistribution is prohibited.",
        "attribution": "OPTIONAL",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
    "freesound-bubble-pops-497198": {
        "publisher": "Freesound",
        "title": "Bubble Pops",
        "sourceUrl": "https://freesound.org/people/Abacagi/sounds/497198/",
        "licenseId": "CC_BY_4_0",
        "licenseUrl": CC_BY_4_URL,
        "rightsSummary": "Commercial use and adaptation permitted with attribution to Abacagi and modification disclosure.",
        "attribution": "REQUIRED",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
    "incompetech-cc-by-4": {
        "publisher": "Incompetech",
        "title": "Kevin MacLeod royalty-free catalog",
        "sourceUrl": "https://incompetech.com/music/royalty-free/full_list.html",
        "licenseId": "CC_BY_4_0",
        "licenseUrl": CC_BY_4_URL,
        "rightsSummary": "Verified catalog recordings permit commercial use and adaptation with Kevin MacLeod attribution and modification disclosure.",
        "attribution": "REQUIRED",
        "evidenceCapturedAt": EVIDENCE_CAPTURED_AT,
    },
}

PIXABAY_FILES = {
    "freesound_community-katana-sword-70247.mp3": {
        "title": "Katana Sword", "creator": "crawfordjohnb@bellsouth.net (Freesound)",
        "sourceUrl": "https://pixabay.com/sound-effects/film-special-effects-katana-sword-70247/",
    },
    "freesound_community-loud-silence-75803.mp3": {
        "title": "Loud Silence", "creator": "qubodup (Freesound)",
        "sourceUrl": "https://pixabay.com/sound-effects/film-special-effects-loud-silence-75803/",
    },
    "freesound_community-sfx_spirit_gain-95855.mp3": {
        "title": "SFX_SPIRIT_GAIN", "creator": "Brimistic (Freesound)",
        "sourceUrl": "https://pixabay.com/sound-effects/musical-sfx-spirit-gain-95855/",
    },
    "soundreality-wrong-place-129242.mp3": {
        "title": "Wrong Place", "creator": "SoundReality",
        "sourceUrl": "https://pixabay.com/sound-effects/film-special-effects-wrong-place-129242/",
    },
    "54427377-sword-slash-476148.mp3": {
        "title": "Sword Slash", "creator": "54427377",
        "sourceUrl": "https://pixabay.com/sound-effects/sword-slash-476148/",
    },
}

INCOMPETECH_FILES = {
    "Baba Yaga.mp3": ("Baba Yaga", "USUAN1500079", "petal-storm"),
    "Atlantean%20Twilight.mp3": ("Atlantean Twilight", "USUAN1100322", "memory-keeper"),
    "villian_Master Disorder.mp3": ("Master Disorder", "USUAN1600034", "special-results"),
    "Bleeping Demo.mp3": ("Bleeping Demo", "USUAN2000021", "memory-defrag"),
    "Cretaceous Dawn.mp3": ("Cretaceous Dawn", "USUAN2500001", "otaku-beat-em-up"),
    "Ethernight Club.mp3": ("Ethernight Club", "USUAN2100002", "competitive-minigame"),
    "Galactic Rap.mp3": ("Galactic Rap", "USUAN2300009", "results-progression"),
    "Gregorian Chant_interestingdialoguebg.mp3": ("Gregorian Chant", "USUAN1600052", "narrative-chambers"),
    "Journey To Ascend.mp3": ("Journey to Ascend", "USUAN2200001", "petal-samurai"),
    "Leaving Home.mp3": ("Leaving Home", "USUAN1900002", "reflective-progression"),
    "Lewis and Dekalb__fighter.mp3": ("Lewis and Dekalb", "USUAN1600027", "otaku-beat-em-up"),
    "Screen Saver.mp3": ("Screen Saver", "USUAN1900046", "game-hub"),
    "Valse Gymnopedie.mp3": ("Valse Gymnopedie", "USUAN2100012", "profile-sanctuary"),
}

OWNER_AUTHORED_FILES = {
    "satisfying-soft-cute-butt-uqdnx4eo.wav": "917E1C41A18577367AC8175F0EDD89AA3503B1F8BC7C65D56B2F8CDD2F6370ED",
    "interesting ui.mp3": "4863D325B435675298AE0C4AA6E84D6537C836AAB8AF6EE5DED6D6D4B569DC0C",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def normalized_text(value: str) -> str:
    value = value.replace("%20", " ").replace("_", " ").replace("-", " ")
    value = re.sub(r"\(\d+\)(?=\.[^.]+$)", "", value)
    return re.sub(r"\s+", " ", value).strip().lower()


def clean_tag_value(value: Any) -> str | list[str] | None:
    if isinstance(value, bytes):
        return None
    if isinstance(value, (list, tuple)):
        cleaned = [str(item)[:500] for item in value if not isinstance(item, bytes)]
        return cleaned[:10]
    text = str(value)
    return text[:500] if text else None


def audio_metadata(path: Path) -> dict[str, Any]:
    parsed = MutagenFile(path, easy=True)
    if parsed is None or getattr(parsed, "info", None) is None:
        return {"valid": False, "error": "UNRECOGNIZED_AUDIO"}
    info = parsed.info
    tags: dict[str, Any] = {}
    if parsed.tags:
        for key in sorted(parsed.tags.keys(), key=str)[:30]:
            value = clean_tag_value(parsed.tags[key])
            if value is not None:
                tags[str(key)] = value
    bpm = None
    for key in ("bpm", "tbpm", "BPM"):
        if key in tags:
            raw = tags[key][0] if isinstance(tags[key], list) else tags[key]
            try:
                bpm = float(raw)
            except (TypeError, ValueError):
                pass
            break
    return {
        "valid": True,
        "durationSeconds": round(float(getattr(info, "length", 0.0)), 4),
        "channels": getattr(info, "channels", None),
        "sampleRate": getattr(info, "sample_rate", None),
        "bitrate": getattr(info, "bitrate", None),
        "bitsPerSample": getattr(info, "bits_per_sample", None),
        "bpm": bpm,
        "loudnessLufs": None,
        "tags": tags,
    }


def audio_family(relative: str) -> str:
    lower = relative.lower()
    if "free fantasy sfx pack by tommusic" in lower:
        return "TOMMUSIC_FREE_FANTASY_SFX"
    if "super dialogue audio pack" in lower:
        return "SUPER_DIALOGUE_AUDIO_PACK_V1"
    return "OWNER_INDIVIDUAL_AUDIO"


def volume_segment(path: Path, start: float, duration: float) -> dict[str, Any] | None:
    if imageio_ffmpeg is None:
        return None
    command = [
        imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-nostats", "-ss", f"{start:.3f}",
        "-t", f"{duration:.3f}", "-i", str(path), "-vn", "-af", "volumedetect",
        "-f", "null", "NUL",
    ]
    result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", errors="replace")
    output = result.stderr
    mean = re.search(r"mean_volume:\s*(-?[\d.]+) dB", output)
    peak = re.search(r"max_volume:\s*(-?[\d.]+) dB", output)
    if result.returncode != 0 or not mean or not peak:
        return None
    return {
        "startSeconds": round(start, 3), "durationSeconds": round(duration, 3),
        "meanVolumeDb": float(mean.group(1)), "maxVolumeDb": float(peak.group(1)),
    }


def waveform_analysis(path: Path, duration: float) -> dict[str, Any]:
    if imageio_ffmpeg is None or duration <= 0:
        return {"state": "NOT_ANALYZED", "reason": "FFMPEG_UNAVAILABLE"}
    if duration < 30:
        points = [("whole", 0.0, duration)]
    else:
        window = min(10.0, duration / 8)
        points = [
            ("opening", 0.0, window),
            ("earlyBody", duration * 0.15, window),
            ("midpoint", duration * 0.50, window),
            ("lateBody", duration * 0.75, window),
            ("ending", max(0.0, duration - window), window),
        ]
    segments = []
    for label, start, window in points:
        measured = volume_segment(path, start, window)
        if measured:
            segments.append({"label": label, **measured})
    if not segments:
        return {"state": "FAILED", "reason": "NO_VOLUME_MEASUREMENTS"}
    highest = max(segments, key=lambda segment: segment["meanVolumeDb"])
    average = round(sum(segment["meanVolumeDb"] for segment in segments) / len(segments), 2)
    opening = segments[0]["meanVolumeDb"]
    ending = segments[-1]["meanVolumeDb"]
    loop_state = "REQUIRES_AUDIBLE_REVIEW"
    if duration >= 30 and abs(opening - ending) <= 3:
        loop_state = "TECHNICALLY_PLAUSIBLE"
    return {
        "state": "ANALYZED", "method": "FFMPEG_VOLUME_SEGMENTS",
        "segments": segments, "averageMeanVolumeDb": average,
        "highestEnergySample": highest["label"],
        "endingFadeLikely": ending <= opening - 6,
        "loopSuitability": loop_state,
    }


def dialogue_fields(parts: tuple[str, ...]) -> tuple[str | None, str | None, str | None]:
    category = next((re.sub(r"^\d+\s*-\s*", "", part) for part in parts if re.match(r"^\d+\s*-", part)), None)
    gender = next((part for part in parts if part.lower() in {"male", "female"}), None)
    actor = None
    if gender and gender in parts:
        index = parts.index(gender)
        actor = parts[index + 1] if index + 1 < len(parts) else None
    return category, gender, actor


def classify_audio(relative: str, metadata: dict[str, Any]) -> dict[str, Any]:
    lower = normalized_text(relative)
    filename_lower = normalized_text(Path(relative).name)
    family = audio_family(relative)
    parts = tuple(Path(relative).parts)
    duration = float(metadata.get("durationSeconds") or 0)
    category = "UNKNOWN"
    roles: list[str] = []
    games: list[str] = []
    speaker = None
    variation = re.search(r"(?:^|\D)(\d{1,3})(?:\D|$)", Path(relative).stem)

    if family == "SUPER_DIALOGUE_AUDIO_PACK_V1":
        dialogue_category, gender, speaker = dialogue_fields(parts)
        category = "DIALOGUE"
        role_map = {
            "completion": "VOICE_COMPLETION", "confirmation": "VOICE_CONFIRMATION",
            "greeting": "VOICE_GREETING", "farewell": "VOICE_FAREWELL",
            "refusal": "VOICE_REFUSAL", "miscellaneous": "VOICE_MISC",
            "damage": "VOCAL_DAMAGE", "death": "VOCAL_DEATH",
            "grunting": "VOCAL_GRUNT", "shouting": "VOCAL_SHOUT",
        }
        roles = [role_map.get((dialogue_category or "").lower(), "VOICE_MISC")]
        games = ["maid-cafe-manager"] if roles[0] in {"VOICE_GREETING", "VOICE_CONFIRMATION", "VOICE_FAREWELL", "VOICE_COMPLETION"} else ["otaku-beat-em-up", "dungeon-of-desire"]
        if gender:
            category = f"DIALOGUE_{gender.upper()}"
    elif "bgs loops" in lower:
        category = "AMBIENCE"
        if "cave" in lower:
            roles = ["DUNGEON_AMBIENCE"]
            games = ["dungeon-of-desire"]
        elif "sea" in lower or "beach" in lower:
            roles = ["WATER_AMBIENCE"]
            games = ["bubble-ragdoll", "puzzle-reveal"]
        elif "interior" in lower:
            roles = ["INTERIOR_AMBIENCE"]
            games = ["maid-cafe-manager", "puzzle-reveal"]
        else:
            roles = ["WORLD_AMBIENCE"]
            games = ["petal-samurai", "otaku-beat-em-up"]
    elif "footstep" in lower:
        category = "SFX"
        surface = next((name for name in ("stone", "wood", "water", "dirt") if name in lower), "generic")
        roles = [f"FOOTSTEP_{surface.upper()}"]
        games = ["dungeon-of-desire", "otaku-beat-em-up"]
    elif "sword" in lower or "katana" in lower or "slash" in lower:
        category = "SFX"
        if "unsheath" in filename_lower:
            roles = ["SWORD_UNSHEATH"]
        elif "sheath" in filename_lower:
            roles = ["SWORD_SHEATH"]
        elif "block" in filename_lower or "parry" in filename_lower:
            roles = ["SWORD_PARRY"]
        elif "hit" in filename_lower or "impact" in filename_lower:
            roles = ["SWORD_IMPACT"]
        else:
            roles = ["SWORD_SLASH_LIGHT" if duration <= 1.2 else "SWORD_SLASH_HEAVY"]
        games = ["petal-samurai", "otaku-beat-em-up"]
    elif "spell" in lower or "magic" in lower or "spirit gain" in lower:
        category = "SFX"
        roles = ["MAGIC_GAIN" if "gain" in lower else "MAGIC_IMPACT"]
        games = ["dungeon-of-desire", "puzzle-reveal", "petal-storm"]
    elif "waterfall" in lower or "river" in lower or "stream" in lower:
        category = "AMBIENCE"
        roles = ["WATERFALL_AMBIENCE"]
        games = ["petal-samurai", "dungeon-of-desire"]
    elif "door" in lower or "gate" in lower or "chest" in lower:
        category = "SFX"
        roles = ["ENVIRONMENT_INTERACTION"]
        games = ["dungeon-of-desire", "puzzle-reveal"]
    elif "torch" in lower:
        category = "AMBIENCE"
        roles = ["TORCH_AMBIENCE"]
        games = ["dungeon-of-desire", "petal-samurai"]
    elif "bubble" in lower or "cute butt" in lower:
        category = "SFX"
        roles = ["BUBBLE_POP" if "pop" in lower else "BUBBLE_SOFT_IMPACT"]
        games = ["bubble-ragdoll"]
    elif "interesting ui" in lower:
        category = "UI"
        roles = ["UI_CONFIRM"]
        games = ["maid-cafe-manager", "puzzle-reveal"]
    elif family == "OWNER_INDIVIDUAL_AUDIO" and (duration >= 20 or "alone samurai" in lower):
        category = "MUSIC"
        music_rules = [
            (("samurai",), "BGM_SAMURAI", ["petal-samurai"]),
            (("fighter",), "BGM_COMBAT", ["otaku-beat-em-up"]),
            (("villian", "villain", "baba yaga"), "BGM_BOSS", ["dungeon-of-desire", "otaku-beat-em-up"]),
            (("gregorian",), "BGM_DIALOGUE_BED", ["dungeon-of-desire", "puzzle-reveal"]),
            (("bleeping", "galactic", "ethernight"), "BGM_RHYTHM", ["petal-storm"]),
            (("valse",), "BGM_CAFE", ["maid-cafe-manager"]),
            (("atlantean", "cretaceous"), "BGM_DUNGEON", ["dungeon-of-desire"]),
            (("screen saver",), "BGM_MENU", ["bubble-ragdoll", "puzzle-reveal"]),
            (("journey", "leaving home"), "BGM_WORLD", ["puzzle-reveal", "petal-samurai"]),
        ]
        matched = next(((role, fits) for terms, role, fits in music_rules if any(term in lower for term in terms)), None)
        roles = [matched[0] if matched else "BGM_EXPERIMENTAL"]
        games = matched[1] if matched else []
    else:
        category = "SFX" if duration < 20 else "UNKNOWN"
        roles = ["UNCLASSIFIED_SFX" if category == "SFX" else "UNCLASSIFIED_AUDIO"]

    preferred = roles[0]
    thematic = 5 if games and preferred != "UNCLASSIFIED_SFX" else 2
    extension = Path(relative).suffix.lower()
    technical = 5 if extension in {".wav", ".flac"} else 4 if extension == ".ogg" else 3
    if metadata.get("sampleRate") and metadata["sampleRate"] < 44100:
        technical -= 1
    repeat = 5 if category == "AMBIENCE" else 4 if category == "MUSIC" else 4 if duration <= 3 else 3
    readability = 5 if category in {"SFX", "UI"} and duration <= 2 else 4 if category == "DIALOGUE" else 3
    uniqueness = 4 if family == "OWNER_INDIVIDUAL_AUDIO" else 3
    average = round((thematic + technical + repeat + readability + uniqueness) / 5, 2)
    decision = "BEST_MATCH" if average >= 4.4 else "GOOD_ALTERNATE" if average >= 3.6 else "SOURCE_MATERIAL" if average >= 2.8 else "NOT_RECOMMENDED"
    return {
        "family": family,
        "category": category,
        "speaker": speaker,
        "variation": int(variation.group(1)) if variation else None,
        "semanticRoles": roles,
        "preferredRole": preferred,
        "likelyGameFit": games,
        "scores": {
            "thematicFit": thematic, "technicalQuality": technical,
            "loopRepeatSuitability": repeat, "gameplayReadability": readability,
            "uniqueness": uniqueness, "average": average,
        },
        "decision": decision,
    }


def normalized_tag(metadata: dict[str, Any], key: str) -> str | None:
    value = metadata.get("tags", {}).get(key)
    if isinstance(value, list):
        value = value[0] if value else None
    return normalized_text(str(value)) if value else None


def provenance_for_audio(
    relative: str,
    family: str,
    metadata: dict[str, Any],
    checksum: str,
) -> dict[str, Any]:
    base = {
        "publisherEvidenceId": None,
        "creator": None,
        "title": Path(relative).stem,
        "sourceUrl": None,
        "licenseId": None,
        "licenseUrl": None,
        "attribution": "UNKNOWN",
        "modificationDisclosureRequired": False,
        "sourceMatch": {"state": "UNVERIFIED", "basis": []},
        "commercialRights": "PENDING",
        "technicalRuntimeState": "SOURCE_ONLY",
        "ownerPlacementState": "OWNER_REVIEW_REQUIRED",
        "publicationState": "NOT_AUTHORIZED",
    }

    if family == "TOMMUSIC_FREE_FANTASY_SFX":
        evidence = PUBLISHER_EVIDENCE["tommusic-free-fantasy-200"]
        return {
            **base,
            "publisherEvidenceId": "tommusic-free-fantasy-200",
            "creator": "TomMusic",
            "sourceUrl": evidence["sourceUrl"],
            "licenseId": evidence["licenseId"],
            "licenseUrl": evidence["licenseUrl"],
            "attribution": "OPTIONAL",
            "sourceMatch": {
                "state": "VERIFIED_PACK_MEMBERSHIP",
                "basis": ["original package directory", "publisher WAV/OGG hierarchy", "bundled ReadMe"],
            },
            "commercialRights": "CLEARED",
        }

    if family == "SUPER_DIALOGUE_AUDIO_PACK_V1":
        evidence = PUBLISHER_EVIDENCE["dillon-becker-sdap-v1"]
        return {
            **base,
            "publisherEvidenceId": "dillon-becker-sdap-v1",
            "creator": "Dillon Becker",
            "sourceUrl": evidence["sourceUrl"],
            "licenseId": evidence["licenseId"],
            "licenseUrl": evidence["licenseUrl"],
            "attribution": "REQUIRED",
            "modificationDisclosureRequired": True,
            "sourceMatch": {
                "state": "VERIFIED_PACK_MEMBERSHIP",
                "basis": ["original package directory", "bundled License.pdf", "speaker/category hierarchy"],
            },
            "commercialRights": "CLEARED",
        }

    filename = Path(relative).name
    if filename in PIXABAY_FILES:
        source = PIXABAY_FILES[filename]
        return {
            **base,
            "publisherEvidenceId": "pixabay-content-license",
            "creator": source["creator"],
            "title": source["title"],
            "sourceUrl": source["sourceUrl"],
            "licenseId": "PIXABAY_CONTENT_LICENSE",
            "licenseUrl": PIXABAY_LICENSE_URL,
            "attribution": "OPTIONAL",
            "sourceMatch": {
                "state": "VERIFIED_SOURCE_ID_MATCH",
                "basis": ["publisher source ID in filename", "publisher title/creator record"],
            },
            "commercialRights": "CLEARED",
        }

    if filename == "497198__abacagi__bubble-pops.wav":
        evidence = PUBLISHER_EVIDENCE["freesound-bubble-pops-497198"]
        duration_matches = abs(float(metadata.get("durationSeconds") or 0) - 6.099) <= 0.02
        return {
            **base,
            "publisherEvidenceId": "freesound-bubble-pops-497198",
            "creator": "Abacagi",
            "title": "Bubble Pops",
            "sourceUrl": evidence["sourceUrl"],
            "licenseId": evidence["licenseId"],
            "licenseUrl": evidence["licenseUrl"],
            "attribution": "REQUIRED",
            "modificationDisclosureRequired": True,
            "sourceMatch": {
                "state": "VERIFIED_SOURCE_ID_MATCH" if duration_matches else "FILE_MATCH_REVIEW_REQUIRED",
                "basis": ["Freesound source ID and creator in filename", "publisher duration match"],
            },
            "commercialRights": "CLEARED" if duration_matches else "PENDING",
        }

    if filename in INCOMPETECH_FILES:
        title, isrc, destination = INCOMPETECH_FILES[filename]
        tagged_title = normalized_tag(metadata, "title")
        tagged_artist = normalized_tag(metadata, "artist")
        tag_match = tagged_title == normalized_text(title) and tagged_artist == "kevin macleod"
        return {
            **base,
            "publisherEvidenceId": "incompetech-cc-by-4",
            "creator": "Kevin MacLeod",
            "title": title,
            "sourceUrl": f"https://incompetech.com/music/royalty-free/index.html?isrc={isrc}",
            "licenseId": "CC_BY_4_0",
            "licenseUrl": CC_BY_4_URL,
            "attribution": "REQUIRED",
            "modificationDisclosureRequired": True,
            "sourceMatch": {
                "state": "VERIFIED_TAG_AND_CATALOG_MATCH" if tag_match else "FILE_MATCH_REVIEW_REQUIRED",
                "basis": ["exact filename", "embedded title/artist tags" if tag_match else "embedded identifying tags absent"],
                "isrc": isrc,
            },
            "commercialRights": "CLEARED" if tag_match else "PENDING",
            "creativeDestination": destination,
        }

    if filename in OWNER_AUTHORED_FILES and checksum == OWNER_AUTHORED_FILES[filename]:
        return {
            **base,
            "creator": "Otakumori owner",
            "title": Path(filename).stem,
            "licenseId": "OWNER_AUTHORED",
            "attribution": "NOT_REQUIRED",
            "sourceMatch": {"state": "VERIFIED_OWNER_HASH", "basis": ["owner-supplied SHA-256 attestation"]},
            "commercialRights": "CLEARED_OWNER_ATTESTATION",
        }

    return base


def license_for_provenance(provenance: dict[str, Any]) -> tuple[str, str]:
    rights = provenance["commercialRights"]
    if rights == "CLEARED":
        state = "ATTRIBUTION_REQUIRED" if provenance["attribution"] == "REQUIRED" else "LICENSE_VERIFIED"
        return state, f"{provenance['licenseId']}; exact source evidence recorded"
    if rights == "CLEARED_OWNER_ATTESTATION":
        return (
            "OWNER_AUTHORED_RIGHTS_CONFIRMED",
            "Owner attests independent creation with no third-party samples, loops, or AI-generated components",
        )
    if rights == "ATTESTATION_PENDING_COMPONENT_RIGHTS":
        return "OWNER_AUTHORED_RIGHTS_ATTESTATION_PENDING", "Owner authorship stated; embedded component/sample rights unanswered"
    if provenance["publisherEvidenceId"] == "incompetech-cc-by-4":
        return "LICENSE_EVIDENCE_REQUIRED", "Publisher license identified; exact local recording match needs additional evidence"
    return "OWNER_STATES_LICENSED_EVIDENCE_PENDING", "Owner-supplied individual download; per-file evidence not present"


def tom_content_key(relative: str) -> str | None:
    parts = list(Path(relative).parts)
    try:
        index = next(i for i, part in enumerate(parts) if part in {"WAV Files", "OGG Files"})
    except StopIteration:
        return None
    parts[index] = "FORMAT"
    return str(Path(*parts).with_suffix("")).lower()


def build_audio_manifest(root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    records: list[dict[str, Any]] = []
    binary_groups: dict[str, list[int]] = defaultdict(list)
    content_groups: dict[str, list[int]] = defaultdict(list)

    all_source_files = [path for path in root.rglob("*") if path.is_file()]
    for path in sorted(all_source_files, key=lambda item: str(item).lower()):
        if not path.is_file() or path.suffix.lower() not in AUDIO_EXTENSIONS or "__MACOSX" in path.parts:
            continue
        relative = path.relative_to(root).as_posix()
        checksum = sha256(path)
        metadata = audio_metadata(path)
        classified = classify_audio(relative, metadata)
        provenance = provenance_for_audio(relative, classified["family"], metadata, checksum)
        license_state, license_note = license_for_provenance(provenance)
        blocked_states = {
            "LICENSE_EVIDENCE_REQUIRED",
            "OWNER_STATES_LICENSED_EVIDENCE_PENDING",
            "OWNER_AUTHORED_RIGHTS_ATTESTATION_PENDING",
        }
        if license_state in blocked_states:
            recommendation = "HOLD_LICENSE_EVIDENCE"
        elif license_state == "OWNER_AUTHORED_RIGHTS_CONFIRMED":
            recommendation = "OWNER_PLACEMENT_REQUIRED"
        elif classified["category"].startswith("DIALOGUE"):
            recommendation = "OWNER_CASTING_REQUIRED"
        elif classified["family"] == "TOMMUSIC_FREE_FANTASY_SFX" and path.suffix.lower() == ".wav":
            recommendation = "SOURCE_MASTER_ONLY"
        else:
            recommendation = "RUNTIME_CANDIDATE"
        record = {
            "id": f"audio_{checksum[:16].lower()}",
            "sourceRoot": "OWNER_SFX_LIBRARY",
            "relativePath": relative,
            "filename": path.name,
            "extension": path.suffix.lower(),
            "bytes": path.stat().st_size,
            **metadata,
            **classified,
            "sha256": checksum,
            "duplicate": {"status": "UNIQUE", "canonicalId": None, "contentGroup": None},
            "licenseState": license_state,
            "licenseNote": license_note,
            "provenance": provenance,
            "runtimeRecommendation": recommendation,
            "contentAnalysis": waveform_analysis(path, float(metadata.get("durationSeconds") or 0))
            if classified["family"] == "OWNER_INDIVIDUAL_AUDIO"
            else {"state": "PASS_A_METADATA_ONLY"},
        }
        records.append(record)
        binary_groups[checksum].append(len(records) - 1)
        key = tom_content_key(relative)
        if key:
            content_groups[key].append(len(records) - 1)

    for indices in binary_groups.values():
        if len(indices) < 2:
            continue
        canonical = min(indices, key=lambda index: (records[index]["bytes"], records[index]["relativePath"]))
        for index in indices:
            if index != canonical:
                records[index]["duplicate"] = {
                    "status": "BINARY_IDENTICAL", "canonicalId": records[canonical]["id"], "contentGroup": None,
                }
                records[index]["runtimeRecommendation"] = "ALIAS_ONLY"

    paired_content: list[dict[str, Any]] = []
    for key, indices in content_groups.items():
        formats = {records[index]["extension"] for index in indices}
        if len(indices) < 2 or len(formats) < 2:
            continue
        wav = next((index for index in indices if records[index]["extension"] == ".wav"), indices[0])
        ogg = next((index for index in indices if records[index]["extension"] == ".ogg"), indices[-1])
        group_id = f"tom_pair_{hashlib.sha1(key.encode()).hexdigest()[:12]}"
        if records[wav]["duplicate"]["status"] == "UNIQUE":
            records[wav]["duplicate"] = {
                "status": "CONTENT_CANONICAL", "canonicalId": records[wav]["id"], "contentGroup": group_id,
            }
        if records[ogg]["duplicate"]["status"] == "UNIQUE":
            records[ogg]["duplicate"] = {
                "status": "CONTENT_DUPLICATE", "canonicalId": records[wav]["id"], "contentGroup": group_id,
            }
        if records[ogg]["licenseState"] == "LICENSE_VERIFIED":
            records[ogg]["runtimeRecommendation"] = "RUNTIME_CANDIDATE"
        paired_content.append({
            "id": group_id,
            "sourceCanonicalId": records[wav]["id"],
            "runtimePreferredId": records[ogg]["id"],
            "members": [records[index]["id"] for index in indices],
        })

    by_role: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record["duplicate"]["status"] == "BINARY_IDENTICAL":
            continue
        by_role[record["preferredRole"]].append(record)
    for candidates in by_role.values():
        candidates.sort(key=lambda item: (-item["scores"]["average"], item["durationSeconds"], item["relativePath"]))

    required_roles = {
        "puzzle-reveal": ["MAGIC_GAIN", "MAGIC_IMPACT", "INTERIOR_AMBIENCE", "UI_CONFIRM"],
        "petal-samurai": ["SWORD_SLASH_LIGHT", "SWORD_SLASH_HEAVY", "SWORD_PARRY", "SWORD_SHEATH", "SWORD_UNSHEATH", "WATERFALL_AMBIENCE", "BGM_SAMURAI"],
        "bubble-ragdoll": ["BUBBLE_POP", "BUBBLE_SOFT_IMPACT", "WATER_AMBIENCE", "BGM_MENU"],
        "petal-storm": ["MAGIC_GAIN", "UI_CONFIRM", "BGM_RHYTHM"],
        "dungeon-of-desire": ["DUNGEON_AMBIENCE", "FOOTSTEP_STONE", "MAGIC_IMPACT", "VOCAL_DAMAGE", "VOCAL_DEATH", "BGM_DUNGEON", "BGM_BOSS"],
        "maid-cafe-manager": ["UI_CONFIRM", "VOICE_GREETING", "VOICE_CONFIRMATION", "VOICE_FAREWELL", "VOICE_COMPLETION", "INTERIOR_AMBIENCE", "BGM_CAFE"],
        "otaku-beat-em-up": ["SWORD_IMPACT", "BODY_IMPACT", "VOCAL_DAMAGE", "VOCAL_DEATH", "VOCAL_GRUNT", "VOCAL_SHOUT", "FOOTSTEP_STONE", "BGM_COMBAT", "BGM_BOSS"],
    }
    shortlists: dict[str, list[dict[str, Any]]] = {}
    for game, roles in required_roles.items():
        game_entries = []
        for role in roles:
            candidates = [item for item in by_role.get(role, []) if game in item["likelyGameFit"]]
            game_entries.append({
                "role": role,
                "candidates": [
                    {
                        "id": item["id"], "relativePath": item["relativePath"],
                        "decision": item["decision"], "licenseState": item["licenseState"],
                        "score": item["scores"]["average"],
                    }
                    for item in candidates[:3]
                ],
            })
        shortlists[game] = game_entries

    kinds = Counter(record["category"] for record in records)
    license_counts = Counter(record["licenseState"] for record in records)
    binary_aliases = sum(1 for record in records if record["duplicate"]["status"] == "BINARY_IDENTICAL")
    content_duplicates = sum(1 for record in records if record["duplicate"]["status"] == "CONTENT_DUPLICATE")
    dialogue_count = sum(count for category, count in kinds.items() if category.startswith("DIALOGUE"))
    rollup = {
        "music": kinds.get("MUSIC", 0),
        "sfx": kinds.get("SFX", 0),
        "dialogue": dialogue_count,
        "ambience": kinds.get("AMBIENCE", 0),
        "ui": kinds.get("UI", 0),
        "unknown": kinds.get("UNKNOWN", 0),
    }
    manifest = {
        "version": 1,
        "generatedAt": GENERATED_AT,
        "sourceRoot": {"id": "OWNER_SFX_LIBRARY", "pathPolicy": "OWNER_LOCAL_RELATIVE_PATHS_ONLY"},
        "summary": {
            "rootFiles": len(all_source_files),
            "audioFiles": len(records),
            "uniqueBinaryFiles": len(records) - binary_aliases,
            "uniqueContentAssets": len(records) - binary_aliases - content_duplicates,
            "binaryDuplicateAliases": binary_aliases,
            "contentDuplicateFiles": content_duplicates,
            "contentDuplicateGroups": len(paired_content),
            "categories": dict(sorted(kinds.items())),
            "rollup": rollup,
            "licenseStates": dict(sorted(license_counts.items())),
        },
        "publisherEvidence": [
            {"id": evidence_id, **evidence}
            for evidence_id, evidence in PUBLISHER_EVIDENCE.items()
        ],
        "contentDuplicateGroups": paired_content,
        "shortlists": shortlists,
        "files": records,
    }
    credit_records: list[dict[str, Any]] = [
        {
            "id": "tommusic-free-fantasy-200", "scope": "SOURCE_LIBRARY",
            "title": "Free Fantasy 200 SFX Pack", "creator": "TomMusic",
            "sourceUrl": PUBLISHER_EVIDENCE["tommusic-free-fantasy-200"]["sourceUrl"],
            "licenseId": "CUSTOM_ROYALTY_FREE",
            "licenseUrl": PUBLISHER_EVIDENCE["tommusic-free-fantasy-200"]["licenseUrl"],
            "attributionRequired": False, "credit": "Free Fantasy 200 SFX Pack by TomMusic",
            "modifications": "No runtime transformation approved; publisher OGG variants preferred.",
            "publicationState": "NOT_AUTHORIZED", "publicCredit": True,
        },
        {
            "id": "super-dialogue-audio-pack-v1", "scope": "SOURCE_LIBRARY",
            "title": "Super Dialogue Audio Pack v1", "creator": "Dillon Becker",
            "sourceUrl": PUBLISHER_EVIDENCE["dillon-becker-sdap-v1"]["sourceUrl"],
            "licenseId": "CC_BY_4_0", "licenseUrl": CC_BY_4_URL,
            "attributionRequired": True, "credit": "Super Dialogue Audio Pack v1 by Dillon Becker",
            "modifications": "No runtime derivatives selected.",
            "publicationState": "NOT_AUTHORIZED", "publicCredit": True,
        },
    ]
    credited_ids = {record["id"] for record in credit_records}
    for record in records:
        provenance = record["provenance"]
        if record["licenseState"] not in {"LICENSE_VERIFIED", "ATTRIBUTION_REQUIRED"}:
            continue
        if record["family"] in {"TOMMUSIC_FREE_FANTASY_SFX", "SUPER_DIALOGUE_AUDIO_PACK_V1"}:
            continue
        credit_id = f"audio-credit-{record['sha256'][:16].lower()}"
        if credit_id in credited_ids:
            continue
        credited_ids.add(credit_id)
        if provenance["creator"] == "Kevin MacLeod":
            credit = (
                f"\"{provenance['title']}\" Kevin MacLeod (incompetech.com); "
                "Licensed under Creative Commons: By Attribution 4.0"
            )
        else:
            credit = f"{provenance['title']} by {provenance['creator']}"
        credit_records.append({
            "id": credit_id, "scope": "INDIVIDUAL_SOURCE", "assetId": record["id"],
            "title": provenance["title"], "creator": provenance["creator"],
            "sourceUrl": provenance["sourceUrl"], "licenseId": provenance["licenseId"],
            "licenseUrl": provenance["licenseUrl"],
            "attributionRequired": provenance["attribution"] == "REQUIRED",
            "credit": credit, "modifications": "None; source library intake only.",
            "publicationState": "NOT_AUTHORIZED", "publicCredit": True,
        })
    pending = [
        {
            "relativePath": record["relativePath"], "sha256": record["sha256"],
            "state": record["licenseState"], "reason": record["licenseNote"],
        }
        for record in records
        if record["family"] == "OWNER_INDIVIDUAL_AUDIO"
        and record["licenseState"]
        not in {
            "LICENSE_VERIFIED",
            "ATTRIBUTION_REQUIRED",
            "OWNER_AUTHORED_RIGHTS_CONFIRMED",
        }
    ]
    attributions = {
        "version": 2,
        "generatedAt": GENERATED_AT,
        "publisherEvidence": [
            {"id": evidence_id, **evidence}
            for evidence_id, evidence in PUBLISHER_EVIDENCE.items()
        ],
        "entries": credit_records,
        "pendingEvidence": pending,
    }
    return manifest, attributions


def glb_json(path: Path) -> dict[str, Any] | None:
    with path.open("rb") as stream:
        header = stream.read(12)
        if len(header) != 12 or header[:4] != b"glTF":
            return None
        _, version, _ = struct.unpack("<4sII", header)
        if version != 2:
            return None
        chunk_length, chunk_type = struct.unpack("<II", stream.read(8))
        if chunk_type != 0x4E4F534A:
            return None
        return json.loads(stream.read(chunk_length).decode("utf-8").rstrip("\x00 \t\r\n"))


def avatar_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".ma", ".mb"}: return "DCC_SOURCE"
    if suffix in {".fbx", ".glb", ".gltf", ".pmx", ".vrm", ".obj"}: return "MODEL"
    if suffix in {".png", ".jpg", ".jpeg", ".bmp", ".tga", ".webp", ".ktx2"}: return "TEXTURE"
    if suffix in {".txt", ".md", ".pdf"}: return "DOCUMENTATION"
    return "MATERIAL_SUPPORT"


def build_avatar_manifest(root: Path) -> dict[str, Any]:
    records: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*"), key=lambda item: str(item).lower()):
        if not path.is_file() or path.suffix.lower() not in AVATAR_EXTENSIONS or "__MACOSX" in path.parts:
            continue
        relative = path.relative_to(root).as_posix()
        lower = relative.lower()
        if "code vein base edit" in lower:
            license_state = "DO_NOT_SHIP"
            recommendation = "REFERENCE_ONLY_NONCOMMERCIAL_RIPPED_ASSET"
        elif path.name == "Attribution animebasemeshglb_1917kb.txt" and path.stat().st_size == 0:
            license_state = "LICENSE_EVIDENCE_REQUIRED"
            recommendation = "EMPTY_ATTRIBUTION_EVIDENCE"
        else:
            license_state = "LICENSE_EVIDENCE_REQUIRED"
            recommendation = "ADAPTATION_SOURCE_ONLY" if path.suffix.lower() in {".ma", ".fbx"} else "HOLD_LICENSE_EVIDENCE"
        details: dict[str, Any] = {}
        if path.suffix.lower() == ".ma":
            text = path.read_text(encoding="utf-8", errors="ignore")
            details = {
                "jointNodes": text.count("createNode joint"),
                "skinClusters": text.count("createNode skinCluster"),
                "blendShapeNodes": text.count("createNode blendShape"),
                "meshNodes": text.count("createNode mesh"),
                "hikCharacters": text.count("HIKCharacterNode"),
                "containsMaleGroup": 'createNode transform -n "Male"' in text,
                "containsFemaleGroup": 'createNode transform -n "Female"' in text,
                "containsGenesis9References": "Genesis 9" in text or "Genesis9" in text,
                "canonicalRig": False,
                "canonicalMorphs": False,
            }
        elif path.suffix.lower() == ".glb":
            document = glb_json(path) or {}
            meshes = document.get("meshes", [])
            primitives = [primitive for mesh in meshes for primitive in mesh.get("primitives", [])]
            details = {
                "generator": document.get("asset", {}).get("generator"),
                "nodes": len(document.get("nodes", [])),
                "meshes": len(meshes),
                "primitives": len(primitives),
                "skins": len(document.get("skins", [])),
                "animations": len(document.get("animations", [])),
                "materials": len(document.get("materials", [])),
                "textures": len(document.get("textures", [])),
                "morphTargetSets": sum(len(primitive.get("targets", [])) for primitive in primitives),
                "canonicalRig": False,
                "canonicalMorphs": False,
            }
        records.append({
            "id": f"avatar_source_{sha256(path)[:16].lower()}",
            "sourceRoot": "OWNER_AVATAR_LIBRARY", "relativePath": relative,
            "filename": path.name, "extension": path.suffix.lower(),
            "kind": avatar_kind(path), "bytes": path.stat().st_size,
            "sha256": sha256(path), "licenseState": license_state,
            "recommendation": recommendation, "details": details,
        })

    source = next((record for record in records if record["relativePath"] == "anime_base_male_female.ma"), None)
    return {
        "version": 1,
        "generatedAt": GENERATED_AT,
        "sourceRoot": {"id": "OWNER_AVATAR_LIBRARY", "pathPolicy": "OWNER_LOCAL_RELATIVE_PATHS_ONLY"},
        "summary": {
            "relevantFiles": len(records),
            "kinds": dict(sorted(Counter(record["kind"] for record in records).items())),
            "licenseStates": dict(sorted(Counter(record["licenseState"] for record in records).items())),
            "strongestFemaleBase": "anime_base_male_female.ma",
            "strongestMaleBase": "anime_base_male_female.ma",
            "productionStatus": "ADAPTATION_SOURCE_LICENSE_BLOCKED",
        },
        "canonicalAssessment": {
            "source": source["relativePath"] if source else None,
            "solves": ["editable Maya source", "male and female groups", "skinClusters", "HumanIK infrastructure", "supporting textures"],
            "remaining": ["prove commercial/runtime redistribution rights", "map and reduce rig to om-humanoid-v1", "author canonical body and face morphs", "rebuild semantic materials", "export and validate separate production GLBs"],
            "morphStatus": "NO_CANONICAL_MORPH_SET",
            "licenseStatus": "LICENSE_EVIDENCE_REQUIRED",
            "runtimeGlbStatus": "STATIC_NONCANONICAL_REFERENCE",
        },
        "rejectedFamilies": [
            {"pathPrefix": "Code Vein Base Edit/", "state": "DO_NOT_SHIP", "reason": "Ripped Bandai Namco assets; included terms prohibit commercial use."},
        ],
        "files": records,
    }


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sfx-root", type=Path, required=True)
    parser.add_argument("--avatar-root", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    if not args.sfx_root.is_dir() or not args.avatar_root.is_dir():
        raise SystemExit("Both --sfx-root and --avatar-root must be existing directories")

    audio, attributions = build_audio_manifest(args.sfx_root.resolve())
    avatar = build_avatar_manifest(args.avatar_root.resolve())
    authority = args.output_root / "docs/design/production-authority"
    write_json(authority / "audio-library-manifest.json", audio)
    write_json(authority / "avatar-source-manifest.json", avatar)
    write_json(args.output_root / "docs/legal/audio-attributions.json", attributions)
    print(json.dumps({"audio": audio["summary"], "avatar": avatar["summary"]}, indent=2))


if __name__ == "__main__":
    main()
