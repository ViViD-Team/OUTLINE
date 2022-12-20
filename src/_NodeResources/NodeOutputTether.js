class NodeOutputTether {

    constructor(label, inputs) {
        this.label = label;
        this.inputs = inputs;
    }

    process() {
        return new Promise(async (resolve, reject) => {
            // Logic here
            reject((this.label || "Unknown Tether") + ": Prototype Logic");
        });
    }
}

module.exports = NodeOutputTether;