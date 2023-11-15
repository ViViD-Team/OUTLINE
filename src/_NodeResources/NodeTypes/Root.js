const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class RootNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context),
            new NodeInputTether("n", context),
        ];
        let outputs = [
            new RootNodeDataOutput("Root", inputs, outputRefs[0], context),
        ];

        super("Root", inputs, outputs, rawNodeData);
    }
}


class RootNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                resolve(Math.pow(parseFloat(a), 1 / parseFloat(b)));
            });
        }
    }
}

module.exports = RootNodeData;