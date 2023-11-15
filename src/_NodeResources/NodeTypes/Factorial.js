const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class FactorialNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context)
        ];
        let outputs = [
            new FactorialNodeDataOutput("Fact.", inputs, outputRefs[0], context),
        ];

        super("Factorial", inputs, outputs, rawNodeData);
    }
}


class FactorialNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
    
                resolve(factorialize(parseFloat(a)));
            });
        }
    }
}

function factorialize(num) {
    if (num <= 0) {return 1}
    return (num * factorialize(num - 1))
}

module.exports = FactorialNodeData;