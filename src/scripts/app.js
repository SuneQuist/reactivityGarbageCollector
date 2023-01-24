/**
 * Global Subscriber (running in background)
 */

const garbageInstance = new WeakMap();

function GlobalPrivateSubscriberGarbageCollector() {

    // # Private
    const _subsricbers = {
        instances: new Set(),
    }

    garbageInstance.set(this, _subsricbers);
}

/**
 * 
 * @param { Object } instance - Adds a subscriber/instance; 
 * @returns 
 */
GlobalPrivateSubscriberGarbageCollector.prototype.add = function(instance) {
    const _this = garbageInstance.get(this);

    if (_this.instances.has(instance)) { return; }

    _this.instances.add(instance);
}

/**
 * 
 * @param {*} instance  - Removes a subscriber/instance; 
 * @returns 
 */
GlobalPrivateSubscriberGarbageCollector.prototype.remove = function(instance) {
    const _this = garbageInstance.get(this);

    if (!_this.instances.has(instance)) { return; }

    _this.instances.delete(instance);
}

/**
 * 
 * @param {*} target 
 * @param {*} key 
 * @returns - Finds the target with or without a specific key attached;
 */
GlobalPrivateSubscriberGarbageCollector.prototype.lookup = function(target, key = null) {
    const _this = garbageInstance.get(this);

    for (let [_, instance] of _this.instances.entries()) {
        if (key) {
            if (target === instance.target && key === instance.currentKey) { return instance; }
        } else {
            if (target === instance.target) { return instance; }
        }
    }
}

/**
 * 
 * @param {*} target 
 * @param {*} currentInstance 
 */
GlobalPrivateSubscriberGarbageCollector.prototype.update = function(target, currentInstance) {
    const _this = garbageInstance.get(this);

    for (let [_, instance] of _this.instances.entries()) {
        if (target === instance.target) { accessGlobalFunction.remove(instance); }
    }

    accessGlobalFunction.add(currentInstance);
}

/** @returns - Access/Entry Point to Global Subscriber; */
const accessGlobalFunction = new GlobalPrivateSubscriberGarbageCollector();

/**
 * Single Subsricber Instance (The function being called)
 */

const tranferredGarbage = new WeakMap();

/**
 * @param { Object } target - Provide Proxy target from get or set;
 * @param { String } key - Provide Proxy key from get or set;
 */
function SubscribeToPrivateGarbageData(target, key) {
    if (!target || !key) { 
        throw new Error("You need to set the target- AND key parameter"); 
    }

    // # Private
    const _toBeGarbagedInformation = {
        target: target,
        currentKey: key,
        perKeyEffect: new Map(),
        self: this
    }

    tranferredGarbage.set(this, _toBeGarbagedInformation);
    
    this.addKeyPair();

    if (!accessGlobalFunction.lookup(target)) {
        accessGlobalFunction.add(_toBeGarbagedInformation);
    }
}

/**
 * @returns - void # Creates keypair set
 */
SubscribeToPrivateGarbageData.prototype.addKeyPair = function() {
    const _this = tranferredGarbage.get(this);

    const checkIfAnythingIsAlreadyThere = accessGlobalFunction.lookup(_this.target);

    if (checkIfAnythingIsAlreadyThere) {
        for (let [key, value] of checkIfAnythingIsAlreadyThere.perKeyEffect) {
            _this.perKeyEffect.set(key, value);
        }
        
        if (!checkIfAnythingIsAlreadyThere.perKeyEffect.get(_this.currentKey)) {
            _this.perKeyEffect.set(_this.currentKey, new Set());
        }
    } else {
        _this.perKeyEffect.set(_this.currentKey, new Set());
    }

    accessGlobalFunction.update(_this.target, _this);
}

/**
 * 
 * @param {*} effect - Effect to add to keyPair
 * @returns - void
 */
SubscribeToPrivateGarbageData.prototype.addEffect = function(effect) {
    const _this = tranferredGarbage.get(this);

    _this.perKeyEffect.get(_this.currentKey).add(effect);
    
    // Call keypair again to update local, call update to do it globallyh
    this.addKeyPair();
    accessGlobalFunction.update(_this.target, _this);
}

/**
 * @param {*} effect - Remove Effect
 */
SubscribeToPrivateGarbageData.prototype.removeEffect = function(effect) {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(_this.currentKey).entries()) {
        if (String(value) === String(effect)) {  _this.perKeyEffect.get(_this.currentKey).delete(effect); }
    }

    this.addKeyPair();
    accessGlobalFunction.update(_this.target, _this);
}

/**
 * @param {*} effect
 * @returns - Effect called for (equivalent to has());
 */
SubscribeToPrivateGarbageData.prototype.getEffect = function(effect) {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(_this.currentKey).entries()) {
        if (String(value) === String(effect)) { return effect; }
    }
}

/**
 * 
 * @returns - Execution of all functions in specific effect;
 */
SubscribeToPrivateGarbageData.prototype.iterateOverCallbacks = function() {
    const _this = tranferredGarbage.get(this);

    for (const [_, value] of _this.perKeyEffect.get(_this.currentKey).entries()) {
        if (typeof value === "function") { return value(); }
    }
}

/**
 * 
 * @returns - All values in specific effect;
 */
SubscribeToPrivateGarbageData.prototype.iterateOverValues = function() {
    const _this = tranferredGarbage.get(this);

    const iteratedValues = [];
    for (const [_, value] of _this.perKeyEffect.get(_this.currentKey).entries()) {
        iteratedValues.push(value);
    }

    return iteratedValues;
}


const sub = new SubscribeToPrivateGarbageData("fs", "s");
sub.addEffect("fs")
const gsub = new SubscribeToPrivateGarbageData("fs", "s");
gsub.addEffect("dsad")
const dsub = new SubscribeToPrivateGarbageData("fs", "d");
gsub.addEffect("fsaf")
dsub.addEffect("fs")
dsub.addEffect("ffss")
const asub = new SubscribeToPrivateGarbageData("fs", "s");
dsub.addEffect("ffsas")
asub.addEffect("dfsasad")
dsub.addEffect("ffsaas")

console.log(accessGlobalFunction.lookup("fs"))
console.log(accessGlobalFunction.remove(accessGlobalFunction.lookup("fs")))
console.log(accessGlobalFunction.lookup("fs"))