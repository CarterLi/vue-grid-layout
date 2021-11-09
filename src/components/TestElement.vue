<template>
    <div>
        <span class="text">
            {{text}}
        </span>
        <span class="remove" @click="$emit('removeItem', text)">x</span>
    </div>
</template>
<style scoped>
.remove {
    position: absolute;
    right: 2px;
    top: 0;
    cursor: pointer;
}
</style>
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
    name: "TestElement",
    props: {
        text : {
            type: String,
            default: "x",
        },
    },
    mounted() {
        console.log("### " + this.text + " ready!");
    },
});
</script>
