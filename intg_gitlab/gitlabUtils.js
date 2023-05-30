const https = require('https');
const fs = require('fs');
const util = require('node:util');
const path = require('path');
const exec = util.promisify(require('node:child_process').exec);
const logger = require('./Logger');

module.exports = {
    /**
     * Creates a GET request via https (Port 443) to hostname + path.
     *
     * @param hostname
     * @param path
     * @returns {Promise<JSON>}
     */


    /*   get(hostname, path) {
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
             //      logger("arc_webhook", new Date(), JSON.stringify(e), "Error", {});
                   console.log(e);
                   reject(e);
               });

               // Mandatory
               req.end();
           });
       },

   */
    getRepoFiles(hostname, path, repoName) {
        return new Promise(function (resolve, reject) {
            const options = {
                hostname: hostname,
                port: 443,
                path: path,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': '2TrVTlijYsBR3W6Y5aPNgB:6uR1TIHhGbrCRI602Mbuqg'
                }
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
                //      logger("arc_webhook", new Date(), JSON.stringify(e), "Error", {});
                console.log(e);
                reject(e);
            });

            // Mandatory
            req.end();
        });
    },

    downloadFile(hostname, path, fullPath) {
        return new Promise(function (resolve, reject) {
            const options = {
                hostname: hostname,
                port: 443,
                path: path,
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                let index = fullPath.lastIndexOf("/");
                let dirPath = fullPath.slice(0, index);
                //               fs.mkdirSync(dirPath, {recursive: true});
                console.log('fullPath is: ' + fullPath);
                const file = fs.createWriteStream(fullPath).on("error", (err) => { console.log('errored in opening the path' + fullPath + 'Error msg is: ' + err) });
                res.pipe(file);
                file.on("finish", () => {
                    file.close();
                    resolve("Downloaded xlsx file from " + fullPath);
                });

            });

            // Invoked by an error
            req.on('error', (e) => {
                console.log(e);
                reject(e);
            });

            // Mandatory
            req.end();
        });
    },

    executeCommand(repoName) {
        return new Promise(function (resolve, reject) {
            //let cmd = 'cd "' + repoName + '" && ./arc export --output "' + repoName + '.json"';
            let cmd = 'cd "' + repoName + '" && /usr/src/app/arc export --output "' + repoName + '.json"';
            exec(cmd).then((stdout, stderr) => {
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
            }).then(() => resolve("executeCommand() - Executed successfully.")).catch((e) => console.log(e));
        })

    },

/*  why are we CURL from inside the application?
    uploadToDB(path) {
        return new Promise(function (resolve, reject) {
            let command = "curl -X POST 'http://193.196.29.77:9200/investigation/_doc/' -H 'Content-Type: application/json' -d @" + path + " -u elastic:2TrVTlijYsBR3W6Y5aPNgB";
            exec(command).then((stdout, stderr) => {
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
                if (stdout.stdout.indexOf('error') != -1) {
                    logger("arc_es_data", new Date(), 'Error in uploading data', "Error", stdout);
                } else {
                    logger("arc_es_data", new Date(), 'Data uploaded successfully', "Info", stdout);
                }
            }).then(() => resolve("uploadToDB() - Executed successfully.")).catch((e) => console.log(e));
        });
    }  */
}