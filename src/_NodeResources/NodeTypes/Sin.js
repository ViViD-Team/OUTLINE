const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SinNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
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
    
                if (!Array.isArray(a)) resolve(Math.sin(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.sin(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = SinNodeData;