import { minimatch } from 'minimatch'

/**
 * Type alias to denote a glob pattern
 */
export type GlobPattern = string

export function matches(filename: string, patterns: GlobPattern[]) {
  return patterns.some(pattern => minimatch(filename, pattern))
}
