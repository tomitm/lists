import uglify from 'rollup-plugin-uglify';

import config from './rollup.config.js';

config.plugins.push(uglify());

export default config;
