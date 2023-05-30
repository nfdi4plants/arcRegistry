const express = require("express");
const bodyParser = require("body-parser");
const createIfNotExists = require('./CreateIfNotExists');
const {Client} = require('@elastic/elasticsearch');
const ElasticSearchConnector = require('./ElasticSearchConnector');
const secrets = require("./secrets");
const logger = require('./Logger');
const {request} = require("express");

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
const esConnector = new ElasticSearchConnector(client);

// Creates the indices 'metadata' and 'investigation' if not exists
createIfNotExists(client).catch(err => {
    console.error(new Date() + " Error: " + err);
    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
});

// Parse incoming request bodies to JSON object
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.json());


// Create latest ARC
app.post("/registry/arcs/:arcID", function (req, res) {
    esConnector.createLatestARC(req)
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Create specific ARC
app.post("/registry/arcs/:arcID/:arcVersion", function (req, res) {
    esConnector.createSpecificARC(req)
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Create investigation
app.post("/registry/arcs/:gitLabHost/:gitLabHostLocation/:arcID/:arcVersion/investigation", function (req, res) {
    esConnector.createInvestigation(req)
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Create parameter values
app.post("/registry/params", function (req, res) {
    esConnector.createParameterValues(req)
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});


// Get parameter values by ARC ID
app.get("/registry/params/:gitLabHost/:arcID/:arcVersion", function (req, res) {
    esConnector.getAllParameterValues(req.params.gitLabHost, req.params.arcID, req.params.arcVersion)
        .then((result) => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Get parameter values by ARC ID and parameter value type
app.get("/registry/params/:gitLabHost/:arcID/:arcVersion/:type", function (req, res) {
    esConnector.getAllParameterValuesByType(req.params.gitLabHost, req.params.arcID, req.params.arcVersion, req.params.type)
        .then((result) => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});


app.get("/registry/arcs/:arcID", function (req, res) {
    esConnector.getLatestARC(req.params.arcID)
        .then((result) => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

app.get("/registry/arcs/:gitLabHost/:arcID", function (req, res) {
    esConnector.getLatestARCFromHost(req.params.arcID, req.params.gitLabHost)
        .then((result) => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

//app.get("/registry/arcs/:arcID/:arcVersion", function (req, res) {
//    esConnector.getSpecificARC(req.params.arcID, req.params.arcVersion)
//        .then(result => res.status(200).send(result))
//        .catch(err => {
//            res.status(400).send(err);
//            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
//        });
//});

app.get("/registry/arcs/:gitLabHost/:arcID/:arcVersion", function (req, res) {
    esConnector.getSpecificARCFromHost(req.params.arcID, req.params.arcVersion, req.params.gitLabHost)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Delete specific ARC
app.delete("/registry/arcs/:gitLabHost/:arcID/:arcVersion", function (req, res) {
    esConnector.deleteSpecificARCFromHost(req.params.arcID, req.params.arcVersion, req.params.gitLabHost)
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Get investigation
//app.get("/registry/arcs/:arcID/:arcVersion/investigation", function (req, res) {
//    esConnector.getInvestigation(req.params.arcID, req.params.arcVersion)
//        .then(result => res.status(200).send(result))
//        .catch(err => {
//            res.status(400).send(err);
//            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
//        });
//});


// Get investigation
app.get("/registry/arcs/:gitLabHost/:arcID/:arcVersion/investigation", function (req, res) {
    esConnector.getInvestigationFromHost(req.params.arcID, req.params.arcVersion, req.params.gitLabHost)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Delete investigation
app.delete("/registry/arcs/:gitLabHost/:arcID/:arcVersion/investigation", function (req, res) {
    esConnector.deleteInvestigationFromHost(req.params.arcID, req.params.arcVersion, req.params.gitLabHost)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Get differences between two arcVersions
app.get("/registry/arcs/:arcID/:arcVersion1/:arcVersion2", function (req, res) {
    esConnector.getDifferences(req.params.arcID, req.params.arcVersion1, req.params.arcVersion2)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search parameters
app.get("/registry/params", function (req, res) {
    esConnector.searchParams(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search studies
app.get("/registry/studies", function (req, res) {
    esConnector.searchStudies(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search investigations
app.get("/registry/investigations", function (req, res) {
    esConnector.searchInvestigation(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search persons
app.get("/registry/persons", function (req, res) {
    esConnector.searchPersons(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search publications
app.get("/registry/publications", function (req, res) {
    esConnector.searchPublications(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search ARCs
app.get("/registry/arcs", function (req, res) {
    esConnector.searchARCs(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// Search assays
app.get("/registry/assays", function (req, res) {
    esConnector.searchAssays(req.query)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

// ISAquery
app.post("/registry/query", function (req, res) {
    esConnector.isaQuery(req)
        .then(result => res.status(200).send(result))
        .catch(err => {
            res.status(400).send(err);
            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", req.body);
        });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
    logger("arc_db_es", new Date(), "Service arc_db_es started on port 5000.", "Info", {});
});





