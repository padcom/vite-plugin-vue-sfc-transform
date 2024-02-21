/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-env node */
import { mkdirSync, writeFileSync } from 'node:fs'
import { relative, dirname, join } from 'node:path'
import { type Plugin, type ResolvedConfig } from 'vite'
import { parse } from './vue-utils'
import { matches, type GlobPattern } from './path-utils'
import { type Section } from './section'
import {
  collectTemplateSection,
  collectScriptSection,
  collectScriptSetupSection,
  collectCustomSections,
  collectStyleSections,
} from './section-parser'
import {
  serializeSection,
} from './section-serializer'

export type TransformerFn = (filename: string, blocks: Section[], root: string) => Section[]

/**
 * SFC Transform plugin options
 */
export interface SfcTransformPluginOptions {
  /**
   * Transform function
   */
  transformer?: TransformerFn
  /**
   * List of glob patterns to find files for transformation
   */
  includes?: GlobPattern[],
  /**
   * List of glob patterns to find files that should be excluded from transformation
   */
  excludes?: GlobPattern[],
  /**
   * Enable debug output. This will write all processed files to the `debugPath` folder.
   * Debug is automatically disabled if `debugPath` is falsy
   */
  debug?: boolean
  /**
   * Path to write processed files to. Default's to `./dist`
   */
  debugPath?: string
}

const noop: TransformerFn = (filename: string, section: Section[]) => section

export function plugin({
  transformer = noop,
  includes = ['src/**/*.vue'],
  excludes = ['node_modules/**/*'],
  debug = false,
  debugPath = `./dist/${transformer.name}`,
}: SfcTransformPluginOptions = {}): Plugin {
  let config: ResolvedConfig | null = null

  return {
    name: 'sfc-tranform',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig
    },
    transform(code, id) {
      if (!config) return code

      const filename = relative(config.root, id)

      if (matches(filename, includes) && !matches(filename, excludes)) {
        const parsed = parse(filename, code)

        if (parsed.errors.length === 0) {
          const sections = [] as Section[]
          collectTemplateSection(parsed.descriptor, sections)
          collectScriptSection(filename, parsed.descriptor, sections)
          collectScriptSetupSection(filename, parsed.descriptor, sections)
          collectStyleSections(parsed.descriptor, sections)
          collectCustomSections(parsed.descriptor, sections)
          const transformed = transformer(filename, sections, config.root)
          const result = transformed.map(section => serializeSection(section)).filter(x => x).join('\n\n')

          // eslint-disable-next-line max-depth
          if (debug && debugPath) {
            const debugFilename = join(config.root, debugPath, filename)
            mkdirSync(dirname(debugFilename), { recursive: true })
            writeFileSync(debugFilename, result)
          }

          return result
        } else {
          return code
        }
      } else {
        return code
      }
    },
  }
}
