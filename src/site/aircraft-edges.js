export async function loadAircraftEdges(part) {
  const request = async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Edges unavailable');
    return response;
  };
  let buffer;
  if (typeof DecompressionStream === 'function') {
    try {
      const response = await request(part.edges + '.gz');
      // Some static hosts (including Vite preview) set Content-Encoding on .gz
      // files, so fetch has already decoded those bytes. Others serve gzip files
      // directly; use the browser's native streaming decoder for those hosts.
      const decoded = response.headers.get('content-encoding')?.split(',').some(value => value.trim().toLowerCase() === 'gzip');
      buffer = await (decoded ? response : new Response(response.body.pipeThrough(new DecompressionStream('gzip')))).arrayBuffer();
    } catch { /* Older deployments can still supply the original binary. */ }
  }
  if (!buffer) buffer = await (await request(part.edges)).arrayBuffer();
  if (buffer.byteLength !== part.segments * 12) throw new Error('Incomplete CAD edges');
  const packed = new Uint16Array(buffer), positions = new Float32Array(packed.length);
  // Decode each axis without allocating a bounds tuple for every coordinate.
  for (let axis = 0; axis < 3; axis++) {
    const [lo, hi] = part.bounds[axis];
    for (let i = axis; i < packed.length; i += 3) positions[i] = lo + packed[i] / 65535 * (hi - lo);
  }
  return positions;
}
