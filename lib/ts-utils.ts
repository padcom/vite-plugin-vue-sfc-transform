import ts from 'typescript'

export function parse(filename: string, code: string) {
  return ts.createSourceFile(filename, code, { languageVersion: ts.ScriptTarget.Latest })
}

export function stringify(code: ts.SourceFile) {
  const printer = ts.createPrinter()
  return printer.printFile(code)
}
