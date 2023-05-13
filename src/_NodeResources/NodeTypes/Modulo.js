const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class ModuloNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context),
            new NodeInputTether("B", context),
        ];
        let outputs = [
            new ModuloNodeDataOutput("Mod.", inputs, outputRefs[0], context),
        ];

        super("Modulo", inputs, outputs, rawNodeData);
    }
}


class ModuloNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                resolve(parseFloat(a) % parseFloat(b));
            });
        }
    }
}

module.exports = ModuloNodeData;