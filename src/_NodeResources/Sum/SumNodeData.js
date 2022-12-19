const NodeData = require("@nodeResources/NodeData");
const NodeInputTether = require("@nodeResources/NodeInputTether");
const NodeOutputTether = require("@nodeResources/NodeOutputTether");
const NodeDataRoute = require("@nodeResources/NodeDataRoute");

class SumNodeData extends NodeData {

    constructor() {
        let inputs = [
            new NodeInputTether("A"),
            new NodeInputTether("B"),
        ];
        let outputs = [
            new NodeOutputTether("Sum"),
        ];

        super("Sum", inputs, outputs, [
            new SumNodeDataRoute(inputs, outputs[0])
        ]);
    }
}


class SumNodeDataRoute extends NodeDataRoute {

    constructor(reqInputs, puts) {
        super(reqInputs, puts);
    }

    processData() {
        return new Promise((resolve, reject) => {       
            this.getInputs().then((inputs) => {
                resolve(inputs[0] + inputs[1]);
            })
            .catch((reason) => {
                reject("Data Process Failed... (" + reason + ")");
            });
        });
    }
}

module.exports = SumNodeData;