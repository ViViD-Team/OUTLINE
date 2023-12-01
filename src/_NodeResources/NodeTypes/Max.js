const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class MaxNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("A", context),
            new NodeInputTether("B", context),
        ];
        let outputs = [
            new MaxNodeDataOutput("Max", inputs, outputRefs[0], context),
        ];

        super("Max", inputs, outputs, rawNodeData);
    }
}


class MaxNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                if (!Array.isArray(a) && !Array.isArray(b)) resolve(Math.max(parseFloat(a), parseFloat(b)));
            
                if (Array.isArray(a) && Array.isArray(b)) {
                    let i = 0, out = [];

                    while (i < Math.max(a.length, b.length)) {
                        if (a[i] && b[i]) out[i] = Math.max(parseFloat(a[i] || 0), parseFloat(b[i] || 1));
                        i++;
                    }

                    resolve(out);
                }

                if (Array.isArray(a)) {
                    resolve(a.map(item => Math.max(parseFloat(item), parseFloat(b))));
                } else {
                    resolve(b.map(item => Math.max(parseFloat(item), parseFloat(a))));
                }
            });
        }
    }
}

module.exports = MaxNodeData;