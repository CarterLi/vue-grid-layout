var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { defineComponent, openBlock, createElementBlock, normalizeClass, normalizeStyle, renderSlot, createCommentVNode, resolveComponent, withDirectives, createVNode, vShow } from "vue";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import "@interactjs/dev-tools";
import interact from "@interactjs/interact";
import mitt from "mitt";
import ResizeObserver from "resize-observer-polyfill";
function bottom(layout) {
  let max = 0, bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max)
      max = bottomY;
  }
  return max;
}
function cloneLayout(layout) {
  const newLayout = Array(layout.length);
  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }
  return newLayout;
}
function cloneLayoutItem(layoutItem) {
  return JSON.parse(JSON.stringify(layoutItem));
}
function collides(l1, l2) {
  if (l1 === l2)
    return false;
  if (l1.x + l1.w <= l2.x)
    return false;
  if (l1.x >= l2.x + l2.w)
    return false;
  if (l1.y + l1.h <= l2.y)
    return false;
  if (l1.y >= l2.y + l2.h)
    return false;
  return true;
}
function compact(layout, verticalCompact) {
  const compareWith = getStatics(layout);
  const sorted = sortLayoutItemsByRowCol(layout);
  const out = Array(layout.length);
  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i];
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact);
      compareWith.push(l);
    }
    out[layout.indexOf(l)] = l;
    l.moved = false;
  }
  return out;
}
function compactItem(compareWith, l, verticalCompact) {
  if (verticalCompact) {
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }
  let collides2;
  while (collides2 = getFirstCollision(compareWith, l)) {
    l.y = collides2.y + collides2.h;
  }
  return l;
}
function correctBounds(layout, bounds) {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    if (l.x + l.w > bounds.cols)
      l.x = bounds.cols - l.w;
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static)
      collidesWith.push(l);
    else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}
function getLayoutItem(layout, id) {
  return layout.find((x) => x.i === id) || { x: 0, y: 0, w: 0, h: 0, i: "" };
}
function getFirstCollision(layout, layoutItem) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem))
      return layout[i];
  }
}
function getAllCollisions(layout, layoutItem) {
  return layout.filter((l) => collides(l, layoutItem));
}
function getStatics(layout) {
  return layout.filter((l) => l.static);
}
function moveElement(layout, l, x, y, isUserAction, preventCollision) {
  if (l.static)
    return layout;
  const oldX = l.x;
  const oldY = l.y;
  const movingUp = y && l.y > y;
  if (typeof x === "number")
    l.x = x;
  if (typeof y === "number")
    l.y = y;
  l.moved = true;
  let sorted = sortLayoutItemsByRowCol(layout);
  if (movingUp)
    sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);
  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    if (collision.moved)
      continue;
    if (l.y > collision.y && l.y - collision.y > collision.h / 4)
      continue;
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }
  return layout;
}
function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction) {
  const preventCollision = false;
  if (isUserAction) {
    const fakeItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, void 0, fakeItem.y, preventCollision);
    }
  }
  return moveElement(layout, itemToMove, void 0, itemToMove.y + 1, preventCollision);
}
function setTransform(top, left, width, height) {
  const translate = "translate3d(" + left + "px," + top + "px, 0)";
  return {
    transform: translate,
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}
function setTransformRtl(top, right, width, height) {
  const translate = "translate3d(" + right * -1 + "px," + top + "px, 0)";
  return {
    transform: translate,
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}
function setTopLeft(top, left, width, height) {
  return {
    top: top + "px",
    left: left + "px",
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}
function setTopRight(top, right, width, height) {
  return {
    top: top + "px",
    right: right + "px",
    width: width + "px",
    height: height + "px",
    position: "absolute"
  };
}
function sortLayoutItemsByRowCol(layout) {
  return [].concat(layout).sort(function(a, b) {
    if (a.y === b.y && a.x === b.x) {
      return 0;
    }
    if (a.y > b.y || a.y === b.y && a.x > b.x) {
      return 1;
    }
    return -1;
  });
}
function validateLayout(layout, contextName = "Layout") {
  const subProps = ["x", "y", "w", "h"];
  let keyArr = [];
  if (!Array.isArray(layout))
    throw new Error(contextName + " must be an array!");
  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];
    for (let j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j]] !== "number") {
        throw new Error("VueGridLayout: " + contextName + "[" + i + "]." + subProps[j] + " must be a number!");
      }
    }
    if (item.i === void 0 || item.i === null) {
      throw new Error("VueGridLayout: " + contextName + "[" + i + "].i cannot be null!");
    }
    if (typeof item.i !== "number" && typeof item.i !== "string") {
      throw new Error("VueGridLayout: " + contextName + "[" + i + "].i must be a string or number!");
    }
    if (keyArr.indexOf(item.i) >= 0) {
      throw new Error("VueGridLayout: " + contextName + "[" + i + "].i must be unique!");
    }
    keyArr.push(item.i);
    if (item.static !== void 0 && typeof item.static !== "boolean") {
      throw new Error("VueGridLayout: " + contextName + "[" + i + "].static must be a boolean!");
    }
  }
}
function getControlPosition(e) {
  return offsetXYFromParentOf(e);
}
function offsetXYFromParentOf(evt) {
  const offsetParent = evt.target.offsetParent || document.body;
  const offsetParentRect = offsetParent === document.body ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
  const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left;
  const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top;
  return { x, y };
}
function createCoreData(lastX, lastY, x, y) {
  const isStart = !isNum(lastX);
  if (isStart) {
    return {
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y
    };
  } else {
    return {
      deltaX: x - lastX,
      deltaY: y - lastY,
      lastX,
      lastY,
      x,
      y
    };
  }
}
function isNum(num) {
  return typeof num === "number" && !isNaN(num);
}
function getBreakpointFromWidth(breakpoints, width) {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];
  for (let i = 1, len = sorted.length; i < len; i++) {
    const breakpointName = sorted[i];
    if (width > breakpoints[breakpointName])
      matching = breakpointName;
  }
  return matching;
}
function getColsFromBreakpoint(breakpoint, cols) {
  if (!cols[breakpoint]) {
    throw new Error("ResponsiveGridLayout: `cols` entry for breakpoint " + breakpoint + " is missing!");
  }
  return cols[breakpoint];
}
function findOrGenerateResponsiveLayout(orgLayout, layouts, breakpoints, breakpoint, lastBreakpoint, cols, verticalCompact) {
  if (layouts[breakpoint])
    return cloneLayout(layouts[breakpoint]);
  let layout = orgLayout;
  const breakpointsSorted = sortBreakpoints(breakpoints);
  const breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint));
  for (let i = 0, len = breakpointsAbove.length; i < len; i++) {
    const b = breakpointsAbove[i];
    if (layouts[b]) {
      layout = layouts[b];
      break;
    }
  }
  layout = cloneLayout(layout || []);
  return compact(correctBounds(layout, { cols }), verticalCompact);
}
function sortBreakpoints(breakpoints) {
  const keys = Object.keys(breakpoints);
  return keys.sort(function(a, b) {
    return breakpoints[a] - breakpoints[b];
  });
}
let currentDir = "auto";
function getDocumentDir() {
  if (typeof document === "undefined") {
    return currentDir;
  }
  return document.documentElement.dir;
}
var GridItem_vue_vue_type_style_index_0_scoped_true_lang = "";
var _export_sfc = (sfc, props) => {
  for (const [key, val] of props) {
    sfc[key] = val;
  }
  return sfc;
};
const _sfc_main$1 = defineComponent({
  name: "GridItem",
  props: {
    isDraggable: {
      type: Boolean,
      required: false,
      default: null
    },
    isResizable: {
      type: Boolean,
      required: false,
      default: null
    },
    static: {
      type: Boolean,
      required: false,
      default: false
    },
    minH: {
      type: Number,
      required: false,
      default: 1
    },
    minW: {
      type: Number,
      required: false,
      default: 1
    },
    maxH: {
      type: Number,
      required: false,
      default: Infinity
    },
    maxW: {
      type: Number,
      required: false,
      default: Infinity
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    w: {
      type: Number,
      required: true
    },
    h: {
      type: Number,
      required: true
    },
    i: {
      required: true
    },
    dragIgnoreFrom: {
      type: String,
      required: false,
      default: "a, button"
    },
    dragAllowFrom: {
      type: String,
      required: false,
      default: null
    },
    resizeIgnoreFrom: {
      type: String,
      required: false,
      default: "a, button"
    },
    preserveAspectRatio: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  inject: ["eventBus", "layout"],
  data() {
    return {
      cols: 1,
      containerWidth: 100,
      rowHeight: 30,
      margin: [10, 10],
      maxRows: Infinity,
      draggable: null,
      resizable: null,
      useCssTransforms: true,
      useStyleCursor: true,
      isDragging: false,
      dragging: null,
      isResizing: false,
      resizing: null,
      lastX: NaN,
      lastY: NaN,
      lastW: NaN,
      lastH: NaN,
      style: {},
      rtl: false,
      dragEventSet: false,
      resizeEventSet: false,
      previousW: null,
      previousH: null,
      previousX: null,
      previousY: null,
      innerX: this.x,
      innerY: this.y,
      innerW: this.w,
      innerH: this.h
    };
  },
  emits: ["container-resized", "resize", "resized", "move", "moved"],
  created() {
    let self = this;
    self.updateWidthHandler = function(width) {
      self.updateWidth(width);
    };
    self.compactHandler = function(layout) {
      self.compact(layout);
    };
    self.setDraggableHandler = function(isDraggable) {
      if (self.isDraggable === null) {
        self.draggable = isDraggable;
      }
    };
    self.setResizableHandler = function(isResizable) {
      if (self.isResizable === null) {
        self.resizable = isResizable;
      }
    };
    self.setRowHeightHandler = function(rowHeight) {
      self.rowHeight = rowHeight;
    };
    self.setMaxRowsHandler = function(maxRows) {
      self.maxRows = maxRows;
    };
    self.directionchangeHandler = () => {
      this.rtl = getDocumentDir() === "rtl";
      this.compact();
    };
    self.setColNum = (colNum) => {
      self.cols = parseInt(colNum);
    };
    this.eventBus.on("updateWidth", self.updateWidthHandler);
    this.eventBus.on("compact", self.compactHandler);
    this.eventBus.on("setDraggable", self.setDraggableHandler);
    this.eventBus.on("setResizable", self.setResizableHandler);
    this.eventBus.on("setRowHeight", self.setRowHeightHandler);
    this.eventBus.on("setMaxRows", self.setMaxRowsHandler);
    this.eventBus.on("directionchange", self.directionchangeHandler);
    this.eventBus.on("setColNum", self.setColNum);
    this.rtl = getDocumentDir() === "rtl";
  },
  beforeUnmount() {
    let self = this;
    this.eventBus.off("updateWidth", self.updateWidthHandler);
    this.eventBus.off("compact", self.compactHandler);
    this.eventBus.off("setDraggable", self.setDraggableHandler);
    this.eventBus.off("setResizable", self.setResizableHandler);
    this.eventBus.off("setRowHeight", self.setRowHeightHandler);
    this.eventBus.off("setMaxRows", self.setMaxRowsHandler);
    this.eventBus.off("directionchange", self.directionchangeHandler);
    this.eventBus.off("setColNum", self.setColNum);
    if (this.interactObj) {
      this.interactObj.unset();
    }
  },
  mounted() {
    if (this.layout.responsive && this.layout.lastBreakpoint) {
      this.cols = getColsFromBreakpoint(this.layout.lastBreakpoint, this.layout.cols);
    } else {
      this.cols = this.layout.colNum;
    }
    this.rowHeight = this.layout.rowHeight;
    this.containerWidth = this.layout.width !== null ? this.layout.width : 100;
    this.margin = this.layout.margin !== void 0 ? this.layout.margin : [10, 10];
    this.maxRows = this.layout.maxRows;
    if (this.isDraggable === null) {
      this.draggable = this.layout.isDraggable;
    } else {
      this.draggable = this.isDraggable;
    }
    if (this.isResizable === null) {
      this.resizable = this.layout.isResizable;
    } else {
      this.resizable = this.isResizable;
    }
    this.useCssTransforms = this.layout.useCssTransforms;
    this.useStyleCursor = this.layout.useStyleCursor;
    this.createStyle();
  },
  watch: {
    isDraggable() {
      this.draggable = this.isDraggable;
    },
    static() {
      this.tryMakeDraggable();
      this.tryMakeResizable();
    },
    draggable() {
      this.tryMakeDraggable();
    },
    isResizable() {
      this.resizable = this.isResizable;
    },
    resizable() {
      this.tryMakeResizable();
    },
    rowHeight() {
      this.createStyle();
      this.emitContainerResized();
    },
    cols() {
      this.tryMakeResizable();
      this.createStyle();
      this.emitContainerResized();
    },
    containerWidth() {
      this.tryMakeResizable();
      this.createStyle();
      this.emitContainerResized();
    },
    x(newVal) {
      this.innerX = newVal;
      this.createStyle();
    },
    y(newVal) {
      this.innerY = newVal;
      this.createStyle();
    },
    h(newVal) {
      this.innerH = newVal;
      this.createStyle();
    },
    w(newVal) {
      this.innerW = newVal;
      this.createStyle();
    },
    renderRtl() {
      this.tryMakeResizable();
      this.createStyle();
    },
    minH() {
      this.tryMakeResizable();
    },
    maxH() {
      this.tryMakeResizable();
    },
    minW() {
      this.tryMakeResizable();
    },
    maxW() {
      this.tryMakeResizable();
    },
    "$parent.margin"(margin) {
      if (!margin || margin[0] == this.margin[0] && margin[1] == this.margin[1]) {
        return;
      }
      this.margin = margin.map((m) => Number(m));
      this.createStyle();
      this.emitContainerResized();
    }
  },
  computed: {
    classObj() {
      return {
        "vue-resizable": this.resizableAndNotStatic,
        "static": this.static,
        "resizing": this.isResizing,
        "vue-draggable-dragging": this.isDragging,
        "cssTransforms": this.useCssTransforms,
        "render-rtl": this.renderRtl,
        "disable-userselect": this.isDragging,
        "no-touch": this.isAndroid && this.draggableOrResizableAndNotStatic
      };
    },
    resizableAndNotStatic() {
      return this.resizable && !this.static;
    },
    draggableOrResizableAndNotStatic() {
      return (this.draggable || this.resizable) && !this.static;
    },
    isAndroid() {
      return navigator.userAgent.toLowerCase().indexOf("android") !== -1;
    },
    renderRtl() {
      return this.layout.isMirrored ? !this.rtl : this.rtl;
    },
    resizableHandleClass() {
      if (this.renderRtl) {
        return "vue-resizable-handle vue-rtl-resizable-handle";
      } else {
        return "vue-resizable-handle";
      }
    }
  },
  methods: {
    createStyle() {
      if (this.x + this.w > this.cols) {
        this.innerX = 0;
        this.innerW = this.w > this.cols ? this.cols : this.w;
      } else {
        this.innerX = this.x;
        this.innerW = this.w;
      }
      let pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
      if (this.isDragging) {
        pos.top = this.dragging.top;
        if (this.renderRtl) {
          pos.right = this.dragging.left;
        } else {
          pos.left = this.dragging.left;
        }
      }
      if (this.isResizing) {
        pos.width = this.resizing.width;
        pos.height = this.resizing.height;
      }
      let style;
      if (this.useCssTransforms) {
        if (this.renderRtl) {
          style = setTransformRtl(pos.top, pos.right, pos.width, pos.height);
        } else {
          style = setTransform(pos.top, pos.left, pos.width, pos.height);
        }
      } else {
        if (this.renderRtl) {
          style = setTopRight(pos.top, pos.right, pos.width, pos.height);
        } else {
          style = setTopLeft(pos.top, pos.left, pos.width, pos.height);
        }
      }
      this.style = style;
    },
    emitContainerResized() {
      let styleProps = {};
      for (let prop of ["width", "height"]) {
        let val = this.style[prop];
        let matches = val.match(/^(\d+)px$/);
        if (!matches)
          return;
        styleProps[prop] = matches[1];
      }
      this.$emit("container-resized", this.i, this.h, this.w, styleProps.height, styleProps.width);
    },
    handleResize(event) {
      if (this.static)
        return;
      const position = getControlPosition(event);
      if (position == null)
        return;
      const { x, y } = position;
      const newSize = { width: 0, height: 0 };
      let pos;
      switch (event.type) {
        case "resizestart": {
          this.previousW = this.innerW;
          this.previousH = this.innerH;
          pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
          newSize.width = pos.width;
          newSize.height = pos.height;
          this.resizing = newSize;
          this.isResizing = true;
          break;
        }
        case "resizemove": {
          const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
          if (this.renderRtl) {
            newSize.width = this.resizing.width - coreEvent.deltaX;
          } else {
            newSize.width = this.resizing.width + coreEvent.deltaX;
          }
          newSize.height = this.resizing.height + coreEvent.deltaY;
          this.resizing = newSize;
          break;
        }
        case "resizeend": {
          pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
          newSize.width = pos.width;
          newSize.height = pos.height;
          this.resizing = null;
          this.isResizing = false;
          break;
        }
      }
      pos = this.calcWH(newSize.height, newSize.width);
      if (pos.w < this.minW) {
        pos.w = this.minW;
      }
      if (pos.w > this.maxW) {
        pos.w = this.maxW;
      }
      if (pos.h < this.minH) {
        pos.h = this.minH;
      }
      if (pos.h > this.maxH) {
        pos.h = this.maxH;
      }
      if (pos.h < 1) {
        pos.h = 1;
      }
      if (pos.w < 1) {
        pos.w = 1;
      }
      this.lastW = x;
      this.lastH = y;
      if (this.innerW !== pos.w || this.innerH !== pos.h) {
        this.$emit("resize", this.i, pos.h, pos.w, newSize.height, newSize.width);
      }
      if (event.type === "resizeend" && (this.previousW !== this.innerW || this.previousH !== this.innerH)) {
        this.$emit("resized", this.i, pos.h, pos.w, newSize.height, newSize.width);
      }
      this.eventBus.emit("resizeEvent", { eventType: event.type, i: this.i, x: this.innerX, y: this.innerY, h: pos.h, w: pos.w });
    },
    handleDrag(event) {
      if (this.static)
        return;
      if (this.isResizing)
        return;
      const position = getControlPosition(event);
      if (position === null)
        return;
      const { x, y } = position;
      let newPosition = { top: 0, left: 0 };
      switch (event.type) {
        case "dragstart": {
          this.previousX = this.innerX;
          this.previousY = this.innerY;
          let parentRect = event.target.offsetParent.getBoundingClientRect();
          let clientRect = event.target.getBoundingClientRect();
          if (this.renderRtl) {
            newPosition.left = (clientRect.right - parentRect.right) * -1;
          } else {
            newPosition.left = clientRect.left - parentRect.left;
          }
          newPosition.top = clientRect.top - parentRect.top;
          this.dragging = newPosition;
          this.isDragging = true;
          break;
        }
        case "dragend": {
          if (!this.isDragging)
            return;
          let parentRect = event.target.offsetParent.getBoundingClientRect();
          let clientRect = event.target.getBoundingClientRect();
          if (this.renderRtl) {
            newPosition.left = (clientRect.right - parentRect.right) * -1;
          } else {
            newPosition.left = clientRect.left - parentRect.left;
          }
          newPosition.top = clientRect.top - parentRect.top;
          this.dragging = null;
          this.isDragging = false;
          break;
        }
        case "dragmove": {
          const coreEvent = createCoreData(this.lastX, this.lastY, x, y);
          if (this.renderRtl) {
            newPosition.left = this.dragging.left - coreEvent.deltaX;
          } else {
            newPosition.left = this.dragging.left + coreEvent.deltaX;
          }
          newPosition.top = this.dragging.top + coreEvent.deltaY;
          this.dragging = newPosition;
          break;
        }
      }
      let pos;
      if (this.renderRtl) {
        pos = this.calcXY(newPosition.top, newPosition.left);
      } else {
        pos = this.calcXY(newPosition.top, newPosition.left);
      }
      this.lastX = x;
      this.lastY = y;
      if (this.innerX !== pos.x || this.innerY !== pos.y) {
        this.$emit("move", this.i, pos.x, pos.y);
      }
      if (event.type === "dragend" && (this.previousX !== this.innerX || this.previousY !== this.innerY)) {
        this.$emit("moved", this.i, pos.x, pos.y);
      }
      this.eventBus.emit("dragEvent", { eventType: event.type, i: this.i, x: pos.x, y: pos.y, h: this.innerH, w: this.innerW });
    },
    calcPosition(x, y, w, h) {
      const colWidth = this.calcColWidth();
      let out;
      if (this.renderRtl) {
        out = {
          right: Math.round(colWidth * x + (x + 1) * this.margin[0]),
          top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
          width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
          height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
        };
      } else {
        out = {
          left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
          top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
          width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
          height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
        };
      }
      return out;
    },
    calcXY(top, left) {
      const colWidth = this.calcColWidth();
      let x = Math.round((left - this.margin[0]) / (colWidth + this.margin[0]));
      let y = Math.round((top - this.margin[1]) / (this.rowHeight + this.margin[1]));
      x = Math.max(Math.min(x, this.cols - this.innerW), 0);
      y = Math.max(Math.min(y, this.maxRows - this.innerH), 0);
      return { x, y };
    },
    calcColWidth() {
      const colWidth = (this.containerWidth - this.margin[0] * (this.cols + 1)) / this.cols;
      return colWidth;
    },
    calcWH(height, width, autoSizeFlag = false) {
      const colWidth = this.calcColWidth();
      let w = Math.round((width + this.margin[0]) / (colWidth + this.margin[0]));
      let h = 0;
      if (!autoSizeFlag) {
        h = Math.round((height + this.margin[1]) / (this.rowHeight + this.margin[1]));
      } else {
        h = Math.ceil((height + this.margin[1]) / (this.rowHeight + this.margin[1]));
      }
      w = Math.max(Math.min(w, this.cols - this.innerX), 0);
      h = Math.max(Math.min(h, this.maxRows - this.innerY), 0);
      return { w, h };
    },
    updateWidth(width, colNum) {
      this.containerWidth = width;
      if (colNum !== void 0 && colNum !== null) {
        this.cols = colNum;
      }
    },
    compact() {
      this.createStyle();
    },
    tryMakeDraggable() {
      const self = this;
      if (this.interactObj === null || this.interactObj === void 0) {
        this.interactObj = interact(this.$el);
        if (!this.useStyleCursor) {
          this.interactObj.styleCursor(false);
        }
      }
      if (this.draggable && !this.static) {
        const opts = {
          ignoreFrom: this.dragIgnoreFrom,
          allowFrom: this.dragAllowFrom
        };
        this.interactObj.draggable(opts);
        if (!this.dragEventSet) {
          this.dragEventSet = true;
          this.interactObj.on("dragstart dragmove dragend", function(event) {
            self.handleDrag(event);
          });
        }
      } else {
        this.interactObj.draggable({
          enabled: false
        });
      }
    },
    tryMakeResizable() {
      const self = this;
      if (this.interactObj === null || this.interactObj === void 0) {
        this.interactObj = interact(this.$el);
        if (!this.useStyleCursor) {
          this.interactObj.styleCursor(false);
        }
      }
      if (this.resizable && !this.static) {
        let maximum = this.calcPosition(0, 0, this.maxW, this.maxH);
        let minimum = this.calcPosition(0, 0, this.minW, this.minH);
        const opts = {
          edges: {
            left: false,
            right: "." + this.resizableHandleClass.trim().replace(" ", "."),
            bottom: "." + this.resizableHandleClass.trim().replace(" ", "."),
            top: false
          },
          ignoreFrom: this.resizeIgnoreFrom,
          restrictSize: {
            min: {
              height: minimum.height,
              width: minimum.width
            },
            max: {
              height: maximum.height,
              width: maximum.width
            }
          },
          modifiers: []
        };
        if (this.preserveAspectRatio) {
          opts.modifiers = [
            interact.modifiers.aspectRatio({
              ratio: "preserve"
            })
          ];
        }
        this.interactObj.resizable(opts);
        if (!this.resizeEventSet) {
          this.resizeEventSet = true;
          this.interactObj.on("resizestart resizemove resizeend", function(event) {
            self.handleResize(event);
          });
        }
      } else {
        this.interactObj.resizable({
          enabled: false
        });
      }
    },
    autoSize() {
      this.previousW = this.innerW;
      this.previousH = this.innerH;
      let newSize = this.$el.firstElementChild.getBoundingClientRect();
      let pos = this.calcWH(newSize.height, newSize.width, true);
      if (pos.w < this.minW) {
        pos.w = this.minW;
      }
      if (pos.w > this.maxW) {
        pos.w = this.maxW;
      }
      if (pos.h < this.minH) {
        pos.h = this.minH;
      }
      if (pos.h > this.maxH) {
        pos.h = this.maxH;
      }
      if (pos.h < 1) {
        pos.h = 1;
      }
      if (pos.w < 1) {
        pos.w = 1;
      }
      if (this.innerW !== pos.w || this.innerH !== pos.h) {
        this.$emit("resize", this.i, pos.h, pos.w, newSize.height, newSize.width);
      }
      if (this.previousW !== pos.w || this.previousH !== pos.h) {
        this.$emit("resized", this.i, pos.h, pos.w, newSize.height, newSize.width);
        this.eventBus.emit("resizeEvent", { eventType: "resizeend", i: this.i, x: this.innerX, y: this.innerY, h: pos.h, w: pos.w });
      }
    }
  }
});
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: normalizeClass(["vue-grid-item", _ctx.classObj]),
    style: normalizeStyle(_ctx.style)
  }, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true),
    _ctx.resizableAndNotStatic ? (openBlock(), createElementBlock("span", {
      key: 0,
      ref: "handle",
      class: normalizeClass(_ctx.resizableHandleClass)
    }, null, 2)) : createCommentVNode("", true)
  ], 6);
}
var GridItem = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-5f50ad7e"]]);
var GridLayout_vue_vue_type_style_index_0_scoped_true_lang = "";
const _sfc_main = defineComponent({
  name: "GridLayout",
  provide() {
    return {
      eventBus: this.eventBus,
      layout: this
    };
  },
  components: {
    GridItem
  },
  props: {
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
    breakpoints: {
      type: Object,
      default() {
        return { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
      }
    },
    cols: {
      type: Object,
      default() {
        return { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
      }
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
      width: null,
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
      layouts: {},
      lastBreakpoint: null,
      originalLayout: null
    };
  },
  emits: ["update:layout", "layout-created", "layout-before-mount", "layout-mounted", "layout-updated", "layout-ready", "breakpoint-changed"],
  created() {
    const self = this;
    self.resizeEventHandler = function({ eventType, i, x, y, h, w }) {
      self.resizeEvent(eventType, i, x, y, h, w);
    };
    self.dragEventHandler = function({ eventType, i, x, y, h, w }) {
      self.dragEvent(eventType, i, x, y, h, w);
    };
    self.eventBus.on("resizeEvent", self.resizeEventHandler);
    self.eventBus.on("dragEvent", self.dragEventHandler);
    self.$emit("layout-created", self.layout);
  },
  beforeUnmount() {
    this.eventBus.off("resizeEvent", this.resizeEventHandler);
    this.eventBus.off("dragEvent", this.dragEventHandler);
    if (this.ro)
      this.ro.unobserve(this.$el);
  },
  beforeMount() {
    this.$emit("layout-before-mount", this.layout);
  },
  mounted() {
    const self = this;
    this.$emit("layout-mounted", this.layout);
    this.$nextTick(function() {
      validateLayout(this.layout);
      this.originalLayout = this.layout;
      this.$nextTick(function() {
        self.onWindowResize();
        self.initResponsiveFeatures();
        compact(self.layout, self.verticalCompact);
        self.$emit("layout-updated", self.layout);
        self.updateHeight();
        self.$nextTick(function() {
          self.ro = new ResizeObserver(() => {
            self.onWindowResize();
          });
          self.ro.observe(this.$el);
        });
      });
    });
  },
  watch: {
    width(newval, oldval) {
      const self = this;
      this.$nextTick(function() {
        this.eventBus.emit("updateWidth", this.width);
        if (oldval === null) {
          this.$nextTick(() => {
            this.$emit("layout-ready", self.layout);
          });
        }
        this.updateHeight();
      });
    },
    layout() {
      this.layoutUpdate();
    },
    "layout.length"() {
      this.layoutUpdate();
    },
    colNum(val) {
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
        this.$emit("update:layout", this.originalLayout);
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
      if (this.layout !== void 0 && this.originalLayout !== null) {
        if (this.layout.length !== this.originalLayout.length) {
          let diff = this.findDifference(this.layout, this.originalLayout);
          if (diff.length > 0) {
            if (this.layout.length > this.originalLayout.length) {
              this.originalLayout = this.originalLayout.concat(diff);
            } else {
              this.originalLayout = this.originalLayout.filter((obj) => {
                return !diff.some((obj2) => {
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
        this.$emit("layout-updated", this.layout);
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
      if (!this.autoSize)
        return;
      const containerHeight = bottom(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + "px";
      return containerHeight;
    },
    dragEvent(eventName, id, x, y, h, w) {
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
        this.eventBus.emit("updateWidth", this.width);
      } else {
        this.$nextTick(function() {
          this.isDragging = false;
        });
      }
      this.$emit("update:layout", moveElement(this.layout, l, x, y, true, this.preventCollision));
      compact(this.layout, this.verticalCompact);
      this.eventBus.emit("compact");
      this.updateHeight();
      if (eventName === "dragend")
        this.$emit("layout-updated", this.layout);
    },
    resizeEvent(eventName, id, x, y, h, w) {
      let l = getLayoutItem(this.layout, id);
      let hasCollisions;
      if (this.preventCollision) {
        const collisions = getAllCollisions(this.layout, __spreadProps(__spreadValues({}, l), { w, h })).filter((layoutItem) => layoutItem.i !== l.i);
        hasCollisions = collisions.length > 0;
        if (hasCollisions) {
          let leastX = Infinity, leastY = Infinity;
          collisions.forEach((layoutItem) => {
            if (layoutItem.x > l.x)
              leastX = Math.min(leastX, layoutItem.x);
            if (layoutItem.y > l.y)
              leastY = Math.min(leastY, layoutItem.y);
          });
          if (Number.isFinite(leastX))
            l.w = leastX - l.x;
          if (Number.isFinite(leastY))
            l.h = leastY - l.y;
        }
      }
      if (!hasCollisions) {
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
        this.eventBus.emit("updateWidth", this.width);
      } else {
        this.$nextTick(function() {
          this.isDragging = false;
        });
      }
      if (this.responsive)
        this.responsiveGridLayout();
      compact(this.layout, this.verticalCompact);
      this.eventBus.emit("compact");
      this.updateHeight();
      if (eventName === "resizeend")
        this.$emit("layout-updated", this.layout);
    },
    responsiveGridLayout() {
      let newBreakpoint = getBreakpointFromWidth(this.breakpoints, this.width);
      let newCols = getColsFromBreakpoint(newBreakpoint, this.cols);
      if (this.lastBreakpoint != null && !this.layouts[this.lastBreakpoint])
        this.layouts[this.lastBreakpoint] = cloneLayout(this.layout);
      let layout = findOrGenerateResponsiveLayout(this.originalLayout, this.layouts, this.breakpoints, newBreakpoint, this.lastBreakpoint, newCols, this.verticalCompact);
      this.layouts[newBreakpoint] = layout;
      if (this.lastBreakpoint !== newBreakpoint) {
        this.$emit("breakpoint-changed", newBreakpoint, layout);
      }
      this.$emit("update:layout", layout);
      this.lastBreakpoint = newBreakpoint;
      this.eventBus.emit("setColNum", getColsFromBreakpoint(newBreakpoint, this.cols));
    },
    initResponsiveFeatures() {
      this.layouts = Object.assign({}, this.responsiveLayouts);
    },
    findDifference(layout, originalLayout) {
      let uniqueResultOne = layout.filter(function(obj) {
        return !originalLayout.some(function(obj2) {
          return obj.i === obj2.i;
        });
      });
      let uniqueResultTwo = originalLayout.filter(function(obj) {
        return !layout.some(function(obj2) {
          return obj.i === obj2.i;
        });
      });
      return uniqueResultOne.concat(uniqueResultTwo);
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_grid_item = resolveComponent("grid-item");
  return openBlock(), createElementBlock("div", {
    class: "vue-grid-layout",
    style: normalizeStyle(_ctx.mergedStyle)
  }, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true),
    withDirectives(createVNode(_component_grid_item, {
      class: "vue-grid-placeholder",
      x: _ctx.placeholder.x,
      y: _ctx.placeholder.y,
      w: _ctx.placeholder.w,
      h: _ctx.placeholder.h,
      i: _ctx.placeholder.i
    }, null, 8, ["x", "y", "w", "h", "i"]), [
      [vShow, _ctx.isDragging]
    ])
  ], 4);
}
var GridLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7d3b3fd8"]]);
const install = (app) => {
  app.component("grid-layout", GridLayout);
  app.component("grid-item", GridItem);
};
export { GridItem, GridLayout, install as default };
