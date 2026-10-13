// Sketchfab's aircraft scene is Z-up. Always orbit about the model's own target.
export function orbitCamera(camera,{yaw=0,pitch=0,zoom=1}={}){
 const [x,y,z]=camera.position.map((v,i)=>v-camera.target[i]);
 const radius=Math.hypot(x,y,z),azimuth=Math.atan2(y,x)+yaw;
 const elevation=Math.max(-1.48,Math.min(1.48,Math.atan2(z,Math.hypot(x,y))+pitch));
 const offset=[radius*Math.cos(elevation)*Math.cos(azimuth),radius*Math.cos(elevation)*Math.sin(azimuth),radius*Math.sin(elevation)];
 return {position:offset.map((v,i)=>camera.target[i]+v*zoom),target:[...camera.target]};
}
