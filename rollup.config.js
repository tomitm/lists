import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/contentscript.js',
  format: 'cjs',
  plugins: [
    babel({
      presets: ['es2015-rollup']
    })
  ],
  dest: 'app/contentscript.js'
};
