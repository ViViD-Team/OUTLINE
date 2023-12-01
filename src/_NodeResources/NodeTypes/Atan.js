const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class AtanNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new AtanNodeDataOutput("Atan.", inputs, outputRefs[0], context),
        ];

        super("Atan", inputs, outputs, rawNodeData);
    }
}


class AtanNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                if (!Array.isArray(a)) resolve(Math.atan(parseFloat(a)));
                else {
                    resolve(a.map(item => Math.atan(parseFloat(item))));
                }
            });
        }
    }
}

module.exports = AtanNodeData;