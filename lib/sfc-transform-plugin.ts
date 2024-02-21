/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-env node */
import { mkdirSync, writeFileSync } from 'node:fs'
import { relative, dirname, join } from 'node:path'
import { minimatch } from 'minimatch'
import { type Plugin, type ResolvedConfig } from 'vite'
import { SFCDescriptor, parse, parseCache } from '@vue/compiler-sfc'
import ts from 'typescript'

/**
 * Type alias to denote a block of code
 */
export type Code = string

/**
 * List of attributes of a section
 */
export type SectionAttributes = Record<string, string | true>

/**
 * Type descring section of the SFC
 */
export interface Section {
  /**
   * Tag name of the section
   */
  name: string
  /**
   * Content (code) of the section
   */
  code?: Code
  /**
   * Section attributes
   */
  attributes?: SectionAttributes
}

export interface ScriptSetupSection extends Section {
  parsed: ts.SourceFile
}

type CollectableSection = 'template' | 'script' | 'scriptSetup'

function collectSingleSection(type: CollectableSection, descriptor: SFCDescriptor, sections: Section[]) {
  if (descriptor[type]) {
    sections.push({
      name: type,
      code: descriptor[type]?.content,
      attributes: descriptor[type]?.attrs,
    })
  }
}

function collectStyleSections(descriptor: SFCDescriptor, sections: Section[]) {
  descriptor.styles.forEach(style => {
    sections.push({
      name: 'style',
      code: style.content,
      attributes: style.attrs,
    })
  })
}

function collectCustomSections(descriptor: SFCDescriptor, sections: Section[]) {
  descriptor.customBlocks.forEach(block => {
    sections.push({
      name: block.type,
      code: block.content,
      attributes: block.attrs,
    })
  })
}

/**
 * Type alias to denote a glob pattern
 */
export type GlobPattern = string

export function matches(filename: string, patterns: GlobPattern[]) {
  return patterns.some(pattern => minimatch(filename, pattern))
}

function sectionToString({ name, code, attributes }: Section) {
  if (!code || !attributes) return ''

  const attrs = Object.entries(attributes).map(([attr, value]) => value !== undefined ? `${attr}="${value}"` : attr)
  const attrsStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : ''
  const sectionName = name === 'scriptSetup' ? 'script' : name
  const result = `<${sectionName}${attrsStr}>${code}</${sectionName}>`

  return result
}

export type TransformerFn = (filename: string, blocks: Section[], root?: string) => Section[]

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
        parseCache.clear()
        const parsed = parse(code, { filename })
        parseCache.clear()

        if (parsed.errors.length === 0) {
          const sections: Section[] = []
          collectSingleSection('template', parsed.descriptor, sections)
          collectSingleSection('script', parsed.descriptor, sections)
          collectSingleSection('scriptSetup', parsed.descriptor, sections)
          collectStyleSections(parsed.descriptor, sections)
          collectCustomSections(parsed.descriptor, sections)
          const transformed = transformer(filename, sections, config.root)
          const result = transformed.map(section => sectionToString(section)).filter(x => x).join('\n\n')

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

/**
 * Find all sections of the given type
 */
export function findSectionOfType(type: string, sections: Section[]): Section | null {
  return sections.find(section => section.name === type) || null
}

/**
 * Find section of the given type
 */
export function findSectionsOfType(type: string, sections: Section[]): Section[] {
  return sections.filter(section => section.name === type)
}

/**
 * Create a setup script section
 */
export function createScriptSetupSection(code = ''): Section {
  return {
    name: 'scriptSetup',
    attributes: { setup: true },
    code,
  }
}
