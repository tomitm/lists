import config from './rollup.config.js'

import uglify from 'rollup-plugin-uglify';

config.sourceMap = false;
config.plugins.push(uglify());

export default config;
