<template>
    <div class="vue-grid-layout" :style="mergedStyle">
        <slot></slot>
        <grid-item class="vue-grid-placeholder"
                   v-show="isDragging"
                   :x="placeholder.x"
                   :y="placeholder.y"
                   :w="placeholder.w"
                   :h="placeholder.h"
                   :i="placeholder.i"></grid-item>
    </div>
</template>
<style scoped>
.vue-grid-layout {
    position: relative;
    transition: height 200ms ease;
}
</style>
<script lang="ts">
import mitt from 'mitt';
import ResizeObserver from "resize-observer-polyfill";
import { defineComponent } from '@vue/runtime-core';

import {bottom, compact, getLayoutItem, moveElement, validateLayout, cloneLayout, getAllCollisions} from '@/helpers/utils';
import {getBreakpointFromWidth, getColsFromBreakpoint, findOrGenerateResponsiveLayout} from "@/helpers/responsiveUtils";
import type {Layout} from '@/helpers/utils';

import GridItem from './GridItem.vue'

export default defineComponent({
    name: "GridLayout",
    provide() {
        return {
            eventBus: this.eventBus,
            layout: this
        }
    },
    components: {
        GridItem,
    },
    props: {
        // If true, the container height swells and contracts to fit contents
        autoSize: {
            type: Boolean,
            default: true
        },
        colNum: {
            type: Number,
            default: 12
        },
        rowHeight: {
            type: Number,
            default: 150
        },
        maxRows: {
            type: Number,
            default: Infinity
        },
        margin: {
            type: Array,
            default() {
                return [10, 10];
            }
        },
        isDraggable: {
            type: Boolean,
            default: true
        },
        isResizable: {
            type: Boolean,
            default: true
        },
        isMirrored: {
            type: Boolean,
            default: false
        },
        useCssTransforms: {
            type: Boolean,
            default: true
        },
        verticalCompact: {
            type: Boolean,
            default: true
        },
        layout: {
            type: Array,
            required: true
        },
        responsive: {
            type: Boolean,
            default: false
        },
        responsiveLayouts: {
            type: Object,
            default() {
                return {};
            }
        },
        breakpoints:{
            type: Object,
            default(){
                return{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
            }
        },
        cols:{
            type: Object,
            default(){
                return{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
            },
        },
        preventCollision: {
            type: Boolean,
            default: false
        },
        useStyleCursor: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            eventBus: mitt(),
            width: null as number,
            mergedStyle: {},
            lastLayoutLength: 0,
            isDragging: false,
            placeholder: {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                i: -1
            },
            layouts: {}, // array to store all layouts from different breakpoints
            lastBreakpoint: null, // store last active breakpoint
            originalLayout: null, // store original Layout
            // layout: JSON.parse(JSON.stringify(this.value)),
        };
    },
    emits: ['update:layout','layout-created','layout-before-mount','layout-mounted','layout-updated','layout-ready','breakpoint-changed'],
    created () {
        const self = this;

        // Accessible refernces of functions for removing in beforeUnmount
        self.resizeEventHandler = function({eventType, i, x, y, h, w}) {
            self.resizeEvent(eventType, i, x, y, h, w);
        };

        self.dragEventHandler = function({eventType, i, x, y, h, w}) {
            self.dragEvent(eventType, i, x, y, h, w);
        };

        self.eventBus.on('resizeEvent', self.resizeEventHandler);
        self.eventBus.on('dragEvent', self.dragEventHandler);
        self.$emit('layout-created', self.layout);
    },
    beforeUnmount() {
        //Remove listeners
        this.eventBus.off('resizeEvent', this.resizeEventHandler);
        this.eventBus.off('dragEvent', this.dragEventHandler);
        if (this.ro) this.ro.unobserve(this.$el);
    },
    beforeMount() {
        this.$emit('layout-before-mount', this.layout);
    },
    mounted() {
        const self = this;
        this.$emit('layout-mounted', this.layout);
        this.$nextTick(function () {
            validateLayout(this.layout);

            this.originalLayout = this.layout;
            this.$nextTick(function() {
                self.onWindowResize();

                self.initResponsiveFeatures();

                //self.width = self.$el.offsetWidth;

                compact(self.layout, self.verticalCompact);

                self.$emit('layout-updated',self.layout)

                self.updateHeight();
                self.$nextTick(function () {
                    self.ro = new ResizeObserver(() => {
                        self.onWindowResize();
                    });
                    self.ro.observe(this.$el);
                });
            });
        });
    },
    watch: {
        width(newval: number, oldval: number) {
            const self = this;
            this.$nextTick(function () {
                //this.$broadcast("updateWidth", this.width);
                this.eventBus.emit("updateWidth", this.width);
                if (oldval === null) {
                    /*
                        If oldval == null is when the width has never been
                        set before. That only occurs when mouting is
                        finished, and onWindowResize has been called and
                        this.width has been changed the first time after it
                        got set to null in the constructor. It is now time
                        to issue layout-ready events as the GridItems have
                        their sizes configured properly.

                        The reason for emitting the layout-ready events on
                        the next tick is to allow for the newly-emitted
                        updateWidth event (above) to have reached the
                        children GridItem-s and had their effect, so we're
                        sure that they have the final size before we emit
                        layout-ready (for this GridLayout) and
                        item-layout-ready (for the GridItem-s).

                        This way any client event handlers can reliably
                        invistigate stable sizes of GridItem-s.
                    */
                    this.$nextTick(() => {
                        this.$emit('layout-ready', self.layout);
                    });
                }
                this.updateHeight();
            });
        },
        layout() {
            this.layoutUpdate();
        },
        'layout.length'() {
            this.layoutUpdate();
        },
        colNum(val: number) {
            this.eventBus.emit("setColNum", val);
        },
        rowHeight() {
            this.eventBus.emit("setRowHeight", this.rowHeight);
        },
        isDraggable() {
            this.eventBus.emit("setDraggable", this.isDraggable);
        },
        isResizable() {
            this.eventBus.emit("setResizable", this.isResizable);
        },
        responsive() {
            if (!this.responsive) {
                this.$emit('update:layout', this.originalLayout);
                this.eventBus.emit("setColNum", this.colNum);
            }
            this.onWindowResize();
        },
        maxRows() {
            this.eventBus.emit("setMaxRows", this.maxRows);
        },
        margin() {
            this.updateHeight();
        }
    },
    methods: {
        layoutUpdate() {
            if (this.layout !== undefined && this.originalLayout !== null) {
                if (this.layout.length !== this.originalLayout.length) {
                    // console.log("### LAYOUT UPDATE!", this.layout.length, this.originalLayout.length);

                    let diff = this.findDifference(this.layout, this.originalLayout);
                    if (diff.length > 0){
                        // console.log(diff);
                        if (this.layout.length > this.originalLayout.length) {
                            this.originalLayout = this.originalLayout.concat(diff);
                        } else {
                            this.originalLayout = this.originalLayout.filter(obj => {
                                return !diff.some(obj2 => {
                                    return obj.i === obj2.i;
                                });
                            });
                        }
                    }

                    this.lastLayoutLength = this.layout.length;
                    this.initResponsiveFeatures();
                }

                compact(this.layout, this.verticalCompact);
                this.eventBus.emit("updateWidth", this.width);
                this.updateHeight();

                this.$emit('layout-updated',this.layout)
            }
        },
        updateHeight() {
            this.mergedStyle = {
                height: this.containerHeight()
            };
        },
        onWindowResize() {
            if (this.$el) {
                this.width = this.$el.offsetWidth;
            }
            this.eventBus.emit("resizeEvent", {});
        },
        containerHeight() {
            if (!this.autoSize) return;
            // console.log("bottom: " + bottom(this.layout))
            // console.log("rowHeight + margins: " + (this.rowHeight + this.margin[1]) + this.margin[1])
            const containerHeight =  bottom(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + 'px';
            return containerHeight;
        },
        dragEvent(eventName: string, id: string, x: number, y: number, h: number, w: number) {
            //console.log(eventName + " id=" + id + ", x=" + x + ", y=" + y);
            let l = getLayoutItem(this.layout, id);

            if (eventName === "dragmove" || eventName === "dragstart") {
                this.placeholder.i = id;
                this.placeholder.x = l.x;
                this.placeholder.y = l.y;
                this.placeholder.w = w;
                this.placeholder.h = h;
                this.$nextTick(function() {
                    this.isDragging = true;
                });
                //this.$broadcast("updateWidth", this.width);
                this.eventBus.emit("updateWidth", this.width);
            } else {
                this.$nextTick(function() {
                    this.isDragging = false;
                });
            }

            // Move the element to the dragged location.
            this.$emit("update:layout", moveElement(this.layout, l, x, y, true, this.preventCollision));
            compact(this.layout, this.verticalCompact);
            // needed because vue can't detect changes on array element properties
            this.eventBus.emit("compact");
            this.updateHeight();
            if (eventName === 'dragend') this.$emit('layout-updated', this.layout);
        },
        resizeEvent(eventName: string, id: string, x: number, y: number, h: number, w: number) {
            let l = getLayoutItem(this.layout, id);

            let hasCollisions: boolean;
            if (this.preventCollision) {
                const collisions = getAllCollisions(this.layout, { ...l, w, h }).filter(
                    layoutItem => layoutItem.i !== l.i
                );
                hasCollisions = collisions.length > 0;

                // If we're colliding, we need adjust the placeholder.
                if (hasCollisions) {
                    // adjust w && h to maximum allowed space
                    let leastX = Infinity,
                    leastY = Infinity;
                    collisions.forEach(layoutItem => {
                        if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
                        if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
                    });

                    if (Number.isFinite(leastX)) l.w = leastX - l.x;
                    if (Number.isFinite(leastY)) l.h = leastY - l.y;
                }
            }

            if (!hasCollisions) {
                // Set new width and height.
                l.w = w;
                l.h = h;
            }

            if (eventName === "resizestart" || eventName === "resizemove") {
                this.placeholder.i = id;
                this.placeholder.x = x;
                this.placeholder.y = y;
                this.placeholder.w = l.w;
                this.placeholder.h = l.h;
                this.$nextTick(function() {
                    this.isDragging = true;
                });
                //this.$broadcast("updateWidth", this.width);
                this.eventBus.emit("updateWidth", this.width);

            } else {
                this.$nextTick(function() {
                    this.isDragging = false;
                });
            }

            if (this.responsive) this.responsiveGridLayout();

            compact(this.layout, this.verticalCompact);
            this.eventBus.emit("compact");
            this.updateHeight();

            if (eventName === 'resizeend') this.$emit('layout-updated', this.layout);
        },

        // finds or generates new layouts for set breakpoints
        responsiveGridLayout() {
            let newBreakpoint = getBreakpointFromWidth(this.breakpoints, this.width);
            let newCols = getColsFromBreakpoint(newBreakpoint, this.cols);

            // save actual layout in layouts
            if(this.lastBreakpoint != null && !this.layouts[this.lastBreakpoint])
                this.layouts[this.lastBreakpoint] = cloneLayout(this.layout);

            // Find or generate a new layout.
            let layout = findOrGenerateResponsiveLayout(
                this.originalLayout,
                this.layouts,
                this.breakpoints,
                newBreakpoint,
                this.lastBreakpoint,
                newCols,
                this.verticalCompact
            );

            // Store the new layout.
            this.layouts[newBreakpoint] = layout;

            if (this.lastBreakpoint !== newBreakpoint) {
                this.$emit('breakpoint-changed', newBreakpoint, layout);
            }

            // new prop sync
            this.$emit('update:layout', layout);

            this.lastBreakpoint = newBreakpoint;
            this.eventBus.emit("setColNum", getColsFromBreakpoint(newBreakpoint, this.cols));
        },

        // clear all responsive layouts
        initResponsiveFeatures() {
            // clear layouts
            this.layouts = Object.assign({}, this.responsiveLayouts);
        },

        // find difference in layouts
        findDifference(layout: Layout, originalLayout: Layout) {

            //Find values that are in result1 but not in result2
            let uniqueResultOne = layout.filter(function(obj) {
                return !originalLayout.some(function(obj2) {
                    return obj.i === obj2.i;
                });
            });

            //Find values that are in result2 but not in result1
            let uniqueResultTwo = originalLayout.filter(function(obj) {
                return !layout.some(function(obj2) {
                    return obj.i === obj2.i;
                });
            });

            //Combine the two arrays of unique entries#
            return uniqueResultOne.concat(uniqueResultTwo);
        }
    },
});
</script>
