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
export function resolveOrbiMotion({enabled = true, allowed = true, reduced = false} = {}) {
  return {active:!!enabled && !!allowed && !reduced,locked:!allowed || !!reduced,reason:reduced ? 'device' : !allowed ? 'page' : !enabled ? 'orbi' : null};
}
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

const launcherRest = Object.freeze({x:0,y:0,roll:0,yaw:0,scaleX:1,scaleY:1,shadowScale:1,shadowOpacity:.4});
// Positions are percentages of the avatar, inside the launcher's reserved stage.
// One turn, a rebound and a hover are separated by generous, grounded dwell time.
const launcherLeap = [
  [2.2, {}],
  [2.45, {y:3,roll:-7,scaleX:1.07,scaleY:.93}],
  [2.88, {x:-6,y:-24,roll:-12,scaleX:.98,scaleY:1.03}],
  [3.52, {x:-10,y:-29,roll:3,yaw:Math.PI*1.4}],
  [3.94, {x:-4,y:-11,roll:7,yaw:Math.PI*2}],
  [4.17, {y:3,yaw:Math.PI*2,scaleX:1.09,scaleY:.91}],
  [4.42, {x:-2,y:-12,yaw:Math.PI*2,scaleX:.99,scaleY:1.03}],
  [4.8, {y:1,yaw:Math.PI*2,scaleX:1.03,scaleY:.97}],
  [5.1, {yaw:Math.PI*2}],
].map(([time,pose]) => [time,{...launcherRest,...pose}]);

export function sampleLauncherMotion(time = 0, motion = true) {
  const pose = {...launcherRest};
  if (!motion || !Number.isFinite(time) || time < 0) return pose;
  const cycle = time % 18;
  if (cycle >= 2.2 && cycle < 5.1) {
    const next = launcherLeap.findIndex(([at]) => at > cycle);
    const [start,from] = launcherLeap[next-1], [end,to] = launcherLeap[next];
    const progress = (cycle-start)/(end-start), ease = progress*progress*(3-2*progress);
    for (const key in pose) pose[key] = from[key]+(to[key]-from[key])*ease;
  } else if (cycle >= 8 && cycle < 12.2) {
    const progress = (cycle-8)/4.2, envelope = Math.sin(progress*Math.PI)**2;
    pose.x = -6*envelope;
    pose.y = -(14+3*Math.sin(progress*Math.PI*3)**2)*envelope;
    pose.roll = 5*Math.sin(progress*Math.PI*3)*envelope;
  }
  const height = Math.max(0,-pose.y)/30;
  pose.shadowScale = 1-height*.4;
  pose.shadowOpacity = .4-height*.2;
  return pose;
}
