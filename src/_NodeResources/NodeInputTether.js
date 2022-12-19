class NodeInputTether {
    
    constructor(label) {
        this.label = label;
        this.connection = null;
    }

    getValue() {
        return new Promise((resolve, reject) => {
            if (this.connection === null) reject((this.label || "Unknown Tether") + " not connected");

            this.connection.fetchValue
                .then((value) => {resolve(value)})
                .catch((err) => (reject(err)));
        });
    }

    connect(otherEnd) {
        this.connection = otherEnd;
    }
}

module.exports = NodeInputTether;