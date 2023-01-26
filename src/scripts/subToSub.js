import { SubscribeToPrivateGarbageData } from "./suscriberToGlobalGarbageCollector.js";
import { globalGarbageCollector } from "./globalGarbageCollector.js";

export function Subscriber(target) {
    let currentSubcriber = null;
    if (globalGarbageCollector.lookup(target)) {
        currentSubcriber = globalGarbageCollector.lookup(target).self;
    } else {
        currentSubcriber = new SubscribeToPrivateGarbageData(target);
    }

    return currentSubcriber;
}

function track(target, key) {
    let lookForKeyToTrack = null;

    if (globalGarbageCollector.lookup(target.getSelf(), key)) { lookForKeyToTrack = target.getKey(key); }
    else { lookForKeyToTrack = target.addNewKey(key); }

    return lookForKeyToTrack;
}

function trigger(target, key) {
    if (globalGarbageCollector.lookup(target.getSelf(), key)) { target.iterateOverCallbacks(key) };
}

export function createReactiveProxy(target, key, value) {
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