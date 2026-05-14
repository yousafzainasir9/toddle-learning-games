import {
  __resetRegistryForTests,
  freezeRegistry,
  getGame,
  listGames,
  registerGame,
  RegistryError,
} from './registry';
import type { GameModule } from './game-module';

function fixture(id: string): GameModule {
  return {
    id,
    displayName: id,
    iconAsset: { uri: 'data:,' },
    minAgeMonths: 12,
    maxAgeMonths: 48,
    skillTags: [],
    Component: () => null,
    preload: async () => {},
    unload: () => {},
  };
}

describe('registry', () => {
  beforeEach(() => __resetRegistryForTests());

  it('registers and retrieves a game', () => {
    const game = fixture('a');
    registerGame(game);
    expect(getGame('a')).toBe(game);
    expect(listGames()).toEqual([game]);
  });

  it('preserves registration order', () => {
    registerGame(fixture('a'));
    registerGame(fixture('b'));
    registerGame(fixture('c'));
    expect(listGames().map((g) => g.id)).toEqual(['a', 'b', 'c']);
  });

  it('rejects duplicate ids', () => {
    registerGame(fixture('a'));
    expect(() => registerGame(fixture('a'))).toThrow(RegistryError);
  });

  it('rejects malformed ids', () => {
    expect(() => registerGame(fixture('Bad ID'))).toThrow(RegistryError);
    expect(() => registerGame(fixture('UPPER'))).toThrow(RegistryError);
    expect(() => registerGame(fixture(''))).toThrow(RegistryError);
    expect(() => registerGame(fixture('snake_case'))).toThrow(RegistryError);
    expect(() => registerGame(fixture('ok-id-123'))).not.toThrow();
  });

  it('blocks registration after freeze', () => {
    registerGame(fixture('a'));
    freezeRegistry();
    expect(() => registerGame(fixture('b'))).toThrow(RegistryError);
  });

  it('returns undefined for unknown ids', () => {
    expect(getGame('nope')).toBeUndefined();
  });
});
