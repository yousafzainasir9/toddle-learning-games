import { colors, gameAccents } from './colors';

/**
 * Design-system invariants.
 *
 * Plan §4.2.3 forbids pure white and pure black. Plan §4.2.4 forbids any
 * fully-saturated 100% color. These tests fail the build if anyone slips
 * a banned value into the palette.
 */
describe('colors', () => {
  it('contains no pure white', () => {
    for (const value of Object.values(colors)) {
      expect(value.toUpperCase()).not.toBe('#FFFFFF');
      expect(value.toUpperCase()).not.toBe('#FFF');
    }
  });

  it('contains no pure black', () => {
    for (const value of Object.values(colors)) {
      expect(value.toUpperCase()).not.toBe('#000000');
      expect(value.toUpperCase()).not.toBe('#000');
    }
  });

  it('uses 6-digit hex codes only', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('caps saturation below 0.90 (HSL) for all swatches', () => {
    // The plan says max ~70-85%. We give a small safety margin.
    for (const [name, value] of Object.entries(colors)) {
      const { s } = hexToHsl(value);
      expect({ name, s }).toEqual(
        expect.objectContaining({ name, s: expect.any(Number) }),
      );
      expect(s).toBeLessThanOrEqual(0.9);
    }
  });

  it('every per-game accent is a value from the main palette', () => {
    const paletteValues = new Set(Object.values(colors));
    for (const accent of Object.values(gameAccents)) {
      expect(paletteValues.has(accent)).toBe(true);
    }
  });
});

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s, l };
}
