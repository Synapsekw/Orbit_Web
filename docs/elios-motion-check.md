# Elios camera motion — 13 October 2026

The continuous orbit issued a 100 ms camera transition approximately every 85–100 ms. Sketchfab's default `easeOutQuad` restarted on every update, producing repeated acceleration and braking. Set `easeLinear` once when the viewer becomes ready, before positioning and starting the orbit. All inline Elios instances use this initializer.

Official API: https://sketchfab.com/developers/viewer/functions#api-setCameraEasing

## Local before/after observation

A temporary opt-in sampler read the actual camera azimuth at approximately 50 ms intervals. Each run collected 130 samples, discarded the first 20 for warm-up and compared the remaining 109 angular-speed intervals. Same localhost preview and browser, with no manual interaction during collection.

| Camera motion metric | Default easing | Linear easing |
| --- | ---: | ---: |
| Angular-speed coefficient of variation | 0.7546 | 0.1706 |
| Intervals below 0.001 radians/second | 11 / 109 | 0 / 109 |
| Mean angular speed, radians/second | 0.0353 | 0.0507 |

Observed speed variation decreased by approximately 77%. This is a short local camera-motion measurement, not a frame-rate benchmark or a guarantee for all devices. The official external model remains much denser than the local DJI models. The diagnostic sampler was removed after testing; it does not run in the delivered site.

Pause produced two pixel-identical model crops several seconds apart. Manual rotation changed the paused camera frame; reset and resume remained functional.
