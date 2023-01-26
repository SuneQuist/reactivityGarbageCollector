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
 * @param {*} checkForKey
 * @returns - Finds the target with or without a specific key attached;
 */
GlobalPrivateSubscriberGarbageCollector.prototype.lookup = function(target, checkForKey = null) {
    const _this = garbageInstance.get(this);

    for (let [_, instance] of _this.instances.entries()) {
        if (checkForKey) {
            for (let [key, _] of instance.perKeyEffect) {
                if (target === instance.target && key === checkForKey) { return instance; }
            }
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
export const accessGlobalFunction = new GlobalPrivateSubscriberGarbageCollector();