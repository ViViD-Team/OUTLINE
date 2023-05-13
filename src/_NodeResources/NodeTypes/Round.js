const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class RoundNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context)
        ];
        let outputs = [
            new RoundNodeDataOutput("Rnd.", inputs, outputRefs[0], context),
        ];

        super("Round", inputs, outputs, rawNodeData);
    }
}


class RoundNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                resolve(Math.round(parseFloat(a)));
            });
        }
    }
}

module.exports = RoundNodeData;