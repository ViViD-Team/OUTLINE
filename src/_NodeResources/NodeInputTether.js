class NodeInputTether {
    
    constructor(label) {
        this.label = label;
        this.connection = null;
    }

    getValue() {
        return new Promise(async (resolve, reject) => {
            if (this.connection === null) reject((this.label || "Unknown Tether") + " not connected");

            await this.connection.process()
                .then((value) => {resolve(value)})
                .catch((err) => (reject(err)));
        });
    }

    connect(otherEnd) {
        this.connection = otherEnd;
    }
}

module.exports = NodeInputTether;