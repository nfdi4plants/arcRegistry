// Source: https://betterprogramming.pub/how-to-handle-docker-secrets-in-node-js-3aa04d5bf46e
const fs = require('fs');
const logger = require('./Logger');

const dockerSecret = {};

dockerSecret.read = function read(secretName) {
    try {
        return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`An error occurred while trying to read the secret: ${secretName}. Err: ${err}`);
            logger("arc_db_connector", new Date(), `An error occurred while trying to read the secret: ${secretName}. Err: ` + JSON.stringify(err), "Error", {});
        } else {
            console.debug(`Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`);
            logger("arc_db_connector", new Date(), `Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ` + JSON.stringify(err), "Error", {});
        }
        return false;
    }
};

module.exports = dockerSecret;