# Vite plugin for Vue.js SFC source manipulations

There are cases where to implement something in your code you would have to go through every single file in your project and do something to it. Some of those modifications are trivial and will stay there forever. Some are different and will change over time.

For those cases in other platforms, like Java or .NET, there is a concept of aspect-oriented programming (AOP). The idea behind it is that during compilation you get to transform the original source to either add, remove or change some of it to implement some cross-cutting concern in your system.

The best example here is the case of feature flags.

Imagine you would like to put a `v-if="featureFlags.test('<feature-id-here>')` in every single component. If you polute your codebase with those `v-if`s you will loose clarity and readability. Some components might already have some conditional rendering and extending the expression will only make it worse.

This is where AOP comes into play.

It allows you to post-process your file, fish out those places that need to be augmented, do the augmentation and continue on with the regular compilation process as if those were the original source - just with an added concern.

## Installation

To make use of this plugin you need to first install it:

```
npm install --save-dev @padcom/vite-plugin-vue-sfc-transform
```

## Usage

Once the plugin is installed you need to use it in your config file:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import transform, { type Section } from '@padcom/vite-plugin-vue-sfc-transform'

function transformer(filename: string, sections: Section[]): Section[] {
  // do something to any of those sections
  // you can also add/remove sections or completely redefine the sections

  return sections
}

export default defineConfig({
  plugins: [
    transform({
      transformer: transformer,
    }),
    vue(),
  ],
})
```

## API

The API for this plugin is very simple and delegates most of the hard work to you. I know, it could do more, but the number of different ways you can transform sources is so vast that I won't get in your way.

### Vite plugin options

You can specify the following plugin options:

### `transformer`

This is a function that transforms sections of the component. It is given the `filename` (relative to project root), so that you know what you are transforming. This allows you to make different changes depending on which file you are transforming.

If not specified a noop will be used meaning no transformations take place.

### `includes`

This is a list of files/glob patterns that will be included in the transformation. By default all `.vue` files in the `src` folder will be used (`['src/**/*.vue']`)

For a file to be processed it must be included and not excluded at the same time.

### `excludes`

This is a list of files/glob patterns that will be excluded from the processing. By default all files in the `node_modules` are excluded (`['node_modules/**/*']`)

### `debug`

This enables dumping the modified files to a folder for inspection. This isn't strictly necessary but if you find yourself wondering what the heck is going on it is a nice to have option. It is disabled by default.

### `debugPath`

This is the root path where modified sources will be dumped for inspection. By default the path is constructed from `{root}/dist` and name of the `transformer` function (`./dist/${transformer.name}`)
