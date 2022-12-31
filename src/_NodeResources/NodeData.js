class NodeData {

    constructor(title, inputs, outputs, rawNodeData) {
        this.title = title;

        this.inputs = inputs;
        this.outputs = outputs;

        this.rawNodeData = rawNodeData;

        this.outputs.forEach((o) => {
            o.superNode = this;
        });
    }
}

module.exports = NodeData;