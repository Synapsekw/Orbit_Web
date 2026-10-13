import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rasterizeSurface } from '../src/surface.js';

// These catch a DSM that samples ground instead of roofs, loses slopes,
// or treats vertical walls as horizontal surfaces.
const roof = [
  -1, 3, -1, 1, 3, -1, 1, 3, 1,
  -1, 3, -1, 1, 3, 1, -1, 3, 1,
];
test('DSM selects the highest overlapping surface and retains surrounding ground', () => {
  const lower = roof.map((v, i) => i % 3 === 1 ? 1 : v);
  const { heights } = rasterizeSurface([...roof, ...lower], 4, 4, 4, 4);
  assert.equal(heights[2 * 5 + 2], 3);
  assert.equal(heights[0], 0);
  assert.equal(heights[1 * 5 + 1], 3);
});
test('DSM interpolates sloping surfaces without flattening them', () => {
  const slope = [-2, 1, -2, 2, 5, -2, 2, 5, 2, -2, 1, -2, 2, 5, 2, -2, 1, 2];
  const { heights } = rasterizeSurface(slope, 4, 4, 4, 4);
  assert.equal(heights[2 * 5], 1);
  assert.equal(heights[2 * 5 + 2], 3);
  assert.equal(heights[2 * 5 + 4], 5);
});
test('Vertical and degenerate triangles do not poison the height field', () => {
  const { heights } = rasterizeSurface([0,0,0, 0,20,0, 0,20,2, 1,9,1, 1,9,1, 1,9,1], 4,4,4,4);
  assert.ok([...heights].every(h => h === 0));
});
test('Coverage distinguishes captured ground at zero from missing data', () => {
  const ground = roof.map((v,i) => i % 3 === 1 ? 0 : v);
  const { heights, coverage } = rasterizeSurface(ground,4,4,4,4);
  assert.equal(heights[12],0);
  assert.equal(coverage[12],1);
  assert.equal(coverage[0],0);
});
