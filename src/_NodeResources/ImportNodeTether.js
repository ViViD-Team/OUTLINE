class ImportNodeTether {

    constructor(label, inputs, id, context, tableRef) {
        this.label = label;
        this.inputs = inputs;

        this.id = id;

        this.tableRef = tableRef;

        // Subscribe to context
        this.ctx = context;
        context[id] = this;

        this.superNode = null;

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                // Logic here
                resolve(this.tableRef)
            });
        }
    }

    dismount() {
        delete this.ctx[this.id];
    }
}

module.exports = ImportNodeTether;