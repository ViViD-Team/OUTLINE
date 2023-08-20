const NodeInputTether = require("./NodeInputTether");

/**
 * Superclass for output tethers for nodes.
 * Also contains the logic for processing the inputs.
 * @module NodeOutputTether
 */
class NodeOutputTether {

    /**
     * Superconstructor for output tethers with custom
     * behaviour.
     * 
     * @param {String} label The label of the output.
     * @param {NodeInputTether[]} inputs The input tethers whose values are necessary for the output.
     * @param {String} id The ID of the output. Passed in by outline.
     * @param {String} context The context of the node system. Passed in by outline.
     */
    constructor(label, inputs, id, context) {
        this.label = label;
        this.inputs = inputs;

        this.id = id;

        // Subscribe to context
        this.ctx = context;
        context[id] = this;

        this.superNode = null;
    }

    /**
     * Gets the required input's values;
     * Calculates the output value;
     * Resolves the promise;
     * @returns {Promise}
     */
    process() {
        return new Promise(async (resolve, reject) => {
            // Logic here
            reject((this.label || "Unknown Tether") + ": Prototype Logic");
        });
    }

    /**
     * Removes the output from the node context.
     */
    dismount() {
        delete this.ctx[this.id];
    }
}

module.exports = NodeOutputTether;