// Source: https://betterprogramming.pub/how-to-handle-docker-secrets-in-node-js-3aa04d5bf46e
const fs = require('fs');

const dockerSecret = {};

dockerSecret.read = function read(secretName) {
    try {
        return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8');
    } catch(err) {
        if (err.code !== 'ENOENT') {
            console.error(`An error occurred while trying to read the secret: ${secretName}. Err: ${err}`);
        } else {
            console.debug(`Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`);
        }
        return false;
    }
};

module.exports = dockerSecret;