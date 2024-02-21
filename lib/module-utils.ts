import { join } from 'node:path'

export function resolve(root: string, importedFrom: string, moduleName: string) {
  return join(root, importedFrom, moduleName)
}
