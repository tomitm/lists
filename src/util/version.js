import { version } from '../../package.json';
import * as storage from './storage.js';

const VERSION_KEY = 'version';

export default function setup(pageChange) {
  if (pageChange) return;

  storage.get(VERSION_KEY).then(({ version: previousVersion }) => {
    if (previousVersion === version) return;

    // future: possible upgrade logic
    storage.set({ version });
  });
}
