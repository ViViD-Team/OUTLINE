const { SvelteComponent } = require("svelte");
const NodeInputTether = require("./NodeInputTether");

/**
 * The functionality behind the grab (former input)
 * node.
 * 
 * @module ImportNodeTether
 */
class ImportNodeTether {

    /**
     * 
     * @param {String} label The label of the output tether.
     * @param {NodeInputTether[]} inputs The required inputs.
     * @param {String} id The output ID. Passed in by outline.
     * @param {Object} context The node context. Passed in by outline.
     * @param {SvelteComponent} tableRef A reference to the table.
     */
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