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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/module.js
__export(exports, {
  default: () => module_default
});

// src/core/alpine-lazy-load-assets.js
function alpine_lazy_load_assets_default(Alpine) {
  Alpine.store("lazyLoadedAssets", {
    loaded: new Set(),
    check(paths) {
      return Array.isArray(paths) ? paths.every((path) => this.loaded.has(path)) : this.loaded.has(paths);
    },
    markLoaded(paths) {
      Array.isArray(paths) ? paths.forEach((path) => this.loaded.add(path)) : this.loaded.add(paths);
    }
  });
  function assetLoadedEvent(eventName) {
    return new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }
  function createDomElement(elementType, attributes = {}, targetElement, insertBeforeElement) {
    const element = document.createElement(elementType);
    for (const [attribute, value] of Object.entries(attributes)) {
      element[attribute] = value;
    }
    if (targetElement) {
      if (insertBeforeElement) {
        targetElement.insertBefore(element, insertBeforeElement);
      } else {
        targetElement.appendChild(element);
      }
    }
    return element;
  }
  function loadAsset(elementType, path, attributes = {}, targetElement = null, insertBeforeElement = null) {
    const selector = elementType === "link" ? `link[href="${path}"]` : `script[src="${path}"]`;
    if (document.querySelector(selector) || Alpine.store("lazyLoadedAssets").check(path)) {
      return Promise.resolve();
    }
    const element = createDomElement(elementType, __spreadProps(__spreadValues({}, attributes), { href: path }), targetElement, insertBeforeElement);
    return new Promise((resolve, reject) => {
      element.onload = () => {
        Alpine.store("lazyLoadedAssets").markLoaded(path);
        resolve();
      };
      element.onerror = () => {
        reject(new Error(`Failed to load ${elementType}: ${path}`));
      };
    });
  }
  async function loadCSS(path, mediaAttr, position = null, target = null) {
    const attributes = { type: "text/css", rel: "stylesheet" };
    if (mediaAttr) {
      attributes.media = mediaAttr;
    }
    let targetElement = document.head;
    let insertBeforeElement = null;
    if (position && target) {
      const targetLink = document.querySelector(`link[href*="${target}"]`);
      if (targetLink) {
        targetElement = targetLink.parentNode;
        insertBeforeElement = position === "before" ? targetLink : targetLink.nextSibling;
      } else {
        console.warn(`Target (${target}) not found for ${path}. Appending to head.`);
      }
    }
    await loadAsset("link", path, attributes, targetElement, insertBeforeElement);
  }
  async function loadJS(path, position, relativePosition = null, targetScript = null) {
    let positionElement, insertBeforeElement;
    if (relativePosition && targetScript) {
      positionElement = document.querySelector(`script[src*="${targetScript}"]`);
      if (positionElement) {
        insertBeforeElement = relativePosition === "before" ? positionElement : positionElement.nextSibling;
      } else {
        console.warn(`Target (${targetScript}) not found for ${path}. Appending to body.`);
      }
    }
    const insertLocation = position.has("body-start") ? "prepend" : "append";
    await loadAsset("script", path, {}, positionElement || document[position.has("body-end") ? "body" : "head"], insertBeforeElement);
  }
  Alpine.directive("load-css", (el, { expression }, { evaluate }) => {
    const paths = evaluate(expression);
    const mediaAttr = el.media;
    const eventName = el.getAttribute("data-dispatch");
    const position = el.getAttribute("data-css-before") ? "before" : el.getAttribute("data-css-after") ? "after" : null;
    const target = el.getAttribute("data-css-before") || el.getAttribute("data-css-after") || null;
    Promise.all(paths.map((path) => loadCSS(path, mediaAttr, position, target))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(eventName + "-css"));
      }
    }).catch((error) => {
      console.error(error);
    });
  });
  Alpine.directive("load-js", (el, { expression, modifiers }, { evaluate }) => {
    const paths = evaluate(expression);
    const position = new Set(modifiers);
    const relativePosition = el.getAttribute("data-js-before") ? "before" : el.getAttribute("data-js-after") ? "after" : null;
    const targetScript = el.getAttribute("data-js-before") || el.getAttribute("data-js-after") || null;
    const eventName = el.getAttribute("data-dispatch");
    Promise.all(paths.map((path) => loadJS(path, position, relativePosition, targetScript))).then(() => {
      if (eventName) {
        window.dispatchEvent(assetLoadedEvent(eventName + "-js"));
      }
    }).catch((error) => {
      console.error(error);
    });
  });
}

// src/module.js
var module_default = alpine_lazy_load_assets_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
