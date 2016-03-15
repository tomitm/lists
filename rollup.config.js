import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
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
    json(),
    babel({
      presets: ['es2015-rollup']
    })
  ],
  dest: 'app/contentscript.js'
};
