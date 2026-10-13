const expressions = {
  idle:      { eyeX: 1, eyeY: 1, smile: .65, open: 0, tilt: -.13, gazeX: 0, gazeY: 0, lift: 0, ring: 0 },
  curious:   { eyeX: 1, eyeY: 1.12, smile: .5, open: 0, tilt: -.25, gazeX: .04, gazeY: .04, lift: .03, ring: .025 },
  listening: { eyeX: 1.05, eyeY: 1.1, smile: .5, open: 0, tilt: .08, gazeX: 0, gazeY: .025, lift: .04, ring: .03 },
  thinking:  { eyeX: .92, eyeY: .65, smile: .12, open: 0, tilt: -.23, gazeX: .07, gazeY: .05, lift: 0, ring: -.035 },
  speaking:  { eyeX: 1, eyeY: .95, smile: .55, open: .035, tilt: -.06, gazeX: 0, gazeY: 0, lift: 0, ring: .015 },
  happy:     { eyeX: 1.06, eyeY: .24, smile: 1, open: 0, tilt: -.08, gazeX: 0, gazeY: .025, lift: .04, ring: .04 },
  surprised: { eyeX: 1.1, eyeY: 1.18, smile: 0, open: .08, tilt: .04, gazeX: 0, gazeY: 0, lift: .08, ring: .06 },
  concerned: { eyeX: .98, eyeY: .8, smile: -.25, open: 0, tilt: .16, gazeX: -.02, gazeY: -.03, lift: -.025, ring: -.025 },
};
export const ORBI_STATES = Object.freeze(Object.keys(expressions));
export function sampleExpression(state, time = 0, motion = true) {
  const pose = { ...(expressions[state] || expressions.idle) };
  if (!motion) return pose;
  const t = Number.isFinite(time) ? time : 0;
  const cycle = ((t % 7.6) + 7.6) % 7.6;
  const blink = (at, duration) => cycle < at || cycle > at + duration ? 0 : Math.sin((cycle - at) / duration * Math.PI) ** 2;
  pose.eyeY *= 1 - .94 * Math.max(blink(3.15, .19), blink(6.55, .15), blink(6.83, .15));
  pose.lift += Math.sin(t * 1.15) * .035;
  pose.tilt += Math.sin(t * .72) * .018;
  if (state === 'speaking') pose.open = .018 + (.5 + .5 * Math.sin(t * 14)) * .055;
  return pose;
}
