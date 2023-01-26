function placeholder(node) {
    if (node.attribute === "value") { node.node.value = node.key.key[node.targetProxy.name]; }
    if (node.attribute === "innerHTML") { node.node.innerHTML = node.key.key[node.targetProxy.name]; }
}

function change(node) {
    node.node.addEventListener("input", (e) => {
        node.targetProxy.setValue(e.target.value);
    });
}

const attributes = {
    0: {type: "$placeholder", change: "innerHTML", func: placeholder},
    1: {type: "@change", change: "value", func: change},
}

export { placeholder, change, attributes };