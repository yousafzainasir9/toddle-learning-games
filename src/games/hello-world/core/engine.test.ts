import { createInitialState, tap } from './engine';

describe('hello-world engine', () => {
  it('starts at zero taps and minimum difficulty', () => {
    const s = createInitialState();
    expect(s.taps).toBe(0);
    expect(s.difficulty.level).toBe(1);
    expect(s.difficulty.correctStreak).toBe(0);
  });

  it('counts taps', () => {
    let s = createInitialState();
    s = tap(s).next;
    s = tap(s).next;
    expect(s.taps).toBe(2);
  });

  it('bumps difficulty after three consecutive taps', () => {
    let s = createInitialState();
    const a = tap(s);
    expect(a.delta).toBe(0);
    s = a.next;
    const b = tap(s);
    expect(b.delta).toBe(0);
    s = b.next;
    const c = tap(s);
    expect(c.delta).toBe(1);
    expect(c.next.difficulty.level).toBe(2);
    // Streak resets after bump.
    expect(c.next.difficulty.correctStreak).toBe(0);
  });
});
