const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class LnNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new LnNodeDataOutput("Ln", inputs, outputRefs[0], context),
        ];

        super("Ln", inputs, outputs, rawNodeData);
    }
}


class LnNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.log(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.log(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = LnNodeData;