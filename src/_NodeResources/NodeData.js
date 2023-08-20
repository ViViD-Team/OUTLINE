const NodeInputTether = require("./NodeInputTether");

/**
 * Container for all data associated with a node.
 * @module NodeData
 */
class NodeData {

    /**
     * Superconstructor for custom nodes. 
     * 
     * @param {String} title The title of the node.
     * @param {NodeInputTether[]} inputs The input tethers of the node.
     * @param {NodeOutputTether[]} outputs The output tethers of the node.
     * @param {Object} rawNodeData The raw json data of the node. Passed in by outline.
     */
    constructor(title, inputs, outputs, rawNodeData) {
        this.title = title;

        this.inputs = inputs;
        this.outputs = outputs;

        this.rawNodeData = rawNodeData;

        this.outputs.forEach((o) => {
            o.superNode = this;
        });

        this.inputs.forEach((i) => {
            i.superNode = this;
        });
    }
}

module.exports = NodeData;