import { createReactiveProxy } from "./subToSub.js";
import { change, attributes } from "./attributes.js";

class Node {
    constructor(elm) {
        this.node = elm || null;
        this.nextNode = null;
        this.prevNode = null;
        this.origin = null;
        this.parent = null;
        this.child = null;

        this.attribute = null;
        this.value = null;
        this.key = null;
        this.specialChanges = [];
        this.target = null;
        this.stack = null;
        this.targetProxy = null;
        this.oldHTML = "";
    }

    setNext(value) { this.nextNode = value || null; }
    setPrev(value) { this.prevNode = value || null; }
    setOrigin(value) { this.origin = value || null; }
    setParent(value) { this.parent = value || null; }
    setChild(value) { this.child = value || null; }
    setOldHTML(value) { this.oldHTML = value || ""; }

    setTargetStack(target, stack) { 
        this.target = target;
        this.stack = stack;
    }

    insertHTML(node) {
        let specials = new Set();
        const replacingString = new RegExp(`\{{|\}}`, "gi");
    
        if (!node.child) {
            for (let key of node.stack) {
                const matchingString = new RegExp(`(\{{)${key[0]}(\}})`, 'gi');
                const special = node.oldHTML.match(matchingString)?.map(val => {return val.replace(replacingString, '')})
                
                if (special) { specials.add(...special); }

                let newHTML = node.oldHTML;
                for (let prop of specials) {
                    const matchingString = new RegExp(`(\{{)${prop}(\}})`, 'gi');
                    
                    newHTML = newHTML.replace(matchingString, node.stack.get(prop).self[prop]);
                    
                    node.node.innerHTML = newHTML.replace(matchingString, node.stack.get(prop).self[prop]);
                }

            }
        
            if (specials.size > 0) {
                for (let key of specials) {
                    const ownKey = node.target.getKey(node.stack.get(key)?.self) || null;
            
                    if (ownKey) { 
                        ownKey.value.add({
                            node: node,
                            func: this.insertHTML
                        });
                    }
                }
            }
        }
    }    

    setEffect() {
        let targetType = [];
        for (let i = 0; i < Object.entries(attributes).length; i++) {
            const attr = attributes[i];
            const getAttr = this.node.getAttribute(attr.type) || null;

            if (getAttr) { targetType.push(attr.type); }

            if (targetType.length > 1) {
                throw new Error("There can only be one special effect per element");
            }

            const stackAttr = this.stack.get(getAttr);
            if (stackAttr && attr.type !== "@change") {
                this.attribute = attr.change || null;
                this.value = stackAttr?.value;
                this.key = this.target.getKey(stackAttr?.self) || null;
                this.targetProxy = stackAttr;

                if (this.key) {
                    this.key.value.add({
                        node: this.returnNode(),
                        func: attr.func
                    })
                }
            }

            if (attr.type === "@change") {
                this.attribute = attr.change || null;
                this.value = stackAttr?.value;
                this.key = this.target.getKey(stackAttr?.self) || null;
                this.targetProxy = stackAttr;

                change(this.returnNode());
            }
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
            attribute: this.attribute,
            value: this.value,
            key: this.key,
            specialChanges: this.specialChanges,
            target: this.target,
            stack: this.stack,
            targetProxy: this.targetProxy,
            oldHTML: this.oldHTML
        }
    }
}

function makeNodeShadowTree(tree, stack, target, origin = null) {
    const children = Array.from(tree.children);
    
    const allInCurrentTreeSection = [];
    
    for (let i = 0; i < children.length; i++) {
        const currentNode = new Node(children[i]);
        
        currentNode.setNext(children[i + 1] ? children[i + 1] : null);
        currentNode.setPrev(children[i - 1] ? children[i - 1] : null);
        currentNode.setParent(children[i].parentNode);
        currentNode.setTargetStack(target, stack);

        /**
         * Origin Cycle:
         * 
         * Step 1: Set origin for everything else than first iteration (shadow tree)
         * 
         * Step 2: Set the origin of the shadow tree to it's root
         */
        let originNode = origin;
        if (children[i].parentNode?.activeElement !== undefined) {
            originNode = children[i];
        }
        
        currentNode.setOrigin(originNode);
        currentNode.setOldHTML(children[i].innerHTML);

        if (children[i].parentNode?.activeElement !== undefined) {
            currentNode.setOrigin(children[i].parentNode);
        }

        // Cycle ends here.
        
        // See if the elm has any children
        const ifAnyChildren = Array.from(children[i].children);
        if (ifAnyChildren.length > 0) {
            currentNode.setChild(makeNodeShadowTree(children[i], stack, target, originNode));
        }

        currentNode.setEffect();
        currentNode.insertHTML(currentNode.returnNode());
        
        allInCurrentTreeSection.push(currentNode.returnNode());
    }

    return allInCurrentTreeSection;
}

export default function suqu(html, target, stack) {
    const stackedProxies = new Map();
    for (let property in stack) {
        const [proxy, setProxy] = createReactiveProxy(target, property, stack[property]);
        stackedProxies.set(property, {self: proxy, name: property, value: proxy[property], setValue: setProxy});
    }

    const shadow = html.attachShadow({mode: "open"});
    shadow.innerHTML = html.innerHTML;
    makeNodeShadowTree(shadow, stackedProxies, target);

    if (stackedProxies.size > 0) {
        for (let [key, value] of stackedProxies) {
            target.iterateOverCallbacks(value.self);
        }
    }

    return stackedProxies;
}