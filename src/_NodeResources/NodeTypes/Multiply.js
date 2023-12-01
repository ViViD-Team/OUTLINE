const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class MultiplyNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context),
            new NodeInputTether("B", context),
        ];
        let outputs = [
            new MultiplyNodeDataOutput("Prod.", inputs, outputRefs[0], context),
        ];

        super("Multiply", inputs, outputs, rawNodeData);
    }
}


class MultiplyNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                if (!Array.isArray(a) && !Array.isArray(b)) resolve(parseFloat(a) * parseFloat(b));
            
                if (Array.isArray(a) && Array.isArray(b)) {
                    let i = 0, out = [];

                    while (i < Math.max(a.length, b.length)) {
                        if (a[i] && b[i]) out[i] = parseFloat(a[i] || 0) * parseFloat(b[i] || 0);
                        i++;
                    }

                    resolve(out);
                }

                if (Array.isArray(a)) {
                    resolve(a.map(item => parseFloat(item) * parseFloat(b)));
                } else {
                    resolve(b.map(item => parseFloat(item) * parseFloat(a)));
                }
            });
        }
    }
}

module.exports = MultiplyNodeData;