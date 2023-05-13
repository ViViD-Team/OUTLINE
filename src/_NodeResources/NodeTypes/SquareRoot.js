const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SquareRootNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context)
        ];
        let outputs = [
            new SquareRootNodeDataOutput("Sqrt.", inputs, outputRefs[0], context),
        ];

        super("SquareRoot", inputs, outputs, rawNodeData);
    }
}


class SquareRootNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                resolve(Math.sqrt(parseFloat(a)));
            });
        }
    }
}

module.exports = SquareRootNodeData;