const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class SumNodeData extends NodeData {

    constructor(posX, posY) {
        let inputs = [
            new NodeInputTether("A"),
            new NodeInputTether("B"),
        ];
        let outputs = [
            new SumNodeDataOutput("Sum", inputs),
        ];

        super("Sum", inputs, outputs, posX, posY);
    }
}


class SumNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts) {
        super(reqInputs, puts);
    }

    process() {
        return new Promise(async (resolve, reject) => {
            let a = await this.inputs[0].getValue();
            let b = await this.inputs[1].getValue();

            resolve(a + b);
        });
    }
}

module.exports = SumNodeData;