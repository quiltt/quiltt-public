/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    server: {
      deps: {
        inline: ['react-native', '@quiltt/react-native'],
      },
    },
  },
  plugins: [tsconfigPaths()],
})
