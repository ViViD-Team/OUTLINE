/**
 * Input tether for nodes.
 * @module NodeInputTether
 */
class NodeInputTether {
    
    /**
     * Creates a new input.
     * 
     * @param {String} label The label of the input.
     * @param {Object} context The context of the node system. Passed in by outline.
     */
    constructor(label, context) {
        this.label = label;
        this.connection = null;

        this.context = context;

        this.superNode = null;
    }

    /**
     * Calls the process() function on connected output.
     * 
     * @returns {Promise}
     */
    getValue() {
        return new Promise(async (resolve, reject) => {
            if (this.connection === null) reject((this.label || "Unknown Tether") + " not connected");

            let output = this.context[this.connection];

            await output.process()
                .then((value) => {resolve(value)})
                .catch((err) => {reject(err)});
        });
    }

    /**
     * Connects the input to an output.
     * 
     * @param {String} otherEnd The output ID of the output to be connected.
     */
    connect(otherEnd) {
        this.connection = otherEnd;
    }
}

module.exports = NodeInputTether;