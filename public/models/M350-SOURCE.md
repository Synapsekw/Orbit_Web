# DJI Matrice 350 RTK CAD wireframe

Source: [DJI Matrice 350 RTK downloads](https://enterprise.dji.com/matrice-350-rtk/downloads), **Matrice 350 RTK — 3D Model**, dated 30 May 2023.

Original: https://dl.djicdn.com/downloads/matrice_350_rtk/Matrice_350_RTK_3D_Model.stp

Retrieved 13 October 2026. The 134,487,182-byte STEP source is retained outside the served site in `assets-source/m350/`. It is the actual manufacturer assembly, not reconstructed geometry or the earlier third-party M350/L2 scan. Public download availability does not establish permission for redistribution; this remains local evaluation material pending an appropriate publication basis.

Native OpenCascade conversion uses 1.6 mm mesh deflection and 0.45 radian angular deflection. Two faces had null triangulation and were skipped. CAD curves were sampled at 1.2 mm deflection with segments shorter than 0.8 mm excluded. No edge curves failed. The current browser model contains a simplified 134,035-triangle occluding surface and 48,674 quantized CAD line segments. Navy surfaces, gold CAD curves and faint blue triangle lines are presentation styling, not engineering output.

Active assets: `m350-flight.glb` (307,996 bytes), five `m350-flight-*-edges.bin` files (584,088 bytes total), and the existing `m350-cad.json` manifest. Scripts: `scripts/prepare-m350-flight-cad.py` using the retained `assets-source/m400/cad-env` environment, then `node scripts/prepare-m350-flight-web.mjs`. The older static conversion is retained but no longer loaded. No CAD engine ships to the browser.

The original propellers, hub surfaces and blade markings are separated into four independently animated assemblies. Rotation pivots and tilted axes come from the two 9 mm hinge cylinders in each CAD hub. Stationary motor housings and arms remain in the body. All 478,820 source triangles and 48,674 CAD segments survive the split before simplification. Adjacent propellers counter-rotate at the same illustrative speed as the M400; the aircraft gently turns and hovers. Pause and reduced motion freeze automatic movement, and manual inspection temporarily holds the body while propellers continue. Framing accounts for the complete blade sweep. The same model is used in the homepage and Fleet page.
