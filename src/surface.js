export function rasterizeSurface(positions, width, depth, columns, rows) {
  const heights = new Float32Array((columns + 1) * (rows + 1));
  const coverage = new Uint8Array(heights.length);
  const sx = width / columns, sz = depth / rows;
  for (let i = 0; i < positions.length; i += 9) {
    const ax=positions[i], ay=positions[i+1], az=positions[i+2];
    const bx=positions[i+3], by=positions[i+4], bz=positions[i+5];
    const cx=positions[i+6], cy=positions[i+7], cz=positions[i+8];
    const d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);
    if (Math.abs(d)<1e-8 || Math.max(ay,by,cy)<0) continue;
    const x0=Math.max(0,Math.ceil((Math.min(ax,bx,cx)+width/2)/sx-1e-6));
    const x1=Math.min(columns,Math.floor((Math.max(ax,bx,cx)+width/2)/sx+1e-6));
    const z0=Math.max(0,Math.ceil((Math.min(az,bz,cz)+depth/2)/sz-1e-6));
    const z1=Math.min(rows,Math.floor((Math.max(az,bz,cz)+depth/2)/sz+1e-6));
    for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++) {
      const px=x*sx-width/2, pz=z*sz-depth/2;
      const u=((bz-cz)*(px-cx)+(cx-bx)*(pz-cz))/d;
      const v=((cz-az)*(px-cx)+(ax-cx)*(pz-cz))/d;
      const w=1-u-v;
      if(u>=-1e-6 && v>=-1e-6 && w>=-1e-6) {
        const index=z*(columns+1)+x;
        heights[index]=Math.max(heights[index],u*ay+v*by+w*cy);
        coverage[index]=1;
      }
    }
  }
  return { heights, coverage };
}
