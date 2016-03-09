import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

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
    babel({
      presets: ['es2015-rollup']
    })
  ],
  dest: 'app/contentscript.js'
};
