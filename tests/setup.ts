/**
 * Jest test setup. Runs after each test file.
 *
 * We don't import this file directly — it's wired up via package.json
 * `jest.setupFilesAfterEach`.
 */
import { __resetRegistryForTests } from '@core/registry';

afterEach(() => {
  __resetRegistryForTests();
});
