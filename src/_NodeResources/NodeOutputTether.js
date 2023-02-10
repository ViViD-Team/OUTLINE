class NodeOutputTether {

    constructor(label, inputs, id, context) {
        this.label = label;
        this.inputs = inputs;

        this.id = id;

        // Subscribe to context
        this.ctx = context;
        context[id] = this;

        this.superNode = null;

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                // Logic here
                reject((this.label || "Unknown Tether") + ": Prototype Logic");
            });
        }
    }

    dismount() {
        delete this.ctx[this.id];
    }
}

module.exports = NodeOutputTether;