const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SinNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context)
        ];
        let outputs = [
            new SinNodeDataOutput("Sin.", inputs, outputRefs[0], context),
        ];

        super("Sin", inputs, outputs, rawNodeData);
    }
}


class SinNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                resolve(Math.sin(parseFloat(a)));
            });
        }
    }
}

module.exports = SinNodeData;