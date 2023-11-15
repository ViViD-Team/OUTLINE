const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class PowerNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Base", context),
            new NodeInputTether("Exp.", context),
        ];
        let outputs = [
            new PowerNodeDataOutput("Pow.", inputs, outputRefs[0], context),
        ];

        super("Power", inputs, outputs, rawNodeData);
    }
}


class PowerNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                resolve(Math.pow(parseFloat(a), parseFloat(b)));
            });
        }
    }
}

module.exports = PowerNodeData;