const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class AsinNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new AsinNodeDataOutput("Asin.", inputs, outputRefs[0], context),
        ];

        super("Asin", inputs, outputs, rawNodeData);
    }
}


class AsinNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.asin(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.asin(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = AsinNodeData;