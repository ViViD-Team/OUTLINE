const NodeData = require("../NodeData");
const NodeInputTether = require("../NodeInputTether");
const NodeOutputTether = require("../NodeOutputTether");

class RootNodeData extends NodeData {

    constructor(outputRefs, context, rawNodeData) {
        let inputs = [
            new NodeInputTether("Num", context),
            new NodeInputTether("n", context),
        ];
        let outputs = [
            new RootNodeDataOutput("Root", inputs, outputRefs[0], context),
        ];

        super("Root", inputs, outputs, rawNodeData);
    }
}


class RootNodeDataOutput extends NodeOutputTether {

    constructor(reqInputs, puts, id, context) {
        super(reqInputs, puts, id, context);

        this.process = function() {
            return new Promise(async (resolve, reject) => {
                let a = await this.inputs[0].getValue();
                let b = await this.inputs[1].getValue();
    
                if (!Array.isArray(a) && !Array.isArray(b)) resolve(Math.pow(parseFloat(a), 1 / parseFloat(b)));
            
                if (Array.isArray(a) && Array.isArray(b)) {
                    let i = 0, out = [];

                    while (i < Math.max(a.length, b.length)) {
                        if (a[i] && b[i]) out[i] = Math.pow(parseFloat(a[i] || 0), 1 / parseFloat(b[i] || 1));
                        i++;
                    }

                    resolve(out);
                }

                if (Array.isArray(a)) {
                    resolve(a.map(item => Math.pow(parseFloat(item), 1 / parseFloat(b))));
                } else {
                    resolve(b.map(item => Math.pow(parseFloat(item), 1 / parseFloat(a))));
                }
            });
        }
    }
}

module.exports = RootNodeData;