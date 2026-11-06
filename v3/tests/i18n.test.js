import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage, setLanguage, getLanguage, locale, t, layerLabel } from '../src/i18n.js';

test('Browser language negotiation supports regional preferences and an English fallback', () => {
  assert.equal(detectLanguage(['de-AT', 'en-US']), 'de');
  assert.equal(detectLanguage(['en-GB', 'de']), 'en');
  assert.equal(detectLanguage(['fr-FR', 'de-DE']), 'de');
  assert.equal(detectLanguage(['fr-FR']), 'en');
  assert.equal(detectLanguage([]), 'en');
});
test('Explicit UI translations preserve interpolated names, values and whitespace', () => {
  setLanguage('en');
  assert.equal(locale(), 'en-GB');
  assert.equal(t('  Sorte & Ernte '), '  Strain & harvest ');
  assert.equal(t('1200 × 1800 px · bereit'), '1200 × 1800 px · ready');
  assert.equal(t('Meine Sorte übernommen. Alle Angaben bleiben bearbeitbar.'), 'Meine Sorte selected. All values remain editable.');
  assert.equal(layerLabel('Klarer Himmel · Stufe 1/7'), 'Clear sky · Level 1/7');
  assert.equal(t('My custom strain <script>'), 'My custom strain <script>');
  assert.equal(t('Unknown pack description'), 'Unknown pack description');
  assert.throws(() => setLanguage('fr'));
  assert.equal(getLanguage(), 'en');
  setLanguage('de');
  assert.equal(t('Sorte & Ernte'), 'Sorte & Ernte');
  assert.equal(locale(), 'de-DE');
});
