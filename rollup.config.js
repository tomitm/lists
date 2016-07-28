import fs from 'fs';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

const externalConfigPath = './config.json';

const rollupConfig = {
  entry: 'src/contentscript.js',
  format: 'cjs',
  sourceMap: true,
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  dest: 'app/contentscript.js'
};

let replaceOptions = {
  delimiters: ['__', '__'],
  exclude: 'node_modules/**',

  // values are direct replacement, so use two sets of quotes for strings
  ENV: `'${process.env.NODE_ENV}'`,
  VERSION: `'${JSON.parse(fs.readFileSync('./package.json')).version}'`,
  RAVEN_DSN: "''",
  CHROME_WEBSTORE_ID: "''"
};

if (process.env.NODE_ENV === 'production') {
  let externalConfig = {};
  try {
    externalConfig = JSON.parse(fs.readFileSync(externalConfigPath));
  } catch (e) {
    console.error('Unable to read config.json; can\'t build for production.\nSee the wiki on Github for more info.');
    process.exit(1);
  }
  replaceOptions = Object.assign({}, replaceOptions, externalConfig);
  rollupConfig.plugins.push(uglify());
}

rollupConfig.plugins.unshift(replace(replaceOptions));

export default rollupConfig;
