import { existsSync } from 'node:fs'
import { relative, dirname, extname } from 'node:path'
import { parse as parseSFC, parseCache } from '@vue/compiler-sfc'

import { type TsConfig } from './ts-config-utils'
import * as tsConfigUtils from './ts-config-utils'
import * as moduleUtils from './module-utils'
import { extractImports } from './ts-import-extractor'
import { ScriptSection } from './section'

export function parse(filename: string, code: string) {
  parseCache.clear()
  const parsed = parseSFC(code, { filename })
  parseCache.clear()

  return parsed
}

export type ComponentName = string
export type ComponentLocation = string

/**
 * Extract map of imported Vue.js components with their paths.
 * Works only with <script setup>
 *
 * @param setupScript `<script setup>` section
 * @param tsConfig Typescript configuration (can be optained from `utils.tsConfig.read`)
 * @param projectRoot root of the project
 * @param importedFromModule `projectRoot`-relative path to module that imports those components
 * @returns {Record<ComponentName, ComponentLocation>} associative table containings imported components as keys
 * and their location as values
 */
// eslint-disable-next-line max-lines-per-function
export function collectImportedComponentsFromScriptSetup(
  setupScript: ScriptSection,
  tsConfig: TsConfig,
  projectRoot: string,
  importedFromModule: string,
) {
  if (setupScript.name !== 'scriptSetup') {
    throw new Error('Component extraction is possible only from setup script')
  }

  function resolveRelativeModuleName(moduleName: string) {
    if (moduleName.startsWith('.')) {
      return moduleUtils.resolve('', relative(projectRoot, dirname(importedFromModule)), moduleName)
    } else {
      return moduleName
    }
  }

  function resolveAliasModuleName(moduleName: string) {
    const match = tsConfigUtils.match(tsConfig, moduleName).find(m => existsSync(m))

    if (match) return relative(projectRoot, match)
    else return moduleName
  }

  const imports = extractImports(setupScript.code)
    .filter(i => !i.isTypeOnly && extname(i.module.toLowerCase()) === '.vue')

  const result = imports.reduce((acc, element) => ({
    ...acc,
    [element.name]: resolveRelativeModuleName(resolveAliasModuleName(element.module)),
  }), {} as Record<ComponentName, ComponentLocation>)

  return result
}
