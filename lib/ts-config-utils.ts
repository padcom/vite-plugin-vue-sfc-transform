import { getTsconfig, createPathsMatcher, type TsConfigResult as TsConfig } from 'get-tsconfig'

export { type TsConfig }

export function read(searchPath?: string, configName?: string): TsConfig | null {
  return getTsconfig(searchPath, configName)
}

export type PathMatcher = ((specifier: string) => string[]) | null

export function match(config: TsConfig, moduleName: string) {
  const matcher = createPathsMatcher(config)

  if (matcher) return matcher(moduleName)
  else return []
}
