const http = require("http");
const dbConnectorHOSTNAME = 'arc_db_es';
const dbConnectorPORT = 5000;

module.exports = {

    /**
     * Creates a POST request to the database connector and invokes the creation of an ARC document.
     *
     * @param arcObject ARC in JSON format
     * @returns {Promise<String>}
     */
    createLatestARC(arcObject) {

        return new Promise(function (resolve, reject) {
            let body = JSON.stringify(arcObject);

            const options = {
                hostname: dbConnectorHOSTNAME,
                port: dbConnectorPORT,
                path: '/registry/arcs/' + encodeURIComponent(arcObject.arcID),
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            };

            //Creates a POST request to the ElasticSearch connector
            const req = http.request(options, (res) => {

                res.on('data', (d) => {
                    resolve(res.statusCode + ' ' + res.statusMessage);
                });
            });

            //Invoked in case of an error during request
            req.on('error', (e) => {
                reject(e);
            });

            req.end(body);
        });
    },

    /**
     * Creates a GET request to the database connector and invokes the search of an ARC document.
     *
     * @param arcID
     * @param gitLabHost
     * @returns {Promise<JSON>}
     */
    getLatestARCFromHost(arcID, gitLabHost) {
        return new Promise(function (resolve, reject) {
            const options = {
                hostname: dbConnectorHOSTNAME,
                port: dbConnectorPORT,
                path: '/registry/arcs/' + encodeURIComponent(gitLabHost) + '/' + encodeURIComponent(arcID),
                method: 'GET'
            };
            //Creates a GET request to the GitLab server
            const req = http.request(options, (res) => {
                let chunks = [];
                res.on('data', (d) => {
                    chunks.push(d);
                });

                res.on("end", function () {
                    const data = Buffer.concat(chunks);
                    resolve(JSON.parse(data));
                });
            });
            //Invoked in case of an error during request
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    },

    /**
     * Creates a POST request to the database connector and invokes the creation of an Investigation document.
     *
     * @param arcID
     * @param arcVersion
     * @param gitLabHost
     * @param gitLabHostLocation
     * @param reqJSON
     * @returns {Promise<String>}
     */
    createInvestigation(arcID, arcVersion, gitLabHost, gitLabHostLocation, reqJSON) {
        reqJSON.arcID = arcID;
        reqJSON.arcVersion = arcVersion;
        reqJSON.gitLabHost = gitLabHost;
        reqJSON.gitLabHostLocation = gitLabHostLocation;

        return new Promise(function (resolve, reject) {
            let body = JSON.stringify(reqJSON);

            const options = {
                hostname: dbConnectorHOSTNAME,
                port: dbConnectorPORT,
                path: '/registry/arcs/' + encodeURIComponent(gitLabHost) + '/' + encodeURIComponent(gitLabHostLocation) + '/' + encodeURIComponent(arcID) + '/' + arcVersion + '/investigation',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            };

            //Creates a POST request to the ElasticSearch connector
            const req = http.request(options, (res) => {
                res.on('data', (d) => {
                    resolve(res.statusCode + '\n' + res.statusMessage);
                });
            });

            //Invoked in case of an error during request
            req.on('error', (e) => {
                reject(e);
            });

            req.end(body);
        });
    },

    /**
     * Creates a POST request to the database connector and invokes the creation of an ARC document.
     *
     * @returns {Promise<String>}
     * @param paramObject
     */
    createParameterValues(paramObject) {
        return new Promise(function (resolve, reject) {
            let body = JSON.stringify(paramObject);

            const options = {
                hostname: dbConnectorHOSTNAME,
                port: dbConnectorPORT,
                path: '/registry/params',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            };

            //Creates a POST request to the ElasticSearch connector
            const req = http.request(options, (res) => {

                res.on('data', (d) => {
                    resolve(res.statusCode + ' ' + res.statusMessage);
                });
            });

            //Invoked in case of an error during request
            req.on('error', (e) => {
                reject(e);
            });

            req.end(body);
        });
    }
}