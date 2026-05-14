import {
  DEFAULT_DIFFICULTY_CONFIG,
  initialDifficulty,
  onCorrect,
  onWrong,
} from './difficulty-curve';

describe('difficulty curve', () => {
  it('starts at the configured minimum', () => {
    const s = initialDifficulty();
    expect(s.level).toBe(1);
    expect(s.correctStreak).toBe(0);
    expect(s.wrongStreak).toBe(0);
  });

  it('clamps the initial level to bounds', () => {
    expect(initialDifficulty(99).level).toBe(DEFAULT_DIFFICULTY_CONFIG.max);
    expect(initialDifficulty(-3).level).toBe(DEFAULT_DIFFICULTY_CONFIG.min);
  });

  it('bumps level after the configured correct streak', () => {
    let s = initialDifficulty();
    let delta: number;

    ({ state: s, delta } = onCorrect(s));
    expect(delta).toBe(0);
    expect(s.correctStreak).toBe(1);

    ({ state: s, delta } = onCorrect(s));
    expect(delta).toBe(0);
    expect(s.correctStreak).toBe(2);

    ({ state: s, delta } = onCorrect(s));
    expect(delta).toBe(1);
    expect(s.level).toBe(2);
    expect(s.correctStreak).toBe(0);
  });

  it('does not bump past max', () => {
    let s = initialDifficulty(DEFAULT_DIFFICULTY_CONFIG.max);
    for (let i = 0; i < 10; i++) {
      ({ state: s } = onCorrect(s));
    }
    expect(s.level).toBe(DEFAULT_DIFFICULTY_CONFIG.max);
  });

  it('drops level only after the configured wrong streak', () => {
    let s = initialDifficulty(3);
    let delta: number;

    ({ state: s, delta } = onWrong(s));
    expect(delta).toBe(0);
    expect(s.level).toBe(3);
    expect(s.wrongStreak).toBe(1);

    ({ state: s, delta } = onWrong(s));
    expect(delta).toBe(-1);
    expect(s.level).toBe(2);
    expect(s.wrongStreak).toBe(0);
  });

  it('does not drop below min', () => {
    let s = initialDifficulty(DEFAULT_DIFFICULTY_CONFIG.min);
    for (let i = 0; i < 10; i++) {
      ({ state: s } = onWrong(s));
    }
    expect(s.level).toBe(DEFAULT_DIFFICULTY_CONFIG.min);
  });

  it('a correct tap resets the wrong streak', () => {
    let s = initialDifficulty(2);
    ({ state: s } = onWrong(s));
    expect(s.wrongStreak).toBe(1);
    ({ state: s } = onCorrect(s));
    expect(s.wrongStreak).toBe(0);
    // One earlier wrong tap should NOT drop level if followed by a correct.
    expect(s.level).toBe(2);
  });

  it('a wrong tap resets the correct streak', () => {
    let s = initialDifficulty();
    ({ state: s } = onCorrect(s));
    ({ state: s } = onCorrect(s));
    expect(s.correctStreak).toBe(2);
    ({ state: s } = onWrong(s));
    expect(s.correctStreak).toBe(0);
  });

  it('a single wrong tap NEVER drops difficulty (forgiving)', () => {
    let s = initialDifficulty(3);
    ({ state: s } = onWrong(s));
    expect(s.level).toBe(3); // unchanged after one wrong
  });
});
