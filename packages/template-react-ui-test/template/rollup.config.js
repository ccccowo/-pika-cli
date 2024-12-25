import { defineConfig } from 'rollup'
// 用于处理.ts/.tsx文件、解析ts类型配置文件
import typescript from '@rollup/plugin-typescript'
// 用于处理css文件
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
    }
  ],
  plugins: [
    typescript(),
    postcss(),
    commonjs(),
    babel(),
  ],
})
