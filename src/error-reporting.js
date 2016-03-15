import Raven from 'raven-js';
import { version } from '../package.json';
import { raven, ids } from '../config.json';

const extensionExpr = new RegExp(`^chrome-extension:\/\/${ids.join('|')}\/.*`);

const config = {
  release: version,
  whitelistUrls: [ extensionExpr ],
  includePaths: [ extensionExpr ]
}

export function captureException(...args) {
  // 'raven-js' isn't being properly exported
  return Raven.captureException(...args);
}

export default function setup(pageChange) {
  if (pageChange) return;
  
  Raven.config(raven.DSN, config).install();
}
