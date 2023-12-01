const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class AcosNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new AcosNodeDataOutput("Acos.", inputs, outputRefs[0], context),
        ];

        super("Acos", inputs, outputs, rawNodeData);
    }
}


class AcosNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();

                if (Array.isArray(a)) {
                    a = a.map(item => Math.acos(parseFloat(item)));
                } else a = Math.acos(parseFloat(a));
    
                resolve(a);
            });
        }
    }
}

module.exports = AcosNodeData;