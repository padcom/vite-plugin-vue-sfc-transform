import type { Section, ScriptSection } from './section'

import * as tsUtils from './ts-utils'

/**
 * Create a setup script section
 */
export function createScriptSetupSection(filename: string, code: string): ScriptSection {
  return {
    name: 'scriptSetup',
    attributes: { setup: true },
    code: tsUtils.parse(filename, code),
  } as ScriptSection
}

/**
 * Append code to script section
 *
 * @param section section to append code to
 * @param code code to append
 */
export function appendCodeToScriptSection(section: ScriptSection, code: string) {
  section.code = tsUtils.parse(section.code.fileName, tsUtils.stringify(section.code) + code)
}

/**
 * Find all sections of the given type
 */
export function findSectionOfType<T extends Section>(type: string, sections: Section[]): T | null {
  return sections.find(section => section.name === type) as T || null
}

/**
 * Find section of the given type
 */
export function findSectionsOfType<T extends Section>(type: string, sections: Section[]): T[] {
  return sections.filter(section => section.name === type) as T[]
}
