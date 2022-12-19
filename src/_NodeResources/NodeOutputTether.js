class NodeOutputTether {

    constructor(label) {
        this.label = label;
        this.processCall = null;
    }

    fetchValue() {
        return new Promise((resolve, reject) => {
            if (this.processCall === null) reject((this.label || "Unknown") + ": Unassigned output");
            this.processCall
                .then((value) => resolve(value))
                .catch((err) => reject(err));
        });
    }
}

module.exports = NodeOutputTether;