class NodeDataRoute {

    constructor(reqInputs, puts) {
        this.reqInputs = reqInputs;
        this.puts = puts;
    }

    async getInputs() {
        let valArr = Array(this.reqInputs.length).map(x => null);

        for (let i = 0; i < valArr.length; i++) {
            await this.reqInputs[i].getValue
                .then((value) => {valArr[i] = value});
        }

        return valArr;
    }

    processData() {
        return new Promise((resolve, reject) => {       
            this.getInputs().then((inputs) => {
                reject("Cannot use prototype node!");
            })
            .catch((reason) => {
                reject("Data Process Failed... (" + reason + ")");
            });
        });
    }
}

module.exports = NodeDataRoute;