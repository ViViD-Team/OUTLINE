const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class CosNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new CosNodeDataOutput("Cos.", inputs, outputRefs[0], context),
        ];

        super("Cos", inputs, outputs, rawNodeData);
    }
}


class CosNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.cos(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.cos(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = CosNodeData;