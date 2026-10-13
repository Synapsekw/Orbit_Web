# DJI Matrice 400 CAD wireframe

Source: [DJI Matrice 400 downloads](https://enterprise.dji.com/matrice-400/downloads), listing **DJI Matrice 400 — 3D Model**, dated 12 June 2025.

Original download: https://dl.djicdn.com/downloads/Matrice_400/DJI_Matrice_400_3D_Model.stp

Retrieved 13 October 2026. The 164,495,496-byte STEP assembly is retained outside the served site at `assets-source/m400/`. The original is manufacturer CAD, not a newly reconstructed or AI-generated aircraft. Download availability does not establish a public redistribution licence. This conversion is used for local evaluation pending an appropriate publication basis.

Preparation:

- Imported with native OpenCascade via `cadquery-ocp-novtk` 7.9.3.1.1. The WebAssembly importer was tested but returned empty triangulations for this assembly; it is not included as a site dependency.
- Tessellated with 1.6 mm linear deflection and 0.45 radian angular deflection. The native mesher reported 15 faces with null triangulation; those surfaces were skipped. The original CAD edge extraction reported no failed curves.
- Sampled the structural CAD curves at 1.2 mm deflection and removed segments shorter than 0.8 mm. Retained 56,636 line segments, encoded as 16-bit coordinates relative to the recorded bounding box.
- Simplified the occluding surface to 171,705 triangles and applied Draco compression. No invented aircraft parts, payload or geometry were added.
- The renderer assigns navy surfaces, gold CAD edges and faint blue triangle lines. These are a website visualization treatment, not source material colours or engineering-measurement output.

Animated hero: `m400-flight.glb` (330,664 bytes), five `m400-flight-*-edges.bin` files (679,632 bytes combined), and `m400-flight.json` metadata. The engineering source contains 780 shells. Twelve shells comprising four propeller hubs and their blades were separated from the body, preserving all 613,296 source triangles and 56,636 retained CAD line segments before surface simplification. Each rotor's pivot and tilted axis were extracted from the original hub's cylindrical surfaces. No replacement propeller geometry was added. The renderer turns the aircraft, adds a gentle hover and counter-rotates adjacent propellers at a deliberately slowed illustrative speed, not operating RPM. Scripts: `scripts/prepare-m400-flight-cad.py` and `scripts/prepare-m400-flight-web.mjs`.

The original static assets are retained: `m400-cad.glb` (307,248 bytes), `m400-edges.bin` (679,632 bytes), and `m400-cad.json` metadata. Original scripts: `scripts/prepare-m400-cad.py` and `scripts/prepare-m400-web.mjs`. The website loads its existing Draco decoder and Three.js renderer only when needed.

Alternative researched: [CGTrader's textured M400 model](https://www.cgtrader.com/3d-models/electronics/other/dji-matrice-400-drone), listed at US$99 with a royalty-free (no AI) licence on 13 October 2026. Not purchased, downloaded or used. A paid asset would require confirming its public interactive-web usage terms before distribution.
