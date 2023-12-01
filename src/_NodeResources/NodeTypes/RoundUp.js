const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class RoundUpNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new RoundUpNodeDataOutput("Ceil.", inputs, outputRefs[0], context),
        ];

        super("RoundUp", inputs, outputs, rawNodeData);
    }
}


class RoundUpNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.ceil(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.ceil(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = RoundUpNodeData;