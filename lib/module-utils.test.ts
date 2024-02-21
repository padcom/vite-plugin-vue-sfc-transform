import { describe, it, expect } from 'vitest'

import { resolve } from './module-utils'

describe('Module resolver', () => {
  it('will resolve relative module path', () => {
    const root = './projects/example'
    const importedFrom = './src'
    const moduleName = './App.vue'
    const resolved = 'projects/example/src/App.vue'

    const actual = resolve(root, importedFrom, moduleName)

    expect(actual).toBe(resolved)
  })
})
