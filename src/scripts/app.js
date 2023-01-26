import { Subscriber } from "./subToSub.js";
import suqu from "./render.js";

/**
 * Testing Area
 */

const root = document.getElementById("root");
const target = Subscriber(root);

const stack = {
    idfk: "somevalue",
    needInput: "",
    goHigher: 0,
}

suqu(root, target, stack);
