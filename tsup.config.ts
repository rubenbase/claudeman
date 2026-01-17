import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  outDir: 'dist',
  external: ['vscode'],
  clean: true,
  sourcemap: true,
  minify: false,
});
