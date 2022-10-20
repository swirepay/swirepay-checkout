import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
 
import fs from 'fs';

// eslint-disable-next-line no-undef
let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

let plugins = [
  postcss({
    modules: {
      getJSON: function(cssFileName, json) {
        // eslint-disable-next-line no-undef
        var path          = require('path');
        var cssName       = path.basename(cssFileName, '.css');
        var jsonFileName  = path.resolve('./lib/' + cssName + '.js');
        fs.writeFileSync(jsonFileName, `export default ${JSON.stringify(json)}`);
      }
    },    
    plugins: [],
  }),
  babel(babelrc()),
  terser(),
];

export default {
  entry: 'lib/index.js',
  plugins: plugins,
  external: external,
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'checkout',
      sourceMap: true
    },
    {
      dest: pkg.module,
      format: 'es',
      sourceMap: true
    },
  ],
};
