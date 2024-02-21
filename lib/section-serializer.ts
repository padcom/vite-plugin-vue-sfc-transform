import type { Section, SectionAttributes, TemplateSection, ScriptSection, TextOnlySection } from './section'

import * as tsUtils from './ts-utils'

export function sectionAttributesToString(attributes: SectionAttributes) {
  const attrs = Object.entries(attributes).map(([attr, value]) => value !== undefined ? `${attr}="${value}"` : attr)
  return attrs.length > 0 ? ` ${attrs.join(' ')}` : ''
}

export function serializeTemplateSection({ attributes, code }: TemplateSection) {
  if (!code || !attributes) return ''

  const attrs = sectionAttributesToString(attributes)

  return `<template${attrs}>${code.outerHTML}</template>`
}

export function serializeScriptSection({ attributes, code }: ScriptSection) {
  if (!code || !attributes) return ''

  const attrs = sectionAttributesToString(attributes)
  const text = tsUtils.stringify(code)

  return `<script${attrs}>${text}</script>`
}

export function serializeTextOnlySection({ name, attributes, code }: TextOnlySection) {
  if (!code || !attributes) return ''

  const attrs = sectionAttributesToString(attributes)

  return `<${name}${attrs}>${code}</${name}>`
}

type SectionSerializer = (section: Section) => string

export function serializeSection(section: Section) {
  const SERIALIZERS: Record<string, SectionSerializer> = {
    template: serializeTemplateSection as SectionSerializer,
    script: serializeScriptSection as SectionSerializer,
    scriptSetup: serializeScriptSection as SectionSerializer,
    default: serializeTextOnlySection,
  }

  const serializer = SERIALIZERS[section.name] || SERIALIZERS.default

  return serializer(section)
}

