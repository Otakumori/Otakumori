# Otaku-mori Home Portrait Safe-Zone + QA Matrix v1

**Status:** Companion QA authority  
**Applies to:** all six Home portrait time-state assets

## 1. Reference viewport

Primary:
`390×844`

Required neighbor checks:
- `360×800`
- `412×915`
- `430×932`

## 2. Vertical composition zones

| Zone | Height | Function | Must preserve |
| --- | --- | --- | --- |
| Navigation safety | 0–11% | Logo/nav | readable backdrop, no irreplaceable focal detail |
| Surface identity | 12–38% | Tree/horizon/castle | world identity and depth |
| Hero safety | 34–56% | Hero/search | calmer value field, no branch clutter |
| Root transition | 52–70% | Surface→Underground | readable root descent and continuity |
| Underground/footer | 68–100% | Footer/Soapstone | cavern depth, local negative space |

Zones intentionally overlap. They are composition guides, not CSS boxes.

## 3. Safe-zone failure matrix

### Navigation
FAIL if:
- high-frequency canopy makes nav unreadable across states;
- logo must move drastically by state;
- nav requires opaque full-width backing.

### Hero
FAIL if:
- strongest focal point sits directly under heading/search;
- search must cover castle/tree focal detail;
- high-frequency branches make type unreadable.

### Roots
FAIL if:
- roots appear cut off;
- ground transition becomes ambiguous;
- portrait reads like stacked unrelated scenes.

### Footer
FAIL if:
- full-width dark panel becomes necessary;
- text zones cover the only readable cavern landmarks;
- Soapstone has no plausible environmental placement.

## 4. State consistency matrix

For all six states verify:

- tree silhouette stable;
- shoreline stable;
- castle/landmark stable;
- root network logic stable;
- Underground geometry stable;
- crop framing stable;
- UI safe zones stable.

Lighting may change. World geometry should not.

## 5. Technical asset checks

For every candidate record:

- exact filename;
- source path;
- runtime path if created;
- width/height;
- aspect ratio;
- file type;
- file size;
- SHA-256;
- source provenance;
- owner approval status;
- optimized derivative status.

## 6. Runtime QA after integration

At minimum verify:

- correct portrait asset selected on phone;
- correct wide asset remains selected on desktop;
- time-state mapping unchanged;
- no hydration mismatch;
- no new CLS;
- no first-frame asset flash;
- failure fallback still works;
- orientation/resize works;
- sleep/wake time-state resync still works;
- reduced motion unaffected.

## 7. Visual evidence format

Each screenshot should identify:

`STATE | VIEWPORT | ASSET ID | RUNTIME PATH | DECODED`

Example:

`LATE AFTERNOON | 390×844 | home.world.late-afternoon.portrait-v1 | /assets/home/world/combined/om-home-world-04-late-afternoon-portrait.webp | yes`

## 8. Owner approval decision

Allowed owner outcomes:

- `APPROVE`
- `APPROVE WITH NONBLOCKING FOLLOW-UP`
- `REJECT — REVISE`
- `REJECT — NEW CANDIDATE`

Do not infer approval from silence or technical green status.
