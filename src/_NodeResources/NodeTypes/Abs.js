const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class AbsNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new AbsNodeDataOutput("Abs.", inputs, outputRefs[0], context),
        ];

        super("Abs", inputs, outputs, rawNodeData);
    }
}


class AbsNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();

                if (Array.isArray(a)) {
                    a = a.map(item => Math.abs(parseFloat(item)));
                } else a = Math.abs(parseFloat(a));
    
                resolve(a);
            });
        }
    }
}

module.exports = AbsNodeData;