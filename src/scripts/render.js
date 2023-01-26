import { SubscribeToPrivateGarbageData } from "./suscriberToGlobalGarbageCollector.js";
import { accessGlobalFunction } from "./globalGarbageCollector.js";

class Node {
    constructor(elm) {
        this.node = elm || null;
        this.nextNode = null;
        this.prevNode = null;
        this.origin = null;
        this.parent = null;
        this.child = null;
        this.subscribedTo = null;
        this.key = "";
        this.effects = new Set();
    }

    setNext(value) { this.nextNode = value || null; }
    setPrev(value) { this.prevNode = value || null; }
    setOrigin(value) { this.origin = value || null; }
    setParent(value) { this.parent = value || null; }
    setChild(value) { this.child = value || null; }

    setSubscribedTo(subscriber) { this.subscribedTo = subscriber || null; }

    setKey(key) { 
        if (accessGlobalFunction.lookup(this.subscribedTo?.target)) {
            this.key = key || "";
            this.subscribedTo.self.addNewKey("key");
        }
    }
    
    addToEffects(effect) { 
        if (accessGlobalFunction.lookup(this.subscribedTo?.taget, this.key)) {
            this.subscribedTo.self.addEffect(this.key, effect);
            this.addToEffects.add(effect);
        }
     }

    removeFromEffects(effect) {
        if (accessGlobalFunction.lookup(this.subscribedTo?.taget, this.key)) {
            this.subscribedTo.self.removeEffect(this.key, effect);
            this.addToEffects.delete(effect);
        }
    }

    returnNode() {
        return {
            node: this.node,
            next: this.nextNode,
            prev: this.prevNode,
            origin: this.origin,
            parent: this.parent,
            child: this.child,
            subscribedTo: this.subscribedTo,
            key: this.key
        }
    }
}

function makeNodeShadowTree(tree, origin = null, subsribedTo = null) {
    const children = Array.from(tree.children);
    
    const allInCurrentTreeSection = [];
    
    for (let i = 0; i < children.length; i++) {
        const currentNode = new Node(children[i]);
        
        currentNode.setNext(children[i + 1] ? children[i + 1] : null);
        currentNode.setPrev(children[i - 1] ? children[i - 1] : null);
        currentNode.setParent(children[i].parentNode);

        /**
         * Origin Cycle:
         * 
         * Step 1: Set origin for everything else than first iteration (shadow tree)
         * 
         * Step 2: Set the origin of the shadow tree to it's root
         */
        let originNode = origin;
        let subscribedToNode = subsribedTo;
        if (children[i].parentNode?.activeElement !== undefined) {
            originNode = children[i];
            subscribedToNode = {target: children[i], self: Subscriber(children[i])};
        }
        
        currentNode.setOrigin(originNode);
        currentNode.setSubscribedTo(subscribedToNode);
        currentNode.setKey(children[i]);

        if (children[i].parentNode?.activeElement !== undefined) {
            currentNode.setOrigin(children[i].parentNode);
        }

        // Cycle ends here.
        
        // See if the elm has any children
        const ifAnyChildren = Array.from(children[i].children);
        if (ifAnyChildren.length > 0) {
            currentNode.setChild(makeNodeShadowTree(children[i], originNode, subscribedToNode));
        }
        
        allInCurrentTreeSection.push(currentNode.returnNode());
    }

    return allInCurrentTreeSection;
}

function Subscriber(target) {
    let currentSubcriber = null;
    if (accessGlobalFunction.lookup(target)) {
        currentSubcriber = accessGlobalFunction.lookup(target).self;
    } else {
        currentSubcriber = new SubscribeToPrivateGarbageData(target);
    }

    return currentSubcriber;
}

function track(target, key) {
    let lookForKeyToTrack = null;

    if (accessGlobalFunction.lookup(target.getSelf(), key)) { lookForKeyToTrack = target.getKey(key); }
    else { lookForKeyToTrack = target.addNewKey(key); }

    return lookForKeyToTrack;
}

function trigger(target, key) {
    if (accessGlobalFunction.lookup(target.getSelf(), key)) { target.iterateOverCallbacks(key) };
}

function createReactiveProxy(target, key, value) {
    const reactive = new Proxy({[key]: value}, {
        get() {
            track(target, reactive);
            return Reflect.get(...arguments);
        },
        set(t, k, v) {
            t[k] = v;
            trigger(target, reactive);
            return true; 
        }
    });

    track(target, reactive);

    return [reactive, (val) => reactive[key] = val];
}

/**
 * Testing Area
 */

window.addEventListener("DOMContentLoaded", (event) => {
    const root = document.getElementById("root");

    const rootShadow = root.attachShadow({mode: "open"});
    const shadow = rootShadow;

    const in1 = document.createElement("input")
    in1.setAttribute("value", "fasfs");
    shadow.append(in1)
    
    const in2 = document.createElement("div")
    shadow.append(in2)

    const in3 = document.createElement("h1")
    in3.innerHTML = "gsfsa"
    in2.append(in3)

    const childNodes = Array.from(shadow.childNodes);
    
    const HTML = `
    <h1>awesome!</h1>
    <div>
        <section>
            <h1>awesome I think?</h1>
            <h1>awesome I fsa?</h1>
            <h2>awesome I fsa?</h2>
        </section>
        <article>
            <h1>fsa I think?</h1>
        </article>
    </div>
    `
    
    shadow.innerHTML += HTML;

    console.log(makeNodeShadowTree(shadow))
})

const root = document.getElementById("root");
const subbed = Subscriber("fs")

const objs = {
    idfk: 0,
    idfk2: 1
}

let [sfs, setVal] = createReactiveProxy(subbed, Object.keys(objs)[0], objs["idfk"])

const but = document.createElement("input")
document.body.append(but)
but.value = sfs.idfk;
but.addEventListener("input", (e) => {
    setVal(e.target.value);
    but.value = sfs.idfk;
})

const idkValue = document.createElement("div");
// idkValue.innerHTML = subbed.getKey(objs3).value;
document.body.append(idkValue)
subbed.addEffect(sfs, () => { idkValue.innerHTML = sfs.idfk });