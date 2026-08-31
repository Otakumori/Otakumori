# OM_Humanoid_v1 Sakura Nightwarden Outfit Brief

The two images in `docs/design/references/avatar/outfits/` are design authority only. They are not runtime avatar assets.

## Shared visual language
- charcoal/near-black layered tailoring
- dusty sakura accents
- restrained antique bronze hardware
- shoulder fur/feather mantle
- tassels, cords and small blossom hardware
- anime-realistic dark-fantasy silhouette
- cross-hatching concentrated in cloth/leather midtones, occlusion and shadow bands

## Feminine outfit
Preserve the approved physical allure through actual 3D tailoring:
- fitted bust and waist construction that follows the canonical body
- clear hourglass silhouette without painted-on fake anatomy
- high-cut/asymmetric skirt and cape openings with intentional thigh exposure
- thigh straps/garter hardware where deformation remains stable
- tall armored footwear
- cape panels frame the body rather than erase the silhouette
- no bust/waist/hip/thigh mesh intersections
- cloth must remain compatible with later secondary-motion constraints

The result should be attractive, adult, elegant and powerful while remaining technically riggable.

## Masculine outfit
- fitted high-collar underlayer
- lean athletic shape
- strong shoulder mantle
- long asymmetric coat/cape
- layered belt/chain hardware
- knee/boot armor
- avoid oversized generic MMO armor bulk

## Cross-hatch rendering
Treat hatching as a controllable material/shader feature:
- hatch overlay in selected midtone/shadow bands
- cloth/leather texture-space hatch where stable
- avoid high-frequency moire/shimmer on mobile
- keep skin comparatively clean
- maintain a clear cel silhouette
- allow per-game hatch intensity without changing the saved avatar identity

## Runtime dependency
Do not build these outfits as raster swaps. They eventually belong on the canonical skeletal GLB/glTF + React Three Fiber runtime with LOD, morph/body fit, attachment points and spring-bone secondary dynamics.
