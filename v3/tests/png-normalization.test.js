import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { decodePng, encodeRgba, baselineImage } from '../scripts/normalize-watercolor.js';

const signature = Buffer.from('89504e470d0a1a0a', 'hex');
function crc(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12); out.writeUInt32BE(data.length); out.write(type, 4); data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, -4)), out.length - 4); return out;
}
function rgbFixture({ color = 2, interlace = 0, extra = [] } = {}) {
  const header = Buffer.alloc(13); header.writeUInt32BE(2); header.writeUInt32BE(2, 4); header[8] = 8; header[9] = color; header[12] = interlace;
  // Top row red/green with None filtering; bottom row blue/white with Up filtering.
  const raw = Buffer.from([0, 255,0,0, 0,255,0, 2, 1,0,255, 255,0,255]);
  return Buffer.concat([signature, chunk('IHDR', header), ...extra, chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('RGB PNG normalization preserves all source colors and adds opaque alpha', () => {
  const decoded = decodePng(rgbFixture());
  assert.deepEqual([...decoded.pixels], [255,0,0,255, 0,255,0,255, 0,0,255,255, 255,255,255,255]);
  const normalized = encodeRgba(decoded);
  assert.equal(normalized[25], 6);
  assert.deepEqual(decodePng(normalized).pixels, decoded.pixels);
});

test('RGBA normalization preserves transparent RGB samples and fractional alpha exactly', () => {
  const width = 23, height = 8, pixels = Buffer.alloc(width * height * 4);
  for (let index = 0; index < pixels.length; index++) pixels[index] = (index * 37 + Math.floor(index / 19)) & 255;
  pixels[3] = 0; pixels[7] = 255; pixels[11] = 127;
  const first = encodeRgba({ width, height, pixels }), decoded = decodePng(first);
  assert.deepEqual(decoded.pixels, pixels);
  assert.deepEqual(decodePng(encodeRgba(decoded)).pixels, pixels);
  assert.equal(decoded.width, width); assert.equal(decoded.height, height);
});

test('Color interpretation is retained while text metadata is removed', () => {
  const gamma = Buffer.alloc(4); gamma.writeUInt32BE(45455);
  const png = rgbFixture({ extra: [chunk('gAMA', gamma), chunk('tEXt', Buffer.from('Comment\0test provenance'))] });
  const decoded = decodePng(png), normalized = encodeRgba(decoded);
  assert.deepEqual(decodePng(normalized).profiles, [{ type: 'gAMA', data: gamma }]);
  assert.equal(normalized.includes(Buffer.from('tEXt')), false);
  assert.deepEqual(decodePng(normalized).pixels, decoded.pixels);
});

test('Damaged or unsupported PNG data is rejected rather than silently transformed', () => {
  const damaged = rgbFixture(); damaged[damaged.length - 1] ^= 1;
  assert.throws(() => decodePng(damaged), /Prüfsumme/);
  assert.throws(() => decodePng(rgbFixture({ color: 3 })), /RGB/);
  assert.throws(() => decodePng(rgbFixture({ interlace: 1 })), /RGB/);
  assert.throws(() => decodePng(rgbFixture({ extra: [chunk('tRNS', Buffer.alloc(6))] })), /tRNS/);
  assert.throws(() => decodePng(rgbFixture().subarray(0, -2)), /Unvollständig|unvollständig/);
});

test('Structural baselines use actual layout dimensions and keep circle corners transparent', () => {
  const image = baselineImage({ width: 1254, height: 1254, shape: 'circle' });
  assert.equal(image.width, 1254); assert.equal(image.height, 1254); assert.equal(image.pixels.length, 1254 * 1254 * 4);
  assert.equal(image.pixels[3], 0);
  assert.equal(image.pixels[((627 * 1254) + 627) * 4 + 3], 255);
  assert.equal(image.pixels[image.pixels.length - 1], 0);
  const clear = baselineImage({ width: 1254, height: 1254, shape: 'circle' }, true);
  assert.ok(clear.pixels.every(byte => byte === 0));
  assert.throws(() => baselineImage({ width: 1254, height: 1024, shape: 'circle' }), /Geometrie/);
});
