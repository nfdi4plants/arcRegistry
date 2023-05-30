const http = require("http");

/*
This module can be used to use the logger function in services of the ARC Metadata Registry.

Just copy the "Logger.js" into the project of the service and add
const logger = require('./PATH/Logger');

Afterwards log entries can be created by the method call
logger(SERVICE, DATE, MESSAGE, SEVERITY, ORIGINAL_REQUEST)
 */

module.exports = function (service, date, message, severity, originalRequest) {
    const logJSON = {
        service: service,
        date: date,
        severity: severity,
        message: message,
        originalRequest: originalRequest
    }

    const body = JSON.stringify(logJSON);

    const options = {
        hostname: 'arc_logger',
        port: 6000,
        path: '/registry/logs',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    };

    //Creates a POST request
    const req = http.request(options);

    //Invoked in case of an error during request
    req.on('error', (e) => {
        console.error(new Date() + " ERROR: " + e);
    });

    // log the messages on console. 
    //console.log(new Date() + body);
    
    req.end(body);
}