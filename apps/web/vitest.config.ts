import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Unit tests for pure logic in apps/web (cart merge, assistant tool helpers,
// order-change window). Node environment — these modules import db/resend but
// only touch them inside functions, so importing for the pure helpers is safe.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
