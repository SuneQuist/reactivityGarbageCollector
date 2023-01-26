import { accessGlobalFunction } from "./globalGarbageCollector.js";

/**
 * Single Subsricber Instance (The function being called)
 */

const tranferredGarbage = new WeakMap();

/**
 * 
 * @param { Object } target - Provide Proxy target from get or set;
 * @param { String } key - Provide Proxy key from get or set;
 */
export function SubscribeToPrivateGarbageData(target) {
    if (!target) { 
        throw new Error("You need to set the target- AND key parameter"); 
    }

    // # Private
    const _toBeGarbagedInformation = {
        target: target,
        perKeyEffect: new Map(),
        self: this
    }

    tranferredGarbage.set(this, _toBeGarbagedInformation);
    
    if (!accessGlobalFunction.lookup(target)) {
        accessGlobalFunction.add(_toBeGarbagedInformation);
    }
}

/**
 * 
 * @param {String} key - Key string to add 
 * @returns 
 */
SubscribeToPrivateGarbageData.prototype.addNewKey = function(key) {
    const _this = tranferredGarbage.get(this);

    if (!key) { return; }
    
    if (accessGlobalFunction.lookup(_this.target, key)) { return; }

    accessGlobalFunction.update(_this.target, _this);
    this.addKeyPair(key);
}

/**
 * 
 * @param {String} checkForKey
 * @returns - void # Creates keypair set
 */
SubscribeToPrivateGarbageData.prototype.addKeyPair = function(checkForKey) {
    const _this = tranferredGarbage.get(this);

    const checkIfAnythingIsAlreadyThere = accessGlobalFunction.lookup(_this.target);

    if (checkIfAnythingIsAlreadyThere) {
        for (let [key, value] of checkIfAnythingIsAlreadyThere.perKeyEffect) {
            _this.perKeyEffect.set(key, value);
        }
        
        if (!checkIfAnythingIsAlreadyThere.perKeyEffect.get(checkForKey)) {
            _this.perKeyEffect.set(checkForKey, new Set());
        }
    } else {
        _this.perKeyEffect.set(checkForKey, new Set());
    }

    accessGlobalFunction.update(_this.target, _this);
}

/**
 * 
 * @param {String} key
 * @returns - key
 */
SubscribeToPrivateGarbageData.prototype.getKey = function(key) {
    const _this = tranferredGarbage.get(this);

    if (accessGlobalFunction.lookup(_this.target, key)) {
        for (let [keys, value] of _this.perKeyEffect.entries()) {
            if (keys === key) { return {key: keys, value}; }
        }
    }
}

/**
 * 
 * @returns - target
 */
SubscribeToPrivateGarbageData.prototype.getSelf = function() {
    const _this = tranferredGarbage.get(this);

    return _this.target;
}

/**
 * 
 * @param {String} key
 * @param {*} effect - Effect to add to keyPair
 * @returns - void
 */
SubscribeToPrivateGarbageData.prototype.addEffect = function(key, effect) {
    const _this = tranferredGarbage.get(this);

    _this.perKeyEffect.get(key).add(effect);
    
    // Call keypair again to update local, call update to do it globallyh
    accessGlobalFunction.update(_this.target, _this);
}

/**
 * 
 * @param {String} key
 * @param {*} effect - Remove Effect
 */
SubscribeToPrivateGarbageData.prototype.removeEffect = function(key, effect) {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(key).entries()) {
        if (String(value) === String(effect)) {  _this.perKeyEffect.get(key).delete(effect); }
    }

    this.addKeyPair();
    accessGlobalFunction.update(_this.target, _this);
}

/**
 * 
 * @param {String} key
 * @param {*} effect
 * @returns - Effect called for (equivalent to has());
 */
SubscribeToPrivateGarbageData.prototype.getEffect = function(key, effect) {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(key).entries()) {
        if (String(value) === String(effect)) { return effect; }
    }
}

/**
 * 
 * @param {String} key
 * @returns - Execution of all functions in specific effect;
 */
// SubscribeToPrivateGarbageData.prototype.iterateOverCallbacks = function(key) {
//     const _this = tranferredGarbage.get(this);

//     for (const [_, value] of _this.perKeyEffect.get(key).entries()) {
//         if (typeof value.func === "function") { value.func(value.node); }
//     }
// }

SubscribeToPrivateGarbageData.prototype.iterateOverCallbacks = function(key) {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(key).entries()) {
        if (typeof value === "function") { value(); }
    }
}

/**
 * 
 * @param {String} key
 * @returns - All values in specific effect;
 */
SubscribeToPrivateGarbageData.prototype.iterateOverValues = function(key) {
    const _this = tranferredGarbage.get(this);

    const iteratedValues = [];
    for (const [_, value] of _this.perKeyEffect.get(key).entries()) {
        iteratedValues.push(value);
    }

    return iteratedValues;
}