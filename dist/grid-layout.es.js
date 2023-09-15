import { defineComponent as k, openBlock as y, createElementBlock as b, normalizeClass as x, normalizeStyle as S, renderSlot as $, createCommentVNode as Y, resolveComponent as _, withDirectives as j, createVNode as I, vShow as A } from "vue";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import "@interactjs/dev-tools";
import p from "@interactjs/interact";
import q from "mitt";
import F from "resize-observer-polyfill";
function T(t) {
  let e = 0, i;
  for (let s = 0, r = t.length; s < r; s++)
    i = t[s].y + t[s].h, i > e && (e = i);
  return e;
}
function w(t) {
  const e = Array(t.length);
  for (let i = 0, s = t.length; i < s; i++)
    e[i] = P(t[i]);
  return e;
}
function P(t) {
  return JSON.parse(JSON.stringify(t));
}
function M(t, e) {
  return !(t === e || t.x + t.w <= e.x || t.x >= e.x + e.w || t.y + t.h <= e.y || t.y >= e.y + e.h);
}
function f(t, e) {
  const i = E(t), s = L(t), r = Array(t.length);
  for (let n = 0, a = s.length; n < a; n++) {
    let h = s[n];
    h.static || (h = G(i, h, e), i.push(h)), r[t.indexOf(h)] = h, h.moved = !1;
  }
  return r;
}
function G(t, e, i) {
  if (i)
    for (; e.y > 0 && !m(t, e); )
      e.y--;
  let s;
  for (; s = m(t, e); )
    e.y = s.y + s.h;
  return e;
}
function V(t, e) {
  const i = E(t);
  for (let s = 0, r = t.length; s < r; s++) {
    const n = t[s];
    if (n.x + n.w > e.cols && (n.x = e.cols - n.w), n.x < 0 && (n.x = 0, n.w = e.cols), !n.static)
      i.push(n);
    else
      for (; m(i, n); )
        n.y++;
  }
  return t;
}
function R(t, e) {
  return t.find((i) => i.i === e) || { x: 0, y: 0, w: 0, h: 0, i: "" };
}
function m(t, e) {
  for (let i = 0, s = t.length; i < s; i++)
    if (M(t[i], e))
      return t[i];
}
function D(t, e) {
  return t.filter((i) => M(i, e));
}
function E(t) {
  return t.filter((e) => e.static);
}
function v(t, e, i, s, r, n) {
  if (e.static)
    return t;
  const a = e.x, h = e.y, d = s && e.y > s;
  typeof i == "number" && (e.x = i), typeof s == "number" && (e.y = s), e.moved = !0;
  let o = L(t);
  d && (o = o.reverse());
  const l = D(o, e);
  if (n && l.length)
    return e.x = a, e.y = h, e.moved = !1, t;
  for (let u = 0, g = l.length; u < g; u++) {
    const c = l[u];
    c.moved || e.y > c.y && e.y - c.y > c.h / 4 || (c.static ? t = H(t, c, e, r) : t = H(t, e, c, r));
  }
  return t;
}
function H(t, e, i, s) {
  if (s) {
    const n = {
      x: i.x,
      y: i.y,
      w: i.w,
      h: i.h,
      i: "-1"
    };
    if (n.y = Math.max(e.y - i.h, 0), !m(t, n))
      return v(t, i, void 0, n.y, !1);
  }
  return v(t, i, void 0, i.y + 1, !1);
}
function U(t, e, i, s) {
  return {
    transform: "translate3d(" + e + "px," + t + "px, 0)",
    width: i + "px",
    height: s + "px",
    position: "absolute"
  };
}
function J(t, e, i, s) {
  return {
    transform: "translate3d(" + e * -1 + "px," + t + "px, 0)",
    width: i + "px",
    height: s + "px",
    position: "absolute"
  };
}
function K(t, e, i, s) {
  return {
    top: t + "px",
    left: e + "px",
    width: i + "px",
    height: s + "px",
    position: "absolute"
  };
}
function Q(t, e, i, s) {
  return {
    top: t + "px",
    right: e + "px",
    width: i + "px",
    height: s + "px",
    position: "absolute"
  };
}
function L(t) {
  return [].concat(t).sort(function(e, i) {
    return e.y === i.y && e.x === i.x ? 0 : e.y > i.y || e.y === i.y && e.x > i.x ? 1 : -1;
  });
}
function Z(t, e = "Layout") {
  const i = ["x", "y", "w", "h"];
  let s = [];
  if (!Array.isArray(t))
    throw new Error(e + " must be an array!");
  for (let r = 0, n = t.length; r < n; r++) {
    const a = t[r];
    for (let h = 0; h < i.length; h++)
      if (typeof a[i[h]] != "number")
        throw new Error("VueGridLayout: " + e + "[" + r + "]." + i[h] + " must be a number!");
    if (a.i === void 0 || a.i === null)
      throw new Error("VueGridLayout: " + e + "[" + r + "].i cannot be null!");
    if (typeof a.i != "number" && typeof a.i != "string")
      throw new Error("VueGridLayout: " + e + "[" + r + "].i must be a string or number!");
    if (s.indexOf(a.i) >= 0)
      throw new Error("VueGridLayout: " + e + "[" + r + "].i must be unique!");
    if (s.push(a.i), a.static !== void 0 && typeof a.static != "boolean")
      throw new Error("VueGridLayout: " + e + "[" + r + "].static must be a boolean!");
  }
}
function B(t) {
  return tt(t);
}
function tt(t) {
  const e = t.target.offsetParent || document.body, i = e === document.body ? { left: 0, top: 0 } : e.getBoundingClientRect(), s = t.clientX + e.scrollLeft - i.left, r = t.clientY + e.scrollTop - i.top;
  return { x: s, y: r };
}
function W(t, e, i, s) {
  return et(t) ? {
    deltaX: i - t,
    deltaY: s - e,
    lastX: t,
    lastY: e,
    x: i,
    y: s
  } : {
    deltaX: 0,
    deltaY: 0,
    lastX: i,
    lastY: s,
    x: i,
    y: s
  };
}
function et(t) {
  return typeof t == "number" && !isNaN(t);
}
function it(t, e) {
  const i = N(t);
  let s = i[0];
  for (let r = 1, n = i.length; r < n; r++) {
    const a = i[r];
    e > t[a] && (s = a);
  }
  return s;
}
function z(t, e) {
  if (!e[t])
    throw new Error("ResponsiveGridLayout: `cols` entry for breakpoint " + t + " is missing!");
  return e[t];
}
function st(t, e, i, s, r, n, a) {
  if (e[s])
    return w(e[s]);
  let h = t;
  const d = N(i), o = d.slice(d.indexOf(s));
  for (let l = 0, u = o.length; l < u; l++) {
    const g = o[l];
    if (e[g]) {
      h = e[g];
      break;
    }
  }
  return h = w(h || []), f(V(h, { cols: n }), a);
}
function N(t) {
  return Object.keys(t).sort(function(i, s) {
    return t[i] - t[s];
  });
}
let rt = "auto";
function C() {
  return typeof document > "u" ? rt : document.documentElement.dir;
}
const nt = k({
  name: "GridItem",
  props: {
    isDraggable: {
      type: Boolean,
      required: !1,
      default: null
    },
    isResizable: {
      type: Boolean,
      required: !1,
      default: null
    },
    static: {
      type: Boolean,
      required: !1,
      default: !1
    },
    minH: {
      type: Number,
      required: !1,
      default: 1
    },
    minW: {
      type: Number,
      required: !1,
      default: 1
    },
    maxH: {
      type: Number,
      required: !1,
      default: 1 / 0
    },
    maxW: {
      type: Number,
      required: !1,
      default: 1 / 0
    },
    x: {
      type: Number,
      required: !0
    },
    y: {
      type: Number,
      required: !0
    },
    w: {
      type: Number,
      required: !0
    },
    h: {
      type: Number,
      required: !0
    },
    i: {
      required: !0
    },
    dragIgnoreFrom: {
      type: String,
      required: !1,
      default: "a, button"
    },
    dragAllowFrom: {
      type: String,
      required: !1,
      default: null
    },
    resizeIgnoreFrom: {
      type: String,
      required: !1,
      default: "a, button"
    },
    preserveAspectRatio: {
      type: Boolean,
      required: !1,
      default: !1
    }
  },
  inject: ["eventBus", "layout"],
  data() {
    return {
      cols: 1,
      containerWidth: 100,
      rowHeight: 30,
      margin: [10, 10],
      maxRows: 1 / 0,
      draggable: null,
      resizable: null,
      useCssTransforms: !0,
      useStyleCursor: !0,
      isDragging: !1,
      dragging: null,
      isResizing: !1,
      resizing: null,
      lastX: NaN,
      lastY: NaN,
      lastW: NaN,
      lastH: NaN,
      style: {},
      rtl: !1,
      dragEventSet: !1,
      resizeEventSet: !1,
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
    let t = this;
    t.updateWidthHandler = function(e) {
      t.updateWidth(e);
    }, t.compactHandler = function(e) {
      t.compact(e);
    }, t.setDraggableHandler = function(e) {
      t.isDraggable === null && (t.draggable = e);
    }, t.setResizableHandler = function(e) {
      t.isResizable === null && (t.resizable = e);
    }, t.setRowHeightHandler = function(e) {
      t.rowHeight = e;
    }, t.setMaxRowsHandler = function(e) {
      t.maxRows = e;
    }, t.directionchangeHandler = () => {
      this.rtl = C() === "rtl", this.compact();
    }, t.setColNum = (e) => {
      t.cols = parseInt(e);
    }, this.eventBus.on("updateWidth", t.updateWidthHandler), this.eventBus.on("compact", t.compactHandler), this.eventBus.on("setDraggable", t.setDraggableHandler), this.eventBus.on("setResizable", t.setResizableHandler), this.eventBus.on("setRowHeight", t.setRowHeightHandler), this.eventBus.on("setMaxRows", t.setMaxRowsHandler), this.eventBus.on("directionchange", t.directionchangeHandler), this.eventBus.on("setColNum", t.setColNum), this.rtl = C() === "rtl";
  },
  beforeUnmount() {
    let t = this;
    this.eventBus.off("updateWidth", t.updateWidthHandler), this.eventBus.off("compact", t.compactHandler), this.eventBus.off("setDraggable", t.setDraggableHandler), this.eventBus.off("setResizable", t.setResizableHandler), this.eventBus.off("setRowHeight", t.setRowHeightHandler), this.eventBus.off("setMaxRows", t.setMaxRowsHandler), this.eventBus.off("directionchange", t.directionchangeHandler), this.eventBus.off("setColNum", t.setColNum), this.interactObj && this.interactObj.unset();
  },
  mounted() {
    this.layout.responsive && this.layout.lastBreakpoint ? this.cols = z(this.layout.lastBreakpoint, this.layout.cols) : this.cols = this.layout.colNum, this.rowHeight = this.layout.rowHeight, this.containerWidth = this.layout.width !== null ? this.layout.width : 100, this.margin = this.layout.margin !== void 0 ? this.layout.margin : [10, 10], this.maxRows = this.layout.maxRows, this.isDraggable === null ? this.draggable = this.layout.isDraggable : this.draggable = this.isDraggable, this.isResizable === null ? this.resizable = this.layout.isResizable : this.resizable = this.isResizable, this.useCssTransforms = this.layout.useCssTransforms, this.useStyleCursor = this.layout.useStyleCursor, this.createStyle();
  },
  watch: {
    isDraggable() {
      this.draggable = this.isDraggable;
    },
    static() {
      this.tryMakeDraggable(), this.tryMakeResizable();
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
      this.createStyle(), this.emitContainerResized();
    },
    cols() {
      this.tryMakeResizable(), this.createStyle(), this.emitContainerResized();
    },
    containerWidth() {
      this.tryMakeResizable(), this.createStyle(), this.emitContainerResized();
    },
    x(t) {
      this.innerX = t, this.createStyle();
    },
    y(t) {
      this.innerY = t, this.createStyle();
    },
    h(t) {
      this.innerH = t, this.createStyle();
    },
    w(t) {
      this.innerW = t, this.createStyle();
    },
    renderRtl() {
      this.tryMakeResizable(), this.createStyle();
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
    "$parent.margin"(t) {
      !t || t[0] == this.margin[0] && t[1] == this.margin[1] || (this.margin = t.map((e) => Number(e)), this.createStyle(), this.emitContainerResized());
    }
  },
  computed: {
    classObj() {
      return {
        "vue-resizable": this.resizableAndNotStatic,
        static: this.static,
        resizing: this.isResizing,
        "vue-draggable-dragging": this.isDragging,
        cssTransforms: this.useCssTransforms,
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
      return this.renderRtl ? "vue-resizable-handle vue-rtl-resizable-handle" : "vue-resizable-handle";
    }
  },
  methods: {
    createStyle() {
      this.x + this.w > this.cols ? (this.innerX = 0, this.innerW = this.w > this.cols ? this.cols : this.w) : (this.innerX = this.x, this.innerW = this.w);
      let t = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
      this.isDragging && (t.top = this.dragging.top, this.renderRtl ? t.right = this.dragging.left : t.left = this.dragging.left), this.isResizing && (t.width = this.resizing.width, t.height = this.resizing.height);
      let e;
      this.useCssTransforms ? this.renderRtl ? e = J(t.top, t.right, t.width, t.height) : e = U(t.top, t.left, t.width, t.height) : this.renderRtl ? e = Q(t.top, t.right, t.width, t.height) : e = K(t.top, t.left, t.width, t.height), this.style = e;
    },
    emitContainerResized() {
      let t = {};
      for (let e of ["width", "height"]) {
        let s = this.style[e].match(/^(\d+)px$/);
        if (!s)
          return;
        t[e] = s[1];
      }
      this.$emit("container-resized", this.i, this.h, this.w, t.height, t.width);
    },
    handleResize(t) {
      if (this.static)
        return;
      const e = B(t);
      if (e == null)
        return;
      const { x: i, y: s } = e, r = { width: 0, height: 0 };
      let n;
      switch (t.type) {
        case "resizestart": {
          this.previousW = this.innerW, this.previousH = this.innerH, n = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH), r.width = n.width, r.height = n.height, this.resizing = r, this.isResizing = !0;
          break;
        }
        case "resizemove": {
          const a = W(this.lastW, this.lastH, i, s);
          this.renderRtl ? r.width = this.resizing.width - a.deltaX : r.width = this.resizing.width + a.deltaX, r.height = this.resizing.height + a.deltaY, this.resizing = r;
          break;
        }
        case "resizeend": {
          n = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH), r.width = n.width, r.height = n.height, this.resizing = null, this.isResizing = !1;
          break;
        }
      }
      n = this.calcWH(r.height, r.width), n.w < this.minW && (n.w = this.minW), n.w > this.maxW && (n.w = this.maxW), n.h < this.minH && (n.h = this.minH), n.h > this.maxH && (n.h = this.maxH), n.h < 1 && (n.h = 1), n.w < 1 && (n.w = 1), this.lastW = i, this.lastH = s, (this.innerW !== n.w || this.innerH !== n.h) && this.$emit("resize", this.i, n.h, n.w, r.height, r.width), t.type === "resizeend" && (this.previousW !== this.innerW || this.previousH !== this.innerH) && this.$emit("resized", this.i, n.h, n.w, r.height, r.width), this.eventBus.emit("resizeEvent", { eventType: t.type, i: this.i, x: this.innerX, y: this.innerY, h: n.h, w: n.w });
    },
    handleDrag(t) {
      if (this.static || this.isResizing)
        return;
      const e = B(t);
      if (e === null)
        return;
      const { x: i, y: s } = e;
      let r = { top: 0, left: 0 };
      switch (t.type) {
        case "dragstart": {
          this.previousX = this.innerX, this.previousY = this.innerY;
          let a = t.target.offsetParent.getBoundingClientRect(), h = t.target.getBoundingClientRect();
          this.renderRtl ? r.left = (h.right - a.right) * -1 : r.left = h.left - a.left, r.top = h.top - a.top, this.dragging = r, this.isDragging = !0;
          break;
        }
        case "dragend": {
          if (!this.isDragging)
            return;
          let a = t.target.offsetParent.getBoundingClientRect(), h = t.target.getBoundingClientRect();
          this.renderRtl ? r.left = (h.right - a.right) * -1 : r.left = h.left - a.left, r.top = h.top - a.top, this.dragging = null, this.isDragging = !1;
          break;
        }
        case "dragmove": {
          const a = W(this.lastX, this.lastY, i, s);
          this.renderRtl ? r.left = this.dragging.left - a.deltaX : r.left = this.dragging.left + a.deltaX, r.top = this.dragging.top + a.deltaY, this.dragging = r;
          break;
        }
      }
      let n;
      this.renderRtl ? n = this.calcXY(r.top, r.left) : n = this.calcXY(r.top, r.left), this.lastX = i, this.lastY = s, (this.innerX !== n.x || this.innerY !== n.y) && this.$emit("move", this.i, n.x, n.y), t.type === "dragend" && (this.previousX !== this.innerX || this.previousY !== this.innerY) && this.$emit("moved", this.i, n.x, n.y), this.eventBus.emit("dragEvent", { eventType: t.type, i: this.i, x: n.x, y: n.y, h: this.innerH, w: this.innerW });
    },
    calcPosition(t, e, i, s) {
      const r = this.calcColWidth();
      let n;
      return this.renderRtl ? n = {
        right: Math.round(r * t + (t + 1) * this.margin[0]),
        top: Math.round(this.rowHeight * e + (e + 1) * this.margin[1]),
        // 0 * Infinity === NaN, which causes problems with resize constriants;
        // Fix this if it occurs.
        // Note we do it here rather than later because Math.round(Infinity) causes deopt
        width: i === 1 / 0 ? i : Math.round(r * i + Math.max(0, i - 1) * this.margin[0]),
        height: s === 1 / 0 ? s : Math.round(this.rowHeight * s + Math.max(0, s - 1) * this.margin[1])
      } : n = {
        left: Math.round(r * t + (t + 1) * this.margin[0]),
        top: Math.round(this.rowHeight * e + (e + 1) * this.margin[1]),
        // 0 * Infinity === NaN, which causes problems with resize constriants;
        // Fix this if it occurs.
        // Note we do it here rather than later because Math.round(Infinity) causes deopt
        width: i === 1 / 0 ? i : Math.round(r * i + Math.max(0, i - 1) * this.margin[0]),
        height: s === 1 / 0 ? s : Math.round(this.rowHeight * s + Math.max(0, s - 1) * this.margin[1])
      }, n;
    },
    /**
     * Translate x and y coordinates from pixels to grid units.
     * @param  top  Top position (relative to parent) in pixels.
     * @param  left Left position (relative to parent) in pixels.
     * @return x and y in grid units.
     */
    // TODO check if this function needs change in order to support rtl.
    calcXY(t, e) {
      const i = this.calcColWidth();
      let s = Math.round((e - this.margin[0]) / (i + this.margin[0])), r = Math.round((t - this.margin[1]) / (this.rowHeight + this.margin[1]));
      return s = Math.max(Math.min(s, this.cols - this.innerW), 0), r = Math.max(Math.min(r, this.maxRows - this.innerH), 0), { x: s, y: r };
    },
    // Helper for generating column width
    calcColWidth() {
      return (this.containerWidth - this.margin[0] * (this.cols + 1)) / this.cols;
    },
    /**
     * Given a height and width in pixel values, calculate grid units.
     * @param  height Height in pixels.
     * @param  width  Width in pixels.
     * @param  autoSizeFlag  function autoSize identifier.
     * @return w, h as grid units.
     */
    calcWH(t, e, i = !1) {
      const s = this.calcColWidth();
      let r = Math.round((e + this.margin[0]) / (s + this.margin[0])), n = 0;
      return i ? n = Math.ceil((t + this.margin[1]) / (this.rowHeight + this.margin[1])) : n = Math.round((t + this.margin[1]) / (this.rowHeight + this.margin[1])), r = Math.max(Math.min(r, this.cols - this.innerX), 0), n = Math.max(Math.min(n, this.maxRows - this.innerY), 0), { w: r, h: n };
    },
    updateWidth(t, e) {
      this.containerWidth = t, e != null && (this.cols = e);
    },
    compact() {
      this.createStyle();
    },
    tryMakeDraggable() {
      const t = this;
      if ((this.interactObj === null || this.interactObj === void 0) && (this.interactObj = p(this.$el), this.useStyleCursor || this.interactObj.styleCursor(!1)), this.draggable && !this.static) {
        const e = {
          ignoreFrom: this.dragIgnoreFrom,
          allowFrom: this.dragAllowFrom
        };
        this.interactObj.draggable(e), this.dragEventSet || (this.dragEventSet = !0, this.interactObj.on("dragstart dragmove dragend", function(i) {
          t.handleDrag(i);
        }));
      } else
        this.interactObj.draggable({
          enabled: !1
        });
    },
    tryMakeResizable() {
      const t = this;
      if ((this.interactObj === null || this.interactObj === void 0) && (this.interactObj = p(this.$el), this.useStyleCursor || this.interactObj.styleCursor(!1)), this.resizable && !this.static) {
        let e = this.calcPosition(0, 0, this.maxW, this.maxH), i = this.calcPosition(0, 0, this.minW, this.minH);
        const s = {
          // allowFrom: "." + this.resizableHandleClass.trim().replace(" ", "."),
          edges: {
            left: !1,
            right: "." + this.resizableHandleClass.trim().replace(" ", "."),
            bottom: "." + this.resizableHandleClass.trim().replace(" ", "."),
            top: !1
          },
          ignoreFrom: this.resizeIgnoreFrom,
          restrictSize: {
            min: {
              height: i.height,
              width: i.width
            },
            max: {
              height: e.height,
              width: e.width
            }
          },
          modifiers: []
        };
        this.preserveAspectRatio && (s.modifiers = [
          p.modifiers.aspectRatio({
            ratio: "preserve"
          })
        ]), this.interactObj.resizable(s), this.resizeEventSet || (this.resizeEventSet = !0, this.interactObj.on("resizestart resizemove resizeend", function(r) {
          t.handleResize(r);
        }));
      } else
        this.interactObj.resizable({
          enabled: !1
        });
    },
    autoSize() {
      this.previousW = this.innerW, this.previousH = this.innerH;
      let t = this.$el.firstElementChild.getBoundingClientRect(), e = this.calcWH(t.height, t.width, !0);
      e.w < this.minW && (e.w = this.minW), e.w > this.maxW && (e.w = this.maxW), e.h < this.minH && (e.h = this.minH), e.h > this.maxH && (e.h = this.maxH), e.h < 1 && (e.h = 1), e.w < 1 && (e.w = 1), (this.innerW !== e.w || this.innerH !== e.h) && this.$emit("resize", this.i, e.h, e.w, t.height, t.width), (this.previousW !== e.w || this.previousH !== e.h) && (this.$emit("resized", this.i, e.h, e.w, t.height, t.width), this.eventBus.emit("resizeEvent", { eventType: "resizeend", i: this.i, x: this.innerX, y: this.innerY, h: e.h, w: e.w }));
    }
  }
});
const O = (t, e) => {
  const i = t.__vccOpts || t;
  for (const [s, r] of e)
    i[s] = r;
  return i;
};
function at(t, e, i, s, r, n) {
  return y(), b("div", {
    class: x(["vue-grid-item", t.classObj]),
    style: S(t.style)
  }, [
    $(t.$slots, "default", {}, void 0, !0),
    t.resizableAndNotStatic ? (y(), b("span", {
      key: 0,
      ref: "handle",
      class: x(t.resizableHandleClass)
    }, null, 2)) : Y("", !0)
  ], 6);
}
const X = /* @__PURE__ */ O(nt, [["render", at], ["__scopeId", "data-v-dbca6792"]]), ht = k({
  name: "GridLayout",
  provide() {
    return {
      eventBus: this.eventBus,
      layout: this
    };
  },
  components: {
    GridItem: X
  },
  props: {
    // If true, the container height swells and contracts to fit contents
    autoSize: {
      type: Boolean,
      default: !0
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
      default: 1 / 0
    },
    margin: {
      type: Array,
      default() {
        return [10, 10];
      }
    },
    isDraggable: {
      type: Boolean,
      default: !0
    },
    isResizable: {
      type: Boolean,
      default: !0
    },
    isMirrored: {
      type: Boolean,
      default: !1
    },
    useCssTransforms: {
      type: Boolean,
      default: !0
    },
    verticalCompact: {
      type: Boolean,
      default: !0
    },
    layout: {
      type: Array,
      required: !0
    },
    responsive: {
      type: Boolean,
      default: !1
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
      default: !1
    },
    useStyleCursor: {
      type: Boolean,
      default: !0
    }
  },
  data() {
    return {
      eventBus: q(),
      width: null,
      mergedStyle: {},
      lastLayoutLength: 0,
      isDragging: !1,
      placeholder: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        i: -1
      },
      layouts: {},
      // array to store all layouts from different breakpoints
      lastBreakpoint: null,
      // store last active breakpoint
      originalLayout: null
      // store original Layout
      // layout: JSON.parse(JSON.stringify(this.value)),
    };
  },
  emits: ["update:layout", "layout-created", "layout-before-mount", "layout-mounted", "layout-updated", "layout-ready", "breakpoint-changed"],
  created() {
    const t = this;
    t.resizeEventHandler = function({ eventType: e, i, x: s, y: r, h: n, w: a }) {
      t.resizeEvent(e, i, s, r, n, a);
    }, t.dragEventHandler = function({ eventType: e, i, x: s, y: r, h: n, w: a }) {
      t.dragEvent(e, i, s, r, n, a);
    }, t.eventBus.on("resizeEvent", t.resizeEventHandler), t.eventBus.on("dragEvent", t.dragEventHandler), t.$emit("layout-created", t.layout);
  },
  beforeUnmount() {
    this.eventBus.off("resizeEvent", this.resizeEventHandler), this.eventBus.off("dragEvent", this.dragEventHandler), this.ro && this.ro.unobserve(this.$el);
  },
  beforeMount() {
    this.$emit("layout-before-mount", this.layout);
  },
  mounted() {
    const t = this;
    this.$emit("layout-mounted", this.layout), this.$nextTick(function() {
      Z(this.layout), this.originalLayout = this.layout, this.$nextTick(function() {
        t.onWindowResize(), t.initResponsiveFeatures(), f(t.layout, t.verticalCompact), t.$emit("layout-updated", t.layout), t.updateHeight(), t.$nextTick(function() {
          t.ro = new F(() => {
            t.onWindowResize();
          }), t.ro.observe(this.$el);
        });
      });
    });
  },
  watch: {
    width(t, e) {
      const i = this;
      this.$nextTick(function() {
        this.eventBus.emit("updateWidth", this.width), e === null && this.$nextTick(() => {
          this.$emit("layout-ready", i.layout);
        }), this.updateHeight();
      });
    },
    layout() {
      this.layoutUpdate();
    },
    "layout.length"() {
      this.layoutUpdate();
    },
    colNum(t) {
      this.eventBus.emit("setColNum", t);
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
      this.responsive || (this.$emit("update:layout", this.originalLayout), this.eventBus.emit("setColNum", this.colNum)), this.onWindowResize();
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
          let t = this.findDifference(this.layout, this.originalLayout);
          t.length > 0 && (this.layout.length > this.originalLayout.length ? this.originalLayout = this.originalLayout.concat(t) : this.originalLayout = this.originalLayout.filter((e) => !t.some((i) => e.i === i.i))), this.lastLayoutLength = this.layout.length, this.initResponsiveFeatures();
        }
        f(this.layout, this.verticalCompact), this.eventBus.emit("updateWidth", this.width), this.updateHeight(), this.$emit("layout-updated", this.layout);
      }
    },
    updateHeight() {
      this.mergedStyle = {
        height: this.containerHeight()
      };
    },
    onWindowResize() {
      this.$el && (this.width = this.$el.offsetWidth), this.eventBus.emit("resizeEvent", {});
    },
    containerHeight() {
      return this.autoSize ? T(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + "px" : void 0;
    },
    dragEvent(t, e, i, s, r, n) {
      let a = R(this.layout, e);
      t === "dragmove" || t === "dragstart" ? (this.placeholder.i = e, this.placeholder.x = a.x, this.placeholder.y = a.y, this.placeholder.w = n, this.placeholder.h = r, this.$nextTick(function() {
        this.isDragging = !0;
      }), this.eventBus.emit("updateWidth", this.width)) : this.$nextTick(function() {
        this.isDragging = !1;
      }), this.$emit("update:layout", v(this.layout, a, i, s, !0, this.preventCollision)), f(this.layout, this.verticalCompact), this.eventBus.emit("compact"), this.updateHeight(), t === "dragend" && this.$emit("layout-updated", this.layout);
    },
    resizeEvent(t, e, i, s, r, n) {
      let a = R(this.layout, e), h;
      if (this.preventCollision) {
        const d = D(this.layout, { ...a, w: n, h: r }).filter(
          (o) => o.i !== a.i
        );
        if (h = d.length > 0, h) {
          let o = 1 / 0, l = 1 / 0;
          d.forEach((u) => {
            u.x > a.x && (o = Math.min(o, u.x)), u.y > a.y && (l = Math.min(l, u.y));
          }), Number.isFinite(o) && (a.w = o - a.x), Number.isFinite(l) && (a.h = l - a.y);
        }
      }
      h || (a.w = n, a.h = r), t === "resizestart" || t === "resizemove" ? (this.placeholder.i = e, this.placeholder.x = i, this.placeholder.y = s, this.placeholder.w = a.w, this.placeholder.h = a.h, this.$nextTick(function() {
        this.isDragging = !0;
      }), this.eventBus.emit("updateWidth", this.width)) : this.$nextTick(function() {
        this.isDragging = !1;
      }), this.responsive && this.responsiveGridLayout(), f(this.layout, this.verticalCompact), this.eventBus.emit("compact"), this.updateHeight(), t === "resizeend" && this.$emit("layout-updated", this.layout);
    },
    // finds or generates new layouts for set breakpoints
    responsiveGridLayout() {
      let t = it(this.breakpoints, this.width), e = z(t, this.cols);
      this.lastBreakpoint != null && !this.layouts[this.lastBreakpoint] && (this.layouts[this.lastBreakpoint] = w(this.layout));
      let i = st(
        this.originalLayout,
        this.layouts,
        this.breakpoints,
        t,
        this.lastBreakpoint,
        e,
        this.verticalCompact
      );
      this.layouts[t] = i, this.lastBreakpoint !== t && this.$emit("breakpoint-changed", t, i), this.$emit("update:layout", i), this.lastBreakpoint = t, this.eventBus.emit("setColNum", z(t, this.cols));
    },
    // clear all responsive layouts
    initResponsiveFeatures() {
      this.layouts = Object.assign({}, this.responsiveLayouts);
    },
    // find difference in layouts
    findDifference(t, e) {
      let i = t.filter(function(r) {
        return !e.some(function(n) {
          return r.i === n.i;
        });
      }), s = e.filter(function(r) {
        return !t.some(function(n) {
          return r.i === n.i;
        });
      });
      return i.concat(s);
    }
  }
});
function ot(t, e, i, s, r, n) {
  const a = _("grid-item");
  return y(), b("div", {
    class: "vue-grid-layout",
    style: S(t.mergedStyle)
  }, [
    $(t.$slots, "default", {}, void 0, !0),
    j(I(a, {
      class: "vue-grid-placeholder",
      x: t.placeholder.x,
      y: t.placeholder.y,
      w: t.placeholder.w,
      h: t.placeholder.h,
      i: t.placeholder.i
    }, null, 8, ["x", "y", "w", "h", "i"]), [
      [A, t.isDragging]
    ])
  ], 4);
}
const lt = /* @__PURE__ */ O(ht, [["render", ot], ["__scopeId", "data-v-0e66beca"]]), wt = (t) => {
  t.component("grid-layout", lt), t.component("grid-item", X);
};
export {
  X as GridItem,
  lt as GridLayout,
  wt as default
};
