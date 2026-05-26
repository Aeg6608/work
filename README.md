# Visit Proof Web Prototype

Clickable HTML prototype for the **Visit page with Visit proof block** — usability testing for the Worker GPS audit feature (Tofu 3A CJ3).

## How to open

**Option A — double-click (simplest):**
Open `index.html` directly in Chrome / Safari / Firefox.

**Option B — local server (recommended for deep links):**
```bash
cd prototypes/visit-proof-web
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

Switch via the dark panel in the top-right corner.

| # | Label | What it tests |
|---|-------|---------------|
| 01 | Happy — 35 m, photos | Both map links active, green distance, 3 photos |
| 02 | Far — 2.1 km ⚠ (cinema) | Distance warning in amber, primary CTA dominant |
| 03 | GPS unavailable | No map link for worker, "Location not captured" copy |
| 04 | Address not on map | Worker location available, job address hidden, no distance shown |
| 05 | No photos | Full proof block, empty photo section with Upload placeholder |

## Deep linking

Append `?state=<scenarioId>` to load a specific scenario directly:

```
index.html?state=02_far
index.html?state=03_no_gps
```

Available IDs: `01_happy`, `02_far`, `03_no_gps`, `04_no_address`, `05_no_photos`

## Key product logic (Visit proof block)

- **Where worker was** — primary filled button, links to Google Maps; shown only when GPS was captured at Start
- **Job address** — secondary text link; shown only when address is verified on map
- **Distance** — shown only when both GPS and verified address exist; amber + ⚠ when > 150 m
- **No distance shown** in scenarios 03 (no GPS) and 04 (address not on map) — no false warning

## Scope

- Desktop-first (~1280 px), no build step, vanilla HTML/CSS/JS
- No backend, no real GPS, no Worker App
