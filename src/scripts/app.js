import { Subscriber } from "./subToSub.js";
import suqu from "./render.js";

/**
 * Testing Area
 */

const sheet = new CSSStyleSheet();

let css = [];
for (let key of Object.values(document.styleSheets)) {
    for (let prop of key.cssRules) {
        css.push(prop.cssText);
    }
}

sheet.replaceSync(css.join(""))

const root = document.getElementById("root");
const target = Subscriber(root);

const stack = {
    idfk: "Welcome to suqu",
    needInput: "gsdg",
    goHigher: 0,
    list: {val: "fs", key: "fsa"}
}

suqu(root, target, stack, sheet);
