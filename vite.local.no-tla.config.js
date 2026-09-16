import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  root: 'sources/',
  envDir: '../',
  publicDir: '../static/',
  base: './',
  server: { host: true, open: false },
  build: { outDir: '../dist-no-tla', emptyOutDir: true, sourcemap: false, target: 'esnext' },
  plugins: [wasm(), nodePolyfills()]
})
