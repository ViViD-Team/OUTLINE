const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SquareNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new SquareNodeDataOutput("Sq.", inputs, outputRefs[0], context),
        ];

        super("Square", inputs, outputs, rawNodeData);
    }
}


class SquareNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.pow(parseFloat(a), 2));
                else {
                    resolve(a.map(item => Math.pow(parseFloat(item), 2)));
                }
            });
        }
    }
}

module.exports = SquareNodeData;