import { defineConfig } from 'tsdown'

const id = '@yuuu0109/dsh-cache-hit-decimal'
// Platform seed words only. `@deepseek-ai/dsh-client-ui-primitives` used to be
// listed here for the Tooltip import; the line now carries its hover text on a
// native `title`, so the bundle needs nothing beyond React.
const clientExternals = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
]

export default defineConfig([
  {
    name: id,
    entry: {
      index: 'lib/types/index.js',
    },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
  {
    name: `${id}/client`,
    entry: {
      client: 'lib/types/client/index.js',
    },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    sourcemap: true,
    dts: false,
    clean: false,
    deps: {
      neverBundle: clientExternals,
      alwaysBundle: (source) => !clientExternals.includes(source),
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
