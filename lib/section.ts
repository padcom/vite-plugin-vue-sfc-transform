import ts from 'typescript'
import { HTMLElement } from 'node-html-parser'

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
   * Section attributes
   */
  attributes?: SectionAttributes
}

export interface ScriptSection extends Section {
  code: ts.SourceFile
}

export interface TemplateSection extends Section {
  code: HTMLElement
}

export interface TextOnlySection extends Section {
  /**
   * Content (code) of the section
   */
  code?: Code
}
