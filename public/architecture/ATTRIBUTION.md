# Local architecture preview assets

These assets are synthetic scene materials and anonymous avatars. They are not
Res Publica staff, members, real premises, or evidence of institutional activity.

## Human models

Microsoft Rocketbox, copyright (c) 2020 Microsoft. MIT License, reproduced in
`ROCKETBOX-LICENSE.txt`. Source revision:
`0943055db6ec570bcef9f2c8b41c9e5467c808f9`.

Source: https://github.com/microsoft/Microsoft-Rocketbox

Selected Female_Adult_01/04/08 and Male_Adult_01/04/08. Original FBX retained. Texture
format conversion to 1024px WebP; no facial identity generation. Rig poses and
standard-material mapping are adapted at runtime. Names identify source asset
files, not actual individuals. These are realtime avatars, not film-quality scans.

## Ceremonial flags

EU and German flag textures are locally drawn from their geometric designs.
The Lion-and-Sun texture (`lion-sun-reference-v1.png`) was generated with the
built-in image tool using the owner's supplied photograph as reference:
green/white/red horizontal stripes, golden lion with sword and sun, no crown,
flat cloth artwork without the photograph's hand or surroundings. It is a
reconstruction, not certified official artwork. None of these symbols asserts
institutional sponsorship. UN and UNESCO emblems are not included.

## Materials and lighting

Poly Haven: `stone_tiles_02`, `wooden_floor_01`, `oak_veneer_01`, `lebombo`.
CC0 asset license: https://polyhaven.com/license

Furniture uses Oak Veneer 01 by Jenelle van Heerden at its documented 1.8m scale:
https://polyhaven.com/a/oak_veneer_01
The older parquet maps remain inventoried but are no longer used on furniture.

Material maps converted from 1K JPEG to WebP. HDR lighting retained as RGBE.
All runtime files are self-hosted; no visitor information is sent to providers.

### Detail pass — 2026-09-20

Additional CC0 assets: `urban_courtyard_02` (distant photographic lighting
environment), `marble_01`, `modern_arm_chair_01` (Vibrant Nordic), and
`potted_plant_01`. Original source URLs and checksums are retained in
`details/manifest.json`. The occupied building remains authored geometric 3D;
the distant courtyard HDR is photographic, not reconstructed exterior geometry.

`scripts/prepare-architecture-detail-assets.mjs` downloads only these explicitly
selected assets. Then `scripts/optimize-architectural-plant.mjs` generates an
attribute-aware geometric LOD, reducing one plant from 176,226 to 38,768 triangles.
Original geometry remains retained; runtime uses the smaller LOD. These changes
do not replace the Rocketbox occupants with scanned humans.

## Integrity and regeneration

`manifest.json` records source URLs, source revision, byte sizes and SHA-256
checksums of the local optimized files. `scripts/prepare-architecture-assets.mjs`
performs explicit asset preparation; it is not part of installation, build,
CI, or runtime. It never downloads source scripts or executes provider code.
