import * as THREE from 'three';

const TAU = Math.PI * 2;

class RibbonCurve extends THREE.Curve {
  constructor(points) { super(); this.points = points.map(p => new THREE.Vector3(...p)); }
  getPoint(t, target = new THREE.Vector3()) {
    const count = this.points.length, position = (t % 1) * count;
    const index = Math.floor(position), u = position - index, u2 = u * u, u3 = u2 * u;
    // A periodic cubic B-spline keeps both slope and curvature continuous.
    const weights = [(1 - 3*u + 3*u2 - u3)/6, (4 - 6*u2 + 3*u3)/6, (1 + 3*u + 3*u2 - 3*u3)/6, u3/6];
    target.set(0, 0, 0);
    weights.forEach((weight, offset) => target.addScaledVector(this.points[(index + offset - 1 + count) % count], weight));
    return target;
  }
}

// Broad, softly twisted ribbons: their varying curvature and width follow the
// sculpted loops in the approved Halo Companion artwork.
function ribbonGeometry(points, phase, segments) {
  const vertices = [], indices = [], sides = 12;
  const curve = new RibbonCurve(points);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * TAU;
    const point = curve.getPointAt(i / segments), tangent = curve.getTangentAt(i / segments).normalize();
    const radial = new THREE.Vector3(tangent.y, -tangent.x, 0).normalize();
    const normal = new THREE.Vector3().crossVectors(radial, tangent).normalize();
    const twist = .38 * Math.sin(t + phase) + .16 * Math.sin(2 * t - phase);
    const across = radial.clone().multiplyScalar(Math.cos(twist)).addScaledVector(normal, Math.sin(twist));
    const depth = normal.clone().multiplyScalar(Math.cos(twist)).addScaledVector(radial, -Math.sin(twist));
    const width = .095 + .11 * (.5 + .5 * Math.sin(t + phase));
    for (let j = 0; j < sides; j++) {
      const cross = j / sides * TAU;
      const vertex = point.clone().addScaledVector(across, Math.cos(cross) * width).addScaledVector(depth, Math.sin(cross) * .023);
      vertices.push(vertex.x, vertex.y, vertex.z);
      if (i < segments) {
        const a = i * sides + j, b = i * sides + (j + 1) % sides;
        indices.push(a, a + sides, b, b, a + sides, b + sides);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  // The closed curve duplicates its first cross-section. Share its normals so
  // the polished surface has no visible join at the seam.
  const normals = geometry.attributes.normal;
  for (let j = 0; j < sides; j++) {
    const end = segments * sides + j;
    const n = new THREE.Vector3().fromBufferAttribute(normals, j).add(new THREE.Vector3().fromBufferAttribute(normals, end)).normalize();
    normals.setXYZ(j, n.x, n.y, n.z); normals.setXYZ(end, n.x, n.y, n.z);
  }
  return geometry;
}

function faceGeometry() {
  const g = new THREE.BufferGeometry(), indices = [];
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(65 * 3), 3).setUsage(THREE.DynamicDrawUsage));
  for (let i = 1; i < 64; i++) indices.push(0, i, i + 1);
  indices.push(0, 64, 1); g.setIndex(indices);
  return g;
}

export function createOrbiModel({ compact = false } = {}) {
  const root = new THREE.Group(), cage = new THREE.Group(), face = new THREE.Group();
  root.add(cage, face);
  const coreMaterial = new THREE.MeshPhysicalMaterial({ color: 0x111923, metalness: .12, roughness: .48, clearcoat: .12, clearcoatRoughness: .5, envMapIntensity: .38 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(.82, compact ? 40 : 64, compact ? 28 : 48), coreMaterial);
  core.scale.set(1, 1.045, .98); root.add(core);
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xeeeae4, metalness: .82, roughness: .32, clearcoat: .22, envMapIntensity: 1.5 });
  const bands = [];
  // Art-directed, closed paths rather than concentric hoops. The lower sweep,
  // left curl and right arch weave at different depths, leaving the face clear.
  const orbits = [
    { phase: .3, points: [[-1.32,.35,-.1],[-1.5,-.03,.32],[-1.1,-.35,1.04],[-.55,-.55,1.23],[.03,-.9,1.12],[.5,-1.25,.58],[1.06,-1.05,.1],[1.4,-.62,-.05],[1.36,-.15,-.12],[.72,.35,-.98],[0,.65,-1.06],[-.8,.68,-.68]] },
    { phase: 1.7, points: [[-.5,1.36,0],[-.84,1.16,.55],[-.73,.57,.96],[-.58,-.13,.91],[-.5,-.82,.7],[-.14,-1.22,.15],[.47,-.94,-.54],[.95,-.26,-.66],[.78,.53,-.54],[.2,1.13,-.27]] },
    { phase: 3.6, points: [[-1.04,.66,-.35],[-.4,1.04,-.02],[.3,1.11,.42],[.83,1.32,.35],[1.15,.86,.42],[1.1,.05,.65],[.87,-.64,.7],[.1,-1.15,-.25],[-.73,-.92,-.55],[-1.18,-.18,-.48]] },
  ];
  for (const orbit of orbits) {
    const pivot = new THREE.Group();
    const band = new THREE.Mesh(ribbonGeometry(orbit.points, orbit.phase, compact ? 160 : 260), metal);
    pivot.add(band); cage.add(pivot);
    bands.push({ pivot, base: 0, band, restX: 0 });
  }

  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xfff2d9, toneMapped: false });
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xe8c795, toneMapped: false });
  const faceZ = (x, y) => Math.sqrt(Math.max(.08, .82 ** 2 - x * x - (y / 1.045) ** 2)) * .98;
  const eyes = [-1, 1].map(side => {
    const edge = new THREE.Mesh(faceGeometry(), edgeMaterial);
    const mesh = new THREE.Mesh(faceGeometry(), eyeMaterial);
    mesh.frustumCulled = edge.frustumCulled = false;
    face.add(edge, mesh); return { side, edge, mesh };
  });
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
  const context = glowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,224,179,.95)');
  gradient.addColorStop(.28, 'rgba(255,217,161,.78)');
  gradient.addColorStop(.48, 'rgba(255,206,139,.38)');
  gradient.addColorStop(.72, 'rgba(255,196,124,.10)');
  gradient.addColorStop(1, 'rgba(255,196,124,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  const glows = eyes.map(({side}) => {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffffff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
    glow.scale.set(.66, .84, 1); face.add(glow); return { side, glow };
  });
  const mouthGeometry = new THREE.BufferGeometry(), mouthIndices = [];
  mouthGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(41 * 6 * 3), 3).setUsage(THREE.DynamicDrawUsage));
  for (let i = 0; i < 40; i++) for (let j = 0; j < 6; j++) {
    const a = i * 6 + j, b = i * 6 + (j + 1) % 6;
    mouthIndices.push(a, b, a + 6, b, b + 6, a + 6);
  }
  mouthGeometry.setIndex(mouthIndices);
  const mouth = new THREE.Mesh(mouthGeometry, eyeMaterial); mouth.frustumCulled = false; face.add(mouth);

  function update(pose, time, animated, lookX = 0, lookY = 0, gesture = 0, yaw = 0) {
    root.rotation.set(lookY * .1 + .03, lookX * .2 - .08 + yaw, pose.tilt);
    root.position.y = pose.lift + gesture;
    bands.forEach(({pivot, base, band, restX}, i) => {
      pivot.rotation.z = base + pose.ring * (i % 2 ? 1 : -1) + (animated ? Math.sin(time * .36 + i * 1.2) * .027 : 0);
      band.rotation.x = restX + (animated ? Math.sin(time * .3 + i) * .025 : 0);
    });
    const happy = Math.max(0, (pose.smile - .65) / .35);
    for (const {side, mesh, edge} of eyes) {
      const cx = side * .255 + lookX * .035 + pose.gazeX;
      const cy = .11 + lookY * .025 + pose.gazeY + (pose.tilt < -.2 ? side * .019 : 0);
      for (const [object, size, depth] of [[edge,1.035,.014], [mesh,1,.021]]) {
        const a = object.geometry.attributes.position;
        for (let i = 0; i <= 64; i++) {
          const angle = (i - 1) / 64 * TAU, r = i ? 1 : 0;
          const ex = Math.cos(angle) * .113 * pose.eyeX * size * r;
          const ey = Math.sin(angle) * .174 * pose.eyeY * size * r;
          const x = cx + ex, y = cy + ey + happy * .055 * (1 - (ex / (.113 * pose.eyeX * size)) ** 2);
          a.setXYZ(i, x, y, faceZ(x, y) + depth);
        }
        a.needsUpdate = true;
      }
    }
    glows.forEach(({side,glow}) => {
      const x = side * .255 + lookX * .035 + pose.gazeX, y = .11 + lookY * .025 + pose.gazeY;
      glow.position.set(x,y,.84); glow.scale.y = .84 * Math.max(.22,pose.eyeY); glow.material.opacity = .95 * Math.min(1,pose.eyeY);
    });
    const a = mouthGeometry.attributes.position;
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, angle = u * TAU;
      const x = pose.open > .01 ? Math.cos(angle) * (.067 + pose.smile * .04) : (u - .5) * (.26 + pose.smile * .1);
      const y = pose.open > .01 ? -.235 + Math.sin(angle) * pose.open : -.215 - pose.smile * .09 * Math.sin(u * Math.PI);
      for (let j = 0; j < 6; j++) {
        const cross = j / 6 * TAU, yy = y + Math.cos(cross) * .007;
        a.setXYZ(i * 6 + j,x,yy,faceZ(x,yy)+.015+Math.sin(cross)*.007);
      }
    }
    a.needsUpdate = true;
  }
  function dispose() {
    const geometries = new Set(), materials = new Set();
    root.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) materials.add(o.material); });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); glowTexture.dispose();
  }
  return { root, update, dispose };
}
