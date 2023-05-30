const https = require('https');
const logger = require('./Logger');

module.exports = function (hostname, path, callback) {
    const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET'
    };

    //Creates a GET request to the GitLab server
    const req = https.request(options, (res) => {
        res.on('data', (d) => {
            const requestBodyJSON = JSON.parse(d);
            callback(null, JSON.parse(Buffer.from(requestBodyJSON.content, 'base64').toString()));
        });
    });

    //Invoked in case of an error during request
    req.on('error', (e) => {
        logger("arc_intg_gitlab", new Date(), JSON.stringify(e), "Error", {});
        return callback(e);
    });

    req.end();
}