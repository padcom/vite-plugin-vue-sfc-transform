import ts from 'typescript'

export enum ImportType {
  DEFAULT,
  NAMED,
}

export interface Import {
  type: ImportType
  isTypeOnly: boolean
  name: string
  module: string
}

function getNodesOfKind<T extends ts.Node>(source: ts.Node, kind: ts.SyntaxKind): T[] {
  const result: T[] = []

  source.forEachChild(node => {
    if (node.kind === kind) result.push(node as T)
  })

  return result
}

function extractDefaultImport(importClause: ts.ImportClause, moduleName: string, result: Import[]) {
  // ImportType.DEFAULT
  if (importClause.name) {
    result.push({
      type: ImportType.DEFAULT,
      isTypeOnly: importClause.isTypeOnly,
      name: importClause.name.text,
      module: moduleName,
    })
  }
}

// eslint-disable-next-line complexity
function extractNamedImports(importClause: ts.ImportClause, moduleName: string, result: Import[]) {
  if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
    for (const namedImport of importClause.namedBindings.elements) {
      result.push({
        type: ImportType.NAMED,
        isTypeOnly: importClause.isTypeOnly || namedImport.isTypeOnly,
        name: namedImport.name.text,
        module: moduleName,
      })
    }
  }
}

/**
 * Extracts imports from a parsed source file
 *
 * @param source source file to query
 * @returns list of extracted imports
 */
// eslint-disable-next-line complexity
export function extractImports(source: ts.SourceFile) {
  const result: Import[] = []
  const imports = getNodesOfKind<ts.ImportDeclaration>(source, ts.SyntaxKind.ImportDeclaration)

  for (const node of imports) {
    /* c8 ignore next */
    if (!node.importClause) continue
    /* c8 ignore next */
    if (!(node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))) continue

    const moduleName = node.moduleSpecifier.text

    extractDefaultImport(node.importClause, moduleName, result)
    extractNamedImports(node.importClause, moduleName, result)
  }

  return result
}

/**
 * Detects if the given default import from module in the parsed source file exists or not
 *
 * @param source source file to query
 * @param name name of the import to query
 * @param module name of the module to query
 * @returns `true` if the module is imported in the given source file, `false` otherwise
 */
export function hasDefaultImportFromModule(source: ts.SourceFile, name: string, module: string) {
  const imports = extractImports(source)

  return imports.some(i => i.type === ImportType.DEFAULT && i.name === name && i.module === module)
}

/**
 * Detects if the given default type import from module in the parsed source file exists or not
 *
 * @param source source file to query
 * @param name name of the import to query
 * @param module name of the module to query
 * @returns `true` if the module is imported in the given source file, `false` otherwise
 */
export function hasDefaultTypeImportFromModule(source: ts.SourceFile, name: string, module: string) {
  const imports = extractImports(source)

  return imports.some(i => i.type === ImportType.DEFAULT && i.isTypeOnly && i.name === name && i.module === module)
}

/**
 * Detects if the given named import from module in the parsed source file exists or not
 *
 * @param source source file to query
 * @param name name of the import to query
 * @param module name of the module to query
 * @returns `true` if the module is imported in the given source file, `false` otherwise
 */
export function hasNamedImportFromModule(source: ts.SourceFile, name: string, module: string) {
  const imports = extractImports(source)

  return imports.some(i => i.type === ImportType.NAMED && !i.isTypeOnly && i.name === name && i.module === module)
}

/**
 * Detects if the given named type import from module in the parsed source file exists or not
 *
 * @param source source file to query
 * @param name name of the import to query
 * @param module name of the module to query
 * @returns `true` if the module is imported in the given source file, `false` otherwise
 */
export function hasNamedTypeImportFromModule(source: ts.SourceFile, name: string, module: string) {
  const imports = extractImports(source)

  return imports.some(i => i.type === ImportType.NAMED && i.isTypeOnly && i.name === name && i.module === module)
}
