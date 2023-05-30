const https = require('https');
const logger = require('./Logger');

module.exports = {
    /**
     * Creates a GET request via https (Port 443) to hostname + path.
     *
     * @param hostname
     * @param path
     * @returns {Promise<JSON>}
     */
    get(hostname, path) {
        return new Promise(function (resolve, reject) {
            const options = {
                hostname: hostname,
                port: 443,
                path: path,
                method: 'GET'
            };

            // Creates a https request
            const req = https.request(options, (res) => {
                let chunks = [];

                res.on('data', (d) => {
                    chunks.push(d)
                });

                res.on("end", function () {
                    const data = Buffer.concat(chunks);
                    resolve(JSON.parse(data));
                });
            });

            // Invoked by an error
            req.on('error', (e) => {
                logger("arc_webhook", new Date(), JSON.stringify(e), "Error", {});
                reject(e);
            });

            // Mandatory
            req.end();
        });
    }
}