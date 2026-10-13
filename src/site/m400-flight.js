export function advanceFlight(state,delta,enabled,inspecting){
 const dt=enabled?Math.min(.05,Math.max(0,delta)):0;
 return {aircraft:state.aircraft+(inspecting?0:dt),rotors:state.rotors+dt};
}
export function flightOffset(time){
 return {yaw:time*.105,x:Math.sin(time*.43)*.018,y:Math.sin(time*1.12)*.055,pitch:Math.sin(time*.64)*.012,roll:Math.sin(time*.82)*.015};
}
// Deliberately slowed for a legible web visualization, not operating RPM.
export const rotorAngle=(time,direction)=>((time*14)%(Math.PI*2))*direction;
