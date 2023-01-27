function placeholder(node) {
    if (node.attribute === "value") { node.elm.value = getToProxyValue(node); }
    if (node.attribute === "innerHTML") { node.elm.innerHTML = getToProxyValue(node); }
}

function change(node) {
    if (node.attribute === "value" && node.self) { node.elm.value = getToProxyValue(node); }
    
    node.elm.addEventListener("input", (e) => {
        if (node.targetProxy) {
            node.targetProxy.setValue(e.target.value);
        }
    });
}

function custom(node) {
    // const findProxy = getToProxyValue(node);
    // if (findProxy) {
    //     const func = new Function(findProxy.join(","), node.value)
    //     console.log(func)
    // }
    // if (node.value) {

    //     if (Array.isArray(findProxy)) {
    //         let arr = [];
    //         let checkReg = node?.value;
    //         for (let i = 0; i < findProxy.length; i++) {
    //             let reg = new RegExp(`(${findProxy[i]})`, "gi");
    //             const proxy = node.stack.get(findProxy[i]).self[findProxy[i]];

    //             console.log(`"${(JSON.stringify(proxy))}"`)
    //             checkReg = checkReg.replace(reg, (Array.isArray(proxy) ? `[${[...proxy]}]` : proxy === "" ? `"${proxy}"` : Object.assign(proxy).length > 0 ? `"${(JSON.stringify(proxy))}"` : proxy));
    //             arr.push(node.stack.get(findProxy[i]).self[findProxy[i]])
    //             // if (checkReg) { arr.push(...checkReg); }
    //         }
    //         console.log(arr,checkReg)
    //     }
    // }
}

function getToProxyValue(node) {
    if (node.targetProxy && node.self) { return node.self.key[node.targetProxy.name]; };

    if (node.value) {
        const stack = node.stack;
        let arr = [];
        for (let key of stack) {
            let reg = new RegExp(`(${key[0]})`, "gi");
            const checkReg = node?.value?.match(reg);
            if (checkReg) { arr.push(...checkReg); }
        }

        if (arr.length > 0) {
            return arr;
        }
    }

    return null;
}

const attributes = [
    {type: "$placeholder", reactive: false, change: "innerHTML", func: placeholder},
    {type: "@change", reactive: true, change: "value", func: change},
    {type: "@custom", reactive: true, change: "", func: custom}
]

export { placeholder, change, custom, attributes };