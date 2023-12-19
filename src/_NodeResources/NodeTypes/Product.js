const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class ProductNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Batch", context)
        ];
        let outputs = [
            new ProductNodeDataOutput("Prod.", inputs, outputRefs[0], context),
        ];

        super("Product", inputs, outputs, rawNodeData);
    }
}


class ProductNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();

                if (!Array.isArray(a)) reject("Only batches are valid inputs!");

                let prod = 1;

                a.forEach(item => {
                    prod *= parseFloat(item) || 1;
                });
    
                resolve(prod);
            });
        }
    }
}

module.exports = ProductNodeData;