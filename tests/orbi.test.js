import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleExpression, ORBI_STATES } from '../src/orbi/orbi-motion.js';
import { guideReply, safeLink, normalizeAnswer } from '../src/orbi/orbi-guide.js';

test('reduced motion gives a stable expression across time, including speaking', () => {
  for (const state of ORBI_STATES) {
    assert.deepEqual(sampleExpression(state, 1, false), sampleExpression(state, 27, false));
  }
});
test('every expression remains finite and eyes stay visible through animation', () => {
  for (const state of ORBI_STATES) for (let t = 0; t < 16; t += .13) {
    const p = sampleExpression(state, t, true);
    assert.ok(Object.values(p).every(Number.isFinite));
    assert.ok(p.eyeY > 0 && p.eyeX > 0);
  }
});
test('unsupported states resolve to the idle face', () => {
  assert.deepEqual(sampleExpression('made-up', 2), sampleExpression('idle', 2));
});
test('speaking animates the mouth, a paused character does not', () => {
  assert.notEqual(sampleExpression('speaking', .1).open, sampleExpression('speaking', .2).open);
});
test('links cannot execute script or escape to third-party sites', () => {
  for (const value of ['javascript:alert(1)', '//evil.example', 'https://evil.example', '/\\evil.example', 'data:text/html,test', '/bad\npath']) {
    assert.equal(safeLink(value), null, value);
  }
  assert.equal(safeLink('/contact/?service=spatial-mapping'), '/contact/?service=spatial-mapping');
});
test('prepared guide routes service questions without inventing prices or facts', () => {
  assert.equal(guideReply('I need a 360 walkthrough').links[0].href, '/services/360-walkthroughs/');
  assert.equal(guideReply('How much will it cost?').links[0].href, '/contact/');
  assert.match(guideReply('Which equipment do you own?').reply, /team|contact/i);
  assert.doesNotMatch(guideReply('Tell me something unrelated').reply, /time-lapse records/i);
});
test('response normalization rejects empty replies and filters unsafe links', () => {
  assert.throws(() => normalizeAnswer({ reply: '' }), /reply/i);
  assert.throws(() => normalizeAnswer(null), /reply/i);
  const answer = normalizeAnswer({reply:'Hello <script>bad</script>',links:[{label:'Bad',href:'javascript:bad()'},{label:'Contact',href:'/contact/'}]});
  assert.equal(answer.reply, 'Hello <script>bad</script>');
  assert.deepEqual(answer.links, [{label:'Contact',href:'/contact/'}]);
});
