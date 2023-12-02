const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SumNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Batch", context)
        ];
        let outputs = [
            new SumNodeDataOutput("Sum", inputs, outputRefs[0], context),
        ];

        super("Sum", inputs, outputs, rawNodeData);
    }
}


class SumNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();

                if (!Array.isArray(a)) reject("Only batches are valid inputs!");

                let sum = 0;

                a.forEach(item => {
                    sum += parseFloat(item) || 0;
                });
    
                resolve(sum);
            });
        }
    }
}

module.exports = SumNodeData;