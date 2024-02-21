import * as tsUtils from './ts-utils'
import { SFCDescriptor } from '@vue/compiler-sfc'
import { parse as parseHTML } from 'node-html-parser'

import type { Section, TemplateSection, ScriptSection, TextOnlySection } from './section'

export function collectTemplateSection(descriptor: SFCDescriptor, sections: Section[]) {
  if (descriptor.template) {
    sections.push({
      name: 'template',
      code: parseHTML(descriptor.template.content, { comment: true, voidTag: { tags: [] } }),
      attributes: descriptor.template?.attrs,
    } as TemplateSection)
  }
}

export function collectScriptSection(filename: string, descriptor: SFCDescriptor, sections: Section[]) {
  if (descriptor.script) {
    sections.push({
      name: 'script',
      code: tsUtils.parse(filename, descriptor.script.content),
      attributes: descriptor.script.attrs,
    } as ScriptSection)
  }
}

export function collectScriptSetupSection(filename: string, descriptor: SFCDescriptor, sections: Section[]) {
  if (descriptor.scriptSetup) {
    sections.push({
      name: 'scriptSetup',
      code: tsUtils.parse(filename, descriptor.scriptSetup.content),
      attributes: descriptor.scriptSetup.attrs,
    } as ScriptSection)
  }
}

export function collectStyleSections(descriptor: SFCDescriptor, sections: Section[]) {
  descriptor.styles.forEach(style => {
    sections.push({
      name: 'style',
      code: style.content,
      attributes: style.attrs,
    } as TextOnlySection)
  })
}

export function collectCustomSections(descriptor: SFCDescriptor, sections: Section[]) {
  descriptor.customBlocks.forEach(block => {
    sections.push({
      name: block.type,
      code: block.content,
      attributes: block.attrs,
    } as TextOnlySection)
  })
}
