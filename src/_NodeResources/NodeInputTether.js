class NodeInputTether {
    
    constructor(label, context) {
        this.label = label;
        this.connection = null;

        this.context = context;

        this.superNode = null;
    }

    getValue() {
        return new Promise(async (resolve, reject) => {
            if (this.connection === null) reject((this.label || "Unknown Tether") + " not connected");

            let output = this.context[this.connection];

            await output.process()
                .then((value) => {resolve(value)})
                .catch((err) => {reject(err)});
        });
    }

    connect(otherEnd) {
        this.connection = otherEnd;
    }
}

module.exports = NodeInputTether;