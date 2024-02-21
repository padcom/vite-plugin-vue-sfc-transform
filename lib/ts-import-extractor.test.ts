/* eslint-disable max-lines-per-function */
import { describe, it, expect } from 'vitest'
import ts from 'typescript'

import {
  type Import,
  ImportType,
  extractImports,
  hasDefaultImportFromModule,
  hasDefaultTypeImportFromModule,
  hasNamedImportFromModule,
  hasNamedTypeImportFromModule,
} from './ts-import-extractor'

function parse(code: string) {
  return ts.createSourceFile('example.ts', code, { languageVersion: ts.ScriptTarget.Latest })
}

function process(code: string) {
  return extractImports(parse(code))
}

function check(code: string, expected: Import | Import[]) {
  const imports = process(code)

  if (Array.isArray(expected)) {
    expect(imports.length).toBe(expected.length)

    for (const value of expected) {
      expect(imports.at(0)).toStrictEqual(value)
    }
  } else {
    expect(imports.at(0)).toStrictEqual(expected)
  }
}

describe('Typescript import extraction utility', () => {
  it('will extract default import', () => {
    check(`import Test from './some-module'`, {
      type: ImportType.DEFAULT,
      isTypeOnly: false,
      name: 'Test',
      module: './some-module',
    })
  })

  it('will extract named import', () => {
    check(`import { test } from './some-module'`, {
      type: ImportType.NAMED,
      isTypeOnly: false,
      name: 'test',
      module: './some-module',
    })
  })

  it('will extract default type import', () => {
    check(`import type Test from './some-module'`, {
      type: ImportType.DEFAULT,
      isTypeOnly: true,
      name: 'Test',
      module: './some-module',
    })
  })

  it('will extract named type import', () => {
    const code = `
      import type { test } from './some-module'
      import { type test } from './some-module'
    `
    const expected = {
      type: ImportType.NAMED,
      isTypeOnly: true,
      name: 'test',
      module: './some-module',
    }

    check(code, [expected, expected])
  })

  it('will extract renamed named import', () => {
    check(`import { test as test1 } from './some-module'`, {
      type: ImportType.NAMED,
      isTypeOnly: false,
      name: 'test1',
      module: './some-module',
    })
  })

  it('will extract renamed type named import', () => {
    check(`import { type test as test1 } from './some-module'`, {
      type: ImportType.NAMED,
      isTypeOnly: true,
      name: 'test1',
      module: './some-module',
    })
  })

  it('will recognize the requested default import is included', () => {
    const code = `import Test from './some-module'`
    const actual = hasDefaultImportFromModule(parse(code), 'Test', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested default import is not included', () => {
    const code = `import Test1 from './some-module'`
    const actual = hasDefaultImportFromModule(parse(code), 'Test', './some-module')

    expect(actual).toBe(false)
  })

  it('will recognize the requested default type import is included', () => {
    const code = `import type Test from './some-module'`
    const actual = hasDefaultTypeImportFromModule(parse(code), 'Test', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested default type import is not included', () => {
    const code = `import type Test1 from './some-module'`
    const actual = hasDefaultTypeImportFromModule(parse(code), 'Test', './some-module')

    expect(actual).toBe(false)
  })

  it('will recognize the requested named import is included', () => {
    const code = `import { test } from './some-module'`
    const actual = hasNamedImportFromModule(parse(code), 'test', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested named import is not included', () => {
    const code = `import { test } from './some-module'`
    const actual = hasNamedImportFromModule(parse(code), 'test1', './some-module')

    expect(actual).toBe(false)
  })

  it('will recognize the requested renamed import is included', () => {
    const code = `import { test as test1 } from './some-module'`
    const actual = hasNamedImportFromModule(parse(code), 'test1', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested renamed import is not included', () => {
    const code = `import { test as test1 } from './some-module'`
    const actual = hasNamedImportFromModule(parse(code), 'test', './some-module')

    expect(actual).toBe(false)
  })

  it('will recognize the requested named type import is included', () => {
    const code = `import { type test } from './some-module'`
    const actual = hasNamedTypeImportFromModule(parse(code), 'test', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested named type import is not included', () => {
    const code = `import { type test } from './some-module'`
    const actual = hasNamedTypeImportFromModule(parse(code), 'test1', './some-module')

    expect(actual).toBe(false)
  })

  it('will recognize the requested renamed type import is included', () => {
    const code = `import { type test as test1 } from './some-module'`
    const actual = hasNamedTypeImportFromModule(parse(code), 'test1', './some-module')

    expect(actual).toBe(true)
  })

  it('will recognize the requested renamed type import is not included', () => {
    const code = `import { type test as test1 } from './some-module'`
    const actual = hasNamedTypeImportFromModule(parse(code), 'test', './some-module')

    expect(actual).toBe(false)
  })
})
