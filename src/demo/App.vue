<template>
    <div id="app">
        <h1 style="text-align: center">Vue Grid Layout</h1>
        <!--<pre>{{ layout | json }}</pre>-->
        <div>
            <div class="layoutJSON">
                Displayed as <code>[x, y, w, h]</code>:
                <div class="columns">
                    <div class="layoutItem" v-for="item in layout" :key="item.i">
                        <b>{{item.i}}</b>: [{{item.x}}, {{item.y}}, {{item.w}}, {{item.h}}]
                    </div>
                </div>
            </div>
            <!--<div class="layoutJSON">
                Displayed as <code>[x, y, w, h]</code>:
                <div class="columns">
                    <div class="layoutItem" v-for="item in layout2">
                        <b>{{item.i}}</b>: [{{item.x}}, {{item.y}}, {{item.w}}, {{item.h}}]
                    </div>
                </div>
            </div>-->
        </div>
        <div id="content">
            <button @click="decreaseWidth">Decrease Width</button>
            <button @click="increaseWidth">Increase Width</button>
            <button @click="addItem">Add an item</button>
            <button @click="addItemDynamically">Add an item dynamically</button>
            <!-- Add to show rtl support -->
            <button @click="changeDirection">Change Direction</button>
            <input type="checkbox" v-model="draggable"/> Draggable
            <input type="checkbox" v-model="resizable"/> Resizable
            <input type="checkbox" v-model="mirrored"/> Mirrored
            <input type="checkbox" v-model="responsive"/> Responsive
            <input type="checkbox" v-model="preventCollision"/> Prevent Collision
            <div style="margin-top: 10px;margin-bottom: 10px;">
                Row Height: <input type="number" v-model="rowHeight"/> Col nums: <input type="number" v-model="colNum"/>
                Margin x: <input type="number" v-model="marginX"/> Margin y: <input type="number" v-model="marginY"/>
            </div>
            <grid-layout
                :margin="[marginX, marginY]"
                v-model:layout="layout"
                :responsive-layouts="layouts"
                :col-num="colNum"
                :row-height="rowHeight"
                :is-draggable="draggable"
                :is-resizable="resizable"
                :is-mirrored="mirrored"
                :prevent-collision="preventCollision"
                :vertical-compact="compact"
                :use-css-transforms="true"
                :responsive="responsive"
                @layout-created="layoutCreatedEvent"
                @layout-before-mount="layoutBeforeMountEvent"
                @layout-mounted="layoutMountedEvent"
                @layout-ready="layoutReadyEvent"
                @layout-updated="layoutUpdatedEvent"
                @breakpoint-changed="breakpointChangedEvent"
            >
                <grid-item v-for="item in layout"
                           :key="item.i"
                           :static="item.static"
                           :x="item.x"
                           :y="item.y"
                           :w="item.w"
                           :h="item.h"
                           :i="item.i"
                           :min-w="item.minW"
                           :max-w="item.maxW"
                           :min-x="item.minX"
                           :max-x="item.maxX"
                           :min-y="item.minY"
                           :max-y="item.maxY"
                           :preserve-aspect-ratio="item.preserveAspectRatio"
                           @resize="resize"
                           @move="move"
                           @resized="resized"
                           @container-resized="containerResized"
                           @moved="moved"
                >
                    <test-element :text="item.i" @removeItem="removeItem($event)"></test-element>
                </grid-item>
            </grid-layout>
            <hr/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import GridItem from '../components/GridItem.vue';
import GridLayout from '../components/GridLayout.vue';
import TestElement from './TestElement.vue';
import {getDocumentDir, setDocumentDir} from "../helpers/DOM";

var testLayouts = {
    md: [
        {"x":0, "y":0, "w":2, "h":2, "i":"0"},
        {"x":2, "y":0, "w":2, "h":4, "i":"1"},
        {"x":4, "y":0, "w":2, "h":5, "i":"2"},
        {"x":6, "y":0, "w":2, "h":3, "i":"3"},
        {"x":2, "y":4, "w":2, "h":3, "i":"4"},
        {"x":4, "y":5, "w":2, "h":3, "i":"5"},
        {"x":0, "y":2, "w":2, "h":5, "i":"6"},
        {"x":2, "y":7, "w":2, "h":5, "i":"7"},
        {"x":4, "y":8, "w":2, "h":5, "i":"8"},
        {"x":6, "y":3, "w":2, "h":4, "i":"9"},
        {"x":0, "y":7, "w":2, "h":4, "i":"10"},
        {"x":2, "y":19, "w":2, "h":4, "i":"11"},
        {"x":0, "y":14, "w":2, "h":5, "i":"12"},
        {"x":2, "y":14, "w":2, "h":5, "i":"13"},
        {"x":4, "y":13, "w":2, "h":4, "i":"14"},
        {"x":6, "y":7, "w":2, "h":4, "i":"15"},
        {"x":0, "y":19, "w":2, "h":5, "i":"16"},
        {"x":8, "y":0, "w":2, "h":2, "i":"17"},
        {"x":0, "y":11, "w":2, "h":3, "i":"18"},
        {"x":2, "y":12, "w":2, "h":2, "i":"19"}
    ] as Record<string, any>[],
    lg: [
        {"x":0,"y":0,"w":2,"h":2,"i":"0"},
        {"x":2,"y":0,"w":2,"h":4,"i":"1"},
        {"x":4,"y":0,"w":2,"h":5,"i":"2"},
        {"x":6,"y":0,"w":2,"h":3,"i":"3"},
        {"x":8,"y":0,"w":2,"h":3,"i":"4"},
        {"x":10,"y":0,"w":2,"h":3,"i":"5"},
        {"x":0,"y":5,"w":2,"h":5,"i":"6"},
        {"x":2,"y":5,"w":2,"h":5,"i":"7"},
        {"x":4,"y":5,"w":2,"h":5,"i":"8"},
        {"x":6,"y":4,"w":2,"h":4,"i":"9"},
        {"x":8,"y":4,"w":2,"h":4,"i":"10"},
        {"x":10,"y":4,"w":2,"h":4,"i":"11"},
        {"x":0,"y":10,"w":2,"h":5,"i":"12"},
        {"x":2,"y":10,"w":2,"h":5,"i":"13"},
        {"x":4,"y":8,"w":2,"h":4,"i":"14"},
        {"x":6,"y":8,"w":2,"h":4,"i":"15"},
        {"x":8,"y":10,"w":2,"h":5,"i":"16"},
        {"x":10,"y":4,"w":2,"h":2,"i":"17"},
        {"x":0,"y":9,"w":2,"h":3,"i":"18"},
        {"x":2,"y":6,"w":2,"h":2,"i":"19"}
    ] as Record<string, any>[],
};

/*let testLayout = [
    {"x":0,"y":0,"w":2,"h":2,"i":"0", resizable: true, draggable: true, static: false, minY: 0, maxY: 2},
    {"x":2,"y":0,"w":2,"h":4,"i":"1", resizable: null, draggable: null, static: true},
    {"x":4,"y":0,"w":2,"h":5,"i":"2", resizable: false, draggable: false, static: false, minX: 4, maxX: 4, minW: 2, maxW: 2, preserveAspectRatio: true},
    {"x":6,"y":0,"w":2,"h":3,"i":"3", resizable: false, draggable: false, static: false},
    {"x":8,"y":0,"w":2,"h":3,"i":"4", resizable: false, draggable: false, static: false},
    {"x":10,"y":0,"w":2,"h":3,"i":"5", resizable: false, draggable: false, static: false},
    {"x":0,"y":5,"w":2,"h":5,"i":"6", resizable: false, draggable: false, static: false},
    {"x":2,"y":5,"w":2,"h":5,"i":"7", resizable: false, draggable: false, static: false},
    {"x":4,"y":5,"w":2,"h":5,"i":"8", resizable: false, draggable: false, static: false},
    {"x":6,"y":3,"w":2,"h":4,"i":"9", resizable: false, draggable: false, static: true},
    {"x":8,"y":4,"w":2,"h":4,"i":"10", resizable: false, draggable: false, static: false},
    {"x":10,"y":4,"w":2,"h":4,"i":"11", resizable: false, draggable: false, static: false, minY: 4},
    {"x":0,"y":10,"w":2,"h":5,"i":"12", resizable: false, draggable: false, static: false},
    {"x":2,"y":10,"w":2,"h":5,"i":"13", resizable: false, draggable: false, static: false},
    {"x":4,"y":8,"w":2,"h":4,"i":"14", resizable: false, draggable: false, static: false},
    {"x":6,"y":8,"w":2,"h":4,"i":"15", resizable: false, draggable: false, static: false},
    {"x":8,"y":10,"w":2,"h":5,"i":"16", resizable: false, draggable: false, static: false},
    {"x":10,"y":4,"w":2,"h":2,"i":"17", resizable: false, draggable: false, static: false},
    {"x":0,"y":9,"w":2,"h":3,"i":"18", resizable: false, draggable: false, static: false},
    {"x":2,"y":6,"w":2,"h":2,"i":"19", resizable: false, draggable: false, static: false}
];*/

export default defineComponent({
    name: 'app',
    components: {
        GridLayout,
        GridItem,
        TestElement,
    },
    data () {
        return {
            // layout: JSON.parse(JSON.stringify(testLayout)),
            // layout2: JSON.parse(JSON.stringify(testLayout)),
            layouts: testLayouts,
            layout: testLayouts["lg"],
            draggable: true,
            resizable: true,
            mirrored: false,
            responsive: true,
            preventCollision: false,
            compact: true,
            rowHeight: 30,
            colNum: 12,
            index: 0,
            marginX: 10,
            marginY: 10,
        }
    },
    mounted() {
        this.index = this.layout.length;
    },
    methods: {
        clicked() {
            window.alert("CLICK!");
        },
        increaseWidth() {
            let width = document.getElementById("content").offsetWidth;
            width += 20;
            document.getElementById("content").style.width = width+"px";
        },
        decreaseWidth() {
            let width = document.getElementById("content").offsetWidth;
            width -= 20;
            document.getElementById("content").style.width = width+"px";
        },
        removeItem(i) {
            console.log("### REMOVE " + i);
            const index = this.layout.map(item => item.i).indexOf(i);
            this.layout.splice(index, 1);
        },
        addItem() {
            // let self = this;
            //console.log("### LENGTH: " + this.layout.length);
            let item = {"x":0,"y":0,"w":2,"h":2,"i":this.index+"", whatever: "bbb"};
            this.index++;
            this.layout.push(item);
        },
        addItemDynamically() {
            const x = (this.layout.length * 2) % (this.colNum || 12);
            const y = this.layout.length + (this.colNum || 12);
            console.log("X=" + x + " Y=" + y)
            let item = {
                x: x,
                y: y,
                w: 2,
                h: 2,
                i: this.index+"",
            }
            this.index++;
            this.layout.push(item);
        },
        move(i, newX, newY){
            console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
        },
        resize(i, newH, newW, newHPx, newWPx){
            console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
        },
        moved(i, newX, newY){
            console.log("### MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
        },
        resized(i, newH, newW, newHPx, newWPx){
            console.log("### RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
        },
        containerResized(i, newH, newW, newHPx, newWPx){
            console.log("### CONTAINER RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
        },
        /**
         * Add change direction button
         */
        changeDirection() {
            let documentDirection = getDocumentDir();
            setDocumentDir(documentDirection === "rtl" ? "ltr" : "rtl");
            //eventBus.$emit('directionchange');
        },

        layoutCreatedEvent(newLayout){
            console.log("Created layout: ", newLayout)
        },
        layoutBeforeMountEvent(newLayout){
            console.log("beforeMount layout: ", newLayout)
        },
        layoutMountedEvent(newLayout){
            console.log("Mounted layout: ", newLayout)
        },
        layoutReadyEvent(newLayout){
            console.log("Ready layout: ", newLayout)
            this.layout = newLayout
        },
        layoutUpdatedEvent(newLayout){
            console.log("Updated layout: ", newLayout)
            this.layout = newLayout
        },
        breakpointChangedEvent(newBreakpoint, newLayout){
            console.log("breakpoint changed breakpoint=", newBreakpoint, ", layout: ", newLayout );
        }

    },
});
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
