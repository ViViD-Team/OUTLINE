const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class DivisionNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context),
            new NodeInputTether("Div.", context),
        ];
        let outputs = [
            new DivisionNodeDataOutput("Frac.", inputs, outputRefs[0], context),
        ];

        super("Divide", inputs, outputs, rawNodeData);
    }
}


class DivisionNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                resolve(parseFloat(a) / parseFloat(b));
            });
        }
    }
}

module.exports = DivisionNodeData;