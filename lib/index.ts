import { plugin } from './sfc-transform-plugin'
import * as tsUtils from './ts-utils'
import * as tsConfigUtils from './ts-config-utils'
import * as tsExtractor from './ts-import-extractor'
import * as sectionUtils from './section-utils'
import * as pathUtils from './path-utils'
import * as moduleUtils from './module-utils'
import * as vueUtils from './vue-utils'

export * from './section'
export type { TsConfig } from './ts-config-utils'
export { HTMLElement } from './html-utils'

export const utils = {
  ts: { ...tsUtils, ...tsExtractor },
  tsConfig: { ...tsConfigUtils },
  section: { ...sectionUtils },
  path: { ...pathUtils },
  module: { ...moduleUtils },
  vue: { ...vueUtils },
}

export * from './sfc-transform-plugin'

/**
 * Exporting the plugin as default export for easier and cleaner use
 */
export default plugin
