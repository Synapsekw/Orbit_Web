const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const scrollProgress=(top,height)=>height>0?clamp(-top/height,0,1):0;
export function aircraftPose(progress,manual,motion=true){
 const t=motion?clamp(progress,0,1):0;
 return {yaw:3.5+manual.yaw+t*.9,pitch:.34+manual.pitch-t*.12,roll:-.10+t*.16,scale:manual.scale*(1-t*.12)};
}
