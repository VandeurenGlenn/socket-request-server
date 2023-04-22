import typescript from '@rollup/plugin-typescript';
import tsconfig from './tsconfig.json' assert { type: 'json'};

try {
  rimraf('rm ./dist/*.js')
} catch (e) {
  console.log('nothing to clean');
};

export default  [{
  input: ['src/server.ts', 'src/response.ts/', 'src/connection.ts'],
  output: [{
    dir: './exports',
    format: 'es'
  }],
  plugins: [
    typescript()
  ]
}]
