const express = require("express");
const bodyParser = require("body-parser");
const getter = require("./get");
const setter = require("./set");
const createIfNotExists = require('./CreateIfNotExists');
const {Client} = require('@elastic/elasticsearch');
const secrets = require("./secrets");

/*
This is the logger service of the ARC Metadata Registry.
The interface defines two methods: Set and Get.
Please only modify "set.js" and "get.js".

For more information about the interface, visit https://arc-metadata-registry.readthedocs.io/en/latest/
 */

const app = express();

const esHOSTNAME = 'arc_es';
const esPORT = 9200;
const esPassword = secrets.read('elasticPassword');

const client = new Client({
    node: 'http://' + esHOSTNAME + ':' + esPORT,
    auth: {
        username: 'elastic',
        password: esPassword
    }
});

// Creates the index 'logs' if not exists
createIfNotExists(client).catch(err => console.error(err));

// Parse incoming request bodies to JSON object
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.json());

// Defines the set interface
app.post("/registry/logs", function (req, res) {
    setter(client, req)
        .then(() => console.log())
        .catch(err => {
            res.status(400).send(err);
            console.error(new Date() + " Error: " + err);
        });
});

// Defines the get interface
app.get("/registry/logs", function (req, res) {
    getter(client, req)
        .then(log => res.status(200).send(log))
        .catch(err => {
            res.status(400).send(err);
            console.error(new Date() + " Error: " + err);
        });
});

app.listen(6000, () => {
    console.log(new Date() + " INFO: Logger-Server running on port 6000");
});