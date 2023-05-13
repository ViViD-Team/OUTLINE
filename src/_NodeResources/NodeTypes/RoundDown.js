const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class RoundDownNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context)
        ];
        let outputs = [
            new RoundDownNodeDataOutput("Floor", inputs, outputRefs[0], context),
        ];

        super("RoundDown", inputs, outputs, rawNodeData);
    }
}


class RoundDownNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                resolve(Math.floor(parseFloat(a)));
            });
        }
    }
}

module.exports = RoundDownNodeData;