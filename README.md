<p align="center"><a href="https://jbaysolutions.github.io/vue-grid-layout/" target="_blank" rel="noopener noreferrer"><img width="100" src="https://jbaysolutions.github.io/vue-grid-layout/assets/img/logo.png" alt="Vue Grid Layout"></a></p>

<h1 align="center">vue-grid-layout</h1>

<p align="center">
<a href="https://www.npmjs.com/package/vue-grid-layout">
    <img src="https://img.shields.io/npm/v/vue-grid-layout.svg"/>
    <img src="https://img.shields.io/npm/dm/vue-grid-layout.svg"/>
</a>
<a href="https://github.com/jbaysolutions/vue-grid-layout/releases">
    <img src="https://img.shields.io/github/size/jbaysolutions/vue-grid-layout/dist/vue-grid-layout.umd.min.js"/>
</a>
<!--a href="https://vuejs.org/">
    <img src="https://img.shields.io/badge/vue-2.2.x-brightgreen.svg"/>
</a-->
</p>
<h2 align="center">
<a href="https://jbaysolutions.github.io/vue-grid-layout/" target="_blank">Documentation Website</a>
</h2>

---

## What is Vue Grid Layout?

vue-grid-layout is a grid layout system, like [Gridster](http://dsmorse.github.io/gridster.js/), for Vue.js. **Heavily inspired by [React-Grid-Layout](https://github.com/STRML/react-grid-layout)**

## Features

* Draggable widgets
* Resizable widgets
* Static widgets
* Bounds checking for dragging and resizing
* Widgets may be added or removed without rebuilding grid
* Layout can be serialized and restored
* Automatic RTL support (resizing not working with RTL on 2.2.0)
* Responsive

## **Current version:** 3.0.0-beta1 (Supports Vue 3.x)



## Modification notice

Code modified by [Carter Li](https://github.com/carterli), from the official [vue3-webpack branch](https://github.com/jbaysolutions/vue-grid-layout/tree/vue3-webpack)

Changes:

1. Migrated to TypeScript, and [found a bug when migrating](https://github.com/jbaysolutions/vue-grid-layout/issues/632)
1. Lots of code refacters, dead / commented code removals, ES6+ syntax migration.
1. Use `resize-observer-polyfill` instead of `element-resize-detector` for better performance
1. General dependencies upgrades, also removed some unused dependencies.

## Usage

```html
<template>
<grid-layout
  v-model:layout="layout"
  ...
/>
</template>
<script>
import { GridLayout, GridItem } from 'vue-grid-layout-eoi';

export default {
    components: { GridLayout, GridItem },
    data() {
        return {
            layout: {
                ...
            },
        };
    },
}
</script>
```

See also the official demo: https://github.com/CarterLi/vue-grid-layout/blob/master/src/demo/App.vue#L39
