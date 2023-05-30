'use strict';
const HashMap = require('hashmap');
const logger = require('./Logger');
const parser = require('./parseQuery');
const AnyOfSolution = require('./anyOfSolver')
const AnyOfSolutionInstance = new AnyOfSolution();

class ElasticSearchConnector {
    /**
     * @param esClient ElasticSearch client instance
     */
    constructor(esClient) {
        this.esClient = esClient;
    }

    /**
     * Returns the latest arcVersion of an ARC.
     *
     * @param arcID
     * @param gitLabHost
     * @returns {Promise<JSON>}
     */
    getLatestARCFromHost(arcID, gitLabHost) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'metadata',
                size: 1,
                body: {
                    sort: [{"gitLabHost": {"order": "desc"}}, {"arcID": {"order": "desc"}}, {"arcVersion": {"order": "desc"}}],
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    resolve(result.body.hits.hits[0]._source);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }

    /**
     * Returns the latest arcVersion of an ARC.
     *
     * @param arcID
     * @returns {Promise<JSON>}
     */
    getLatestARC(arcID) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'metadata',
                size: 1,
                body: {
                    sort: [{"gitLabHost": {"order": "desc"}}, {"arcVersion": {"order": "desc"}}],
                    query: {
                        term: {
                            'arcID': arcID
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    resolve(result.body.hits.hits[0]._source);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }

    /**
     * Returns a specific arcVersion of an ARC.
     *
     * @param arcID
     * @param arcVersion
     * @param gitLabHost
     * @returns {Promise<JSON>}
     */
    getSpecificARCFromHost(arcID, arcVersion, gitLabHost) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'metadata',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    resolve(result.body.hits.hits[0]._source);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }

    /**
     * Returns a specific arcVersion of an ARC.
     *
     * @param arcID
     * @param arcVersion
     * @returns {Promise<JSON>}
     */
    getSpecificARC(arcID, arcVersion) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'metadata',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    resolve(result.body.hits.hits[0]._source);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }

    /**
     * Creates a new ARC document in the metadata index iff no ARC with arcID exists.
     * Otherwise the arcVersion is set to the latest arcVersion + 1.
     *
     * @param req Parsed request body in JSON format
     * @returns {Promise<boolean>}
     */
    createLatestARC(req) {
        const esClient = this.esClient;
        const classObject = this;
        const arcID = req.body.arcID;
        const gitLabHost = req.body.gitLabHost;

        return new Promise(function (resolve, reject) {

            classObject.getLatestARCFromHost(arcID, gitLabHost).then(result => {
                if (Object.keys(result).length === 0) {
                    req.body.arcVersion = 0;
                    console.log('arcID does not exists.');
                } else {
                    req.body.arcVersion = result.arcVersion + 1;
                    console.log('arcID exists. Increment arcVersion.');
                }
            })
                .then(() => esClient.index({
                    index: 'metadata',
                    body: req.body
                }))
                .then(() => console.log('arcID: ' + arcID + ', arcVersion: ' + req.body.arcVersion + ' added to database.'))
                .then(() => resolve(true))
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Creates a specific ARC document in the metadata index iff no ARC with arcID and arcVersion exists.
     *
     * @param req Parsed request body in JSON format
     * @returns {Promise<boolean>}
     */
    createSpecificARC(req) {
        const esClient = this.esClient;
        const classObject = this;
        const arcID = req.body.arcID;
        const arcVersion = req.body.arcVersion;
        const gitLabHost = req.body.gitLabHost;

        return new Promise(function (resolve, reject) {

            classObject.getSpecificARCFromHost(arcID, arcVersion, gitLabHost).then(result => {
                if (Object.keys(result).length === 0) {
                    esClient.index({
                        index: 'metadata',
                        body: req.body
                    }).catch(err => {
                        reject(err);
                        logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                    });
                } else {
                    reject('ARC with arcID ' + arcID + ' and arcVersion ' + arcVersion + ' already exists.');
                }
            })
                .then(() => resolve(true))
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Creates a specific parameter value from an ARC Version.
     *
     * @param req Parsed request body in JSON format
     * @returns {Promise<boolean>}
     */
    createParameterValues(req) {
        const esClient = this.esClient;
        return new Promise(function (resolve, reject) {
            esClient.index({
                    index: 'parameter_values',
                    body: req.body
                })
                .then(() => resolve(true))
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Creates a specific investigation document in the investigation index iff no investigation with arcID and arcVersion exists.
     *
     * @param req Parsed request body in JSON format
     * @returns {Promise<boolean>}
     */
    createInvestigation(req) {
        const esClient = this.esClient;
        const classObject = this;
        const arcID = req.params.arcID;
        const arcVersion = req.params.arcVersion;
        const gitLabHost = req.params.gitLabHost;
        const gitLabHostLocation = req.params.gitLabHostLocation;

        req.body.arcID = arcID;
        req.body.arcVersion = arcVersion;
        req.body.gitLabHost = gitLabHost;
        req.body.gitLabHostLocation = gitLabHostLocation;

        AnyOfSolutionInstance.split(req.body);

        return new Promise(function (resolve, reject) {
            classObject.getInvestigationFromHost(arcID, arcVersion, gitLabHost)
                .then(result => {
                    if (Object.keys(result).length !== 0) {
                        reject('Investigation with arcID ' + arcID + ' and arcVersion ' + arcVersion + ' already exists.');
                    }
                })
                .then(() => esClient.index({
                    index: 'investigation',
                    body: req.body
                }))
                .then(() => resolve(true))
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }


    /**
     * Returns list of Parameter Values belongs to an ARC.
     *
     * @param gitLabHost
     * @param arcID
     * @param arcVersion
     * @returns {Promise<JSON>}
     */
    getAllParameterValues(gitLabHost, arcID, arcVersion) {
        const esClient = this.esClient;
        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'parameter_values',
                size: 1000,
                body: {
                    sort: [{"arcID": {"order": "desc"}}, {"arcVersion": {"order": "asc"}}, {"gitLabHost": {"order": "asc"}}, {"protocolName": {"order": "asc"}}, {"processSequenceName": {"order": "asc"}}],
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                const finalResults = {"hits": []};
                for (let i = 0; i < result.body.hits.hits.length; i++) {
                    const hit = result.body.hits.hits[i];
                    const element = hit._source;
                    const score = hit._score;
                    const intermediateResult = {
                        "score": score,
                        "data": element
                    };
                    finalResults.hits.push(intermediateResult);
                }
                resolve(finalResults);
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }



    /**
     * Returns list of Parameter Values belongs to an ARC.
     *
     * @param type
     * @param gitLabHost
     * @param arcID
     * @param arcVersion
     * @returns {Promise<JSON>}
     */
    getAllParameterValuesByType(gitLabHost, arcID, arcVersion, type) {
        const esClient = this.esClient;
        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'parameter_values',
                size: 1000,
                body: {
                    sort: [{"protocolName": {"order": "asc"}}, {"processSequenceName": {"order": "asc"}}],
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'valuesType': type
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                const finalResults = {"hits": []};
                for (let i = 0; i < result.body.hits.hits.length; i++) {
                    const hit = result.body.hits.hits[i];
                    const element = hit._source;
                    const score = hit._score;
                    const intermediateResult = {
                        "score": score,
                        "data": element
                    };
                    finalResults.hits.push(intermediateResult);
                }
                resolve(finalResults);
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }


    /**
     * Returns a specific investigation.
     *
     * @param arcID
     * @param arcVersion
     * @param gitLabHost
     * @returns {Promise<JSON>}
     */
    getInvestigationFromHost(arcID, arcVersion, gitLabHost) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    const invJSON = result.body.hits.hits[0]._source;
                    AnyOfSolutionInstance.combine(invJSON);
                    resolve(invJSON);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }



    /**
     * Returns a specific investigation.
     *
     * @param arcID
     * @param arcVersion
     * @returns {Promise<JSON>}
     */
    getInvestigation(arcID, arcVersion) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    resolve({});
                } else {
                    const invJSON = result.body.hits.hits[0]._source;
                    AnyOfSolutionInstance.combine(invJSON);
                    resolve(invJSON);
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
        });
    }

    /**
     * Deletes a specific ARC given by arcID and arcVersion.
     *
     * @param arcID
     * @param arcVersion
     * @param gitLabHost
     * @returns {Promise<unknown>}
     */
    deleteSpecificARCFromHost(arcID, arcVersion, gitLabHost) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            // First: Find document ID
            esClient.search({
                index: 'metadata',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                }
                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    reject("ARC with arcID=" + arcID + " and arcVersion=" + arcVersion + " not found!");
                } else {
                    // Second: Delete document and refresh shard immediately
                    esClient.delete({
                        id: result.body.hits.hits[0]._id,
                        index: 'metadata',
                        refresh: 'true'
                    })
                        .then(() => resolve("ARC successfully deleted."))
                        .catch(err => {
                            reject(err);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });

        });
    }

    /**
     *  Deletes a specific Investigation given by arcID and arcVersion.
     *
     * @param arcID
     * @param arcVersion
     * @param gitLabHost
     * @returns {Promise<unknown>}
     */
    deleteInvestigationFromHost(arcID, arcVersion, gitLabHost) {
        const esClient = this.esClient;

        return new Promise(function (resolve, reject) {
            // First: Find document ID
            esClient.search({
                index: 'investigation',
                size: 1,
                body: {
                    query: {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'arcID': arcID
                                    }
                                },
                                {
                                    'term': {
                                        'arcVersion': arcVersion
                                    }
                                },
                                {
                                    'term': {
                                        'gitLabHost': gitLabHost
                                    }
                                }

                            ]
                        }
                    }
                }
            }).then(result => {
                if (result.body.hits.total.value === 0) {
                    reject("Investigation with arcID=" + arcID + " and arcVersion=" + arcVersion + " not found!");
                } else {
                    // Second: Delete document and refresh shard immediately
                    esClient.delete({
                        id: result.body.hits.hits[0]._id,
                        index: 'investigation',
                        refresh: 'true'
                    })
                        .then(() => resolve("Investigation successfully deleted."))
                        .catch(err => {
                            reject(err);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                }
            }).catch(err => {
                reject(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });

        });
    }

    /**
     * Searches for added, deleted or modified files from arcID between arcVersion1 and arcVersion2.
     *
     * @param arcID
     * @param arcVersion1
     * @param arcVersion2
     * @returns {Promise<unknown>}
     */
    getDifferences(arcID, arcVersion1, arcVersion2) {
        const diffJSON = {
            "arcID": arcID,
            "arcVersion1": arcVersion1,
            "arcVersion2": arcVersion2,
            "created": [],
            "modified": [],
            "deleted": []
        }


        return new Promise((resolve, reject) => {
            this.getSpecificARC(arcID, arcVersion1)
                .then(arc1 => {
                    console.log(new Date() + " - GetDifferences: " + "arcID=" + arcID + " and arcVersion=" + arcVersion1 + " found.");

                    this.getSpecificARC(arcID, arcVersion2)
                        .then(arc2 => {
                            console.log(new Date() + " - GetDifferences: " + "arcID=" + arcID + " and arcVersion=" + arcVersion2 + " found.");

                            const arc1AssaysHashMap = new HashMap();
                            const arc1WorkflowsHashMap = new HashMap();
                            const arc1ExternalsHashMap = new HashMap();
                            const arc1RunsHashMap = new HashMap();

                            const arc2AssaysHashMap = new HashMap();
                            const arc2WorkflowsHashMap = new HashMap();
                            const arc2ExternalsHashMap = new HashMap();
                            const arc2RunsHashMap = new HashMap();

                            if (Object.keys(arc1).length !== 0) {
                                for (let i = 0; i < arc1.assays.length; i++) {
                                    arc1AssaysHashMap.set(arc1.assays[i].file, arc1.assays[i]);
                                }
                                for (let i = 0; i < arc1.workflows.length; i++) {
                                    arc1WorkflowsHashMap.set(arc1.workflows[i].file, arc1.workflows[i]);
                                }
                                for (let i = 0; i < arc1.externals.length; i++) {
                                    arc1ExternalsHashMap.set(arc1.externals[i].file, arc1.externals[i]);
                                }
                                for (let i = 0; i < arc1.runs.length; i++) {
                                    arc1RunsHashMap.set(arc1.runs[i].file, arc1.runs[i]);
                                }
                            }

                            if (Object.keys(arc2).length !== 0) {
                                for (let i = 0; i < arc2.assays.length; i++) {
                                    arc2AssaysHashMap.set(arc2.assays[i].file, arc2.assays[i]);
                                }
                                for (let i = 0; i < arc2.workflows.length; i++) {
                                    arc2WorkflowsHashMap.set(arc2.workflows[i].file, arc2.workflows[i]);
                                }
                                for (let i = 0; i < arc2.externals.length; i++) {
                                    arc2ExternalsHashMap.set(arc2.externals[i].file, arc2.externals[i]);
                                }
                                for (let i = 0; i < arc2.runs.length; i++) {
                                    arc2RunsHashMap.set(arc2.runs[i].file, arc2.runs[i]);
                                }
                            }

                            // Added or Modified
                            arc2AssaysHashMap.forEach((value, key) => {
                                const comp = arc1AssaysHashMap.get(key);

                                if (comp != null) {
                                    if (value.lastModifiedDate !== comp.lastModifiedDate) {
                                        value.type = "assay";
                                        diffJSON.modified.push(value);
                                    }
                                    // Delete from first arcVersion (faster in second step)
                                    arc1AssaysHashMap.delete(key);
                                } else {
                                    value.type = "assay";
                                    diffJSON.created.push(value);
                                }
                            });

                            arc2WorkflowsHashMap.forEach((value, key) => {
                                const comp = arc1WorkflowsHashMap.get(key);

                                if (comp != null) {
                                    if (value.lastModifiedDate !== comp.lastModifiedDate) {
                                        value.type = "workflow";
                                        diffJSON.modified.push(value);
                                    }
                                    // Delete from first arcVersion (faster in second step)
                                    arc1WorkflowsHashMap.delete(key);
                                } else {
                                    value.type = "workflow";
                                    diffJSON.created.push(value);
                                }
                            });

                            arc2ExternalsHashMap.forEach((value, key) => {
                                const comp = arc1ExternalsHashMap.get(key);

                                if (comp != null) {
                                    if (value.lastModifiedDate !== comp.lastModifiedDate) {
                                        value.type = "external";
                                        diffJSON.modified.push(value);
                                    }
                                    // Delete from first arcVersion (faster in second step)
                                    arc1ExternalsHashMap.delete(key);
                                } else {
                                    value.type = "external";
                                    diffJSON.created.push(value);
                                }
                            });

                            arc2RunsHashMap.forEach((value, key) => {
                                const comp = arc1RunsHashMap.get(key);

                                if (comp != null) {
                                    if (value.lastModifiedDate !== comp.lastModifiedDate) {
                                        value.type = "run";
                                        diffJSON.modified.push(value);
                                    }
                                    // Delete from first arcVersion (faster in second step)
                                    arc1RunsHashMap.delete(key);
                                } else {
                                    value.type = "run";
                                    diffJSON.created.push(value);
                                }
                            });

                            // 2. Step: Deleted
                            arc1AssaysHashMap.forEach((value, key) => {
                                value.type = "assay";
                                diffJSON.deleted.push(value);
                            });
                            arc1WorkflowsHashMap.forEach((value, key) => {
                                value.type = "workflow";
                                diffJSON.deleted.push(value);
                            });
                            arc1ExternalsHashMap.forEach((value, key) => {
                                value.type = "external";
                                diffJSON.deleted.push(value);
                            });
                            arc1RunsHashMap.forEach((value, key) => {
                                value.type = "run";
                                diffJSON.deleted.push(value);
                            });

                            resolve(diffJSON);

                        })
                        .catch(err => {
                            reject(err);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Performance a basic field search + Fuzziness for Studies.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchStudies(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.identifier != null) {
            searchQuery.push({
                "match": {
                    "studies.identifier": {
                        "query": query.identifier,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.filename != null) {
            searchQuery.push({
                "match": {
                    "studies.filename": {
                        "query": query.filename,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.title != null) {
            searchQuery.push({
                "match": {
                    "studies.title": {
                        "query": query.title,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.description != null) {
            searchQuery.push({
                "match": {
                    "studies.description": {
                        "query": query.description,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.filename != null) {
            searchQuery.push(searchQuery.push({
                "match": {
                    "studies.filename": {
                        "query": query.filename,
                        "fuzziness": "AUTO"
                    }
                }
            }));
        }
        if (query.submittedBefore != null && query.submittedAfter != null) {
            searchQuery.push({
                "range": {
                    "studies.submissionDate": {
                        "gt": query.submittedAfter,
                        "lt": query.submittedBefore
                    }
                }
            });
        } else if (query.submittedBefore != null) {
            searchQuery.push({
                "range": {
                    "studies.submissionDate": {
                        "lt": query.submittedBefore
                    }
                }
            });
        } else if (query.submittedAfter != null) {
            searchQuery.push({
                "range": {
                    "studies.submissionDate": {
                        "gt": query.submittedAfter
                    }
                }
            });
        }

        if (query.publishedBefore != null && query.publishedAfter != null) {
            searchQuery.push({
                "range": {
                    "studies.publicReleaseDate": {
                        "gt": query.publishedAfter,
                        "lt": query.publishedBefore
                    }
                }
            });
        } else if (query.publishedBefore != null) {
            searchQuery.push({
                "range": {
                    "studies.publicReleaseDate": {
                        "lt": query.publishedBefore
                    }
                }
            });
        } else if (query.publishedAfter != null) {
            searchQuery.push({
                "range": {
                    "studies.publicReleaseDate": {
                        "gt": query.publishedAfter
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: limit,
                body: {
                    query: {
                        "nested": {
                            "path": "studies",
                            "query": {
                                "bool": {
                                    "must": searchQuery
                                }
                            },
                            "inner_hits": {
                                "name": "nestedElement",
                                "size": 100
                            }
                        }
                    }
                }
            })
                .then(res => {
                    const finalResults = {"hits": []};

                    for (let i = 0; i < res.body.hits.hits.length; i++) {
                        const hit = res.body.hits.hits[i];

                        const arcID = hit._source.arcID;
                        const arcVersion = hit._source.arcVersion;

                        for (let j = 0; j < hit.inner_hits.nestedElement.hits.hits.length; j++) {
                            const element = hit.inner_hits.nestedElement.hits.hits[j]._source;
                            const score = hit.inner_hits.nestedElement.hits.hits[j]._score;

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }
                    }

                    finalResults.hits.sort(function (x, y) {
                        const scoreX = x.score;
                        const scoreY = y.score;

                        if (scoreX < scoreY) return 1;
                        if (scoreX > scoreY) return -1;
                        return 0;
                    });

                    if (finalResults.hits.length > 0) {
                        finalResults.hits = finalResults.hits.slice(0, limit);
                    }

                    resolve(finalResults);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Performance a basic field search + Fuzziness for Investigations.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchInvestigation(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.identifier != null) {
            searchQuery.push({
                "match": {
                    "identifier": {
                        "query": query.identifier,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.filename != null) {
            searchQuery.push({
                "match": {
                    "filename": {
                        "query": query.filename,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.title != null) {
            searchQuery.push({
                "match": {
                    "title": {
                        "query": query.title,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.description != null) {
            searchQuery.push({
                "match": {
                    "description": {
                        "query": query.description,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.submittedBefore != null && query.submittedAfter != null) {
            searchQuery.push({
                "range": {
                    "submissionDate": {
                        "gt": query.submittedAfter,
                        "lt": query.submittedBefore
                    }
                }
            });
        } else if (query.submittedBefore != null) {
            searchQuery.push({
                "range": {
                    "submissionDate": {
                        "lt": query.submittedBefore
                    }
                }
            });
        } else if (query.submittedAfter != null) {
            searchQuery.push({
                "range": {
                    "submissionDate": {
                        "gt": query.submittedAfter
                    }
                }
            });
        }

        if (query.publishedBefore != null && query.publishedAfter != null) {
            searchQuery.push({
                "range": {
                    "publicReleaseDate": {
                        "gt": query.publishedAfter,
                        "lt": query.publishedBefore
                    }
                }
            });
        } else if (query.publishedBefore != null) {
            searchQuery.push({
                "range": {
                    "publicReleaseDate": {
                        "lt": query.publishedBefore
                    }
                }
            });
        } else if (query.publishedAfter != null) {
            searchQuery.push({
                "range": {
                    "publicReleaseDate": {
                        "gt": query.publishedAfter
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
                esClient.search({
                        index: 'investigation',
                        size: limit,
                        body: {
                            query: {
                                "bool": {
                                    "must": searchQuery
                                }
                            }
                        }
                    }
                )
                    .then(res => {
                        const finalResults = {"hits": []};

                        for (let i = 0; i < res.body.hits.hits.length; i++) {
                            const hit = res.body.hits.hits[i];

                            const arcID = hit._source.arcID;
                            const arcVersion = hit._source.arcVersion;
                            const element = hit._source;
                            const score = hit._score;

                            AnyOfSolutionInstance.combine(element);

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }

                        finalResults.hits.sort(function (x, y) {
                            const scoreX = x.score;
                            const scoreY = y.score;

                            if (scoreX < scoreY) return 1;
                            if (scoreX > scoreY) return -1;
                            return 0;
                        });

                        if (finalResults.hits.length > 0) {
                            finalResults.hits = finalResults.hits.slice(0, limit);
                        }

                        resolve(finalResults);
                    })
                    .catch(err => {
                        reject(err);
                        logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                    });
            });
    }


    /**
     * Performance a basic field search + Fuzziness for Params.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchParams(query) {
        const esClient = this.esClient;
        const paramValueSearchQuery = [];
        if (query.parameterName != null) {
            paramValueSearchQuery.push({
                "match": {
                    "name": {
                        "query": query.parameterName,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.parameterValue != null) {
            paramValueSearchQuery.push({
                "match": {
                    "value": {
                        "query": query.parameterValue,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                    index: 'parameter_values',
                    size: 1000,
                    body: {
                            "query": {
                                "bool": {
                                    "must": paramValueSearchQuery
                                }
                            }
                        }
                }
            ).then(res => {
                    const finalResults = {"hits": []};
                    for (let i = 0; i < res.body.hits.hits.length; i++) {
                        const hit = res.body.hits.hits[i];
                        const element = hit._source;
                        const intermediateResult = {
                            "data": element
                        };
                        finalResults.hits.push(intermediateResult);
                    }
                    resolve(finalResults);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }


    /**
     * Performance a basic field search + Fuzziness for Persons.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchPersons(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.lastName != null) {
            searchQuery.push({
                "match": {
                    "people.lastName": {
                        "query": query.lastName,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.firstName != null) {
            searchQuery.push({
                "match": {
                    "people.firstName": {
                        "query": query.firstName,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.midInitials != null) {
            searchQuery.push({
                "match": {
                    "people.midInitials": {
                        "query": query.midInitials,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.email != null) {
            searchQuery.push({
                "match": {
                    "people.email": {
                        "query": query.email,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.phone != null) {
            searchQuery.push({
                "match": {
                    "people.phone": {
                        "query": query.phone,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.fax != null) {
            searchQuery.push({
                "match": {
                    "people.fax": {
                        "query": query.fax,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.address != null) {
            searchQuery.push({
                "match": {
                    "people.address": {
                        "query": query.address,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.affiliation != null) {
            searchQuery.push({
                "match": {
                    "people.affiliation": {
                        "query": query.affiliation,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: limit,
                body: {
                    query: {
                        "nested": {
                            "path": "people",
                            "query": {
                                "bool": {
                                    "must": searchQuery
                                }
                            },
                            "inner_hits": {
                                "name": "nestedElement",
                                "size": 100
                            }
                        }
                    }
                }
            })
                .then(res => {
                    const finalResults = {"hits": []};

                    for (let i = 0; i < res.body.hits.hits.length; i++) {
                        const hit = res.body.hits.hits[i];

                        const arcID = hit._source.arcID;
                        const arcVersion = hit._source.arcVersion;

                        for (let j = 0; j < hit.inner_hits.nestedElement.hits.hits.length; j++) {
                            const element = hit.inner_hits.nestedElement.hits.hits[j]._source;
                            const score = hit.inner_hits.nestedElement.hits.hits[j]._score;

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }
                    }

                    finalResults.hits.sort(function (x, y) {
                        const scoreX = x.score;
                        const scoreY = y.score;

                        if (scoreX < scoreY) return 1;
                        if (scoreX > scoreY) return -1;
                        return 0;
                    });

                    if (finalResults.hits.length > 0) {
                        finalResults.hits = finalResults.hits.slice(0, limit);
                    }

                    resolve(finalResults);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }


    /**
     * Performance a basic field search + Fuzziness for Publications.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchPublications(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.pubMedID != null) {
            searchQuery.push({
                "match": {
                    "publications.pubMedID": {
                        "query": query.pubMedID,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.doi != null) {
            searchQuery.push({
                "match": {
                    "publications.doi": {
                        "query": query.doi,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.authorList != null) {
            searchQuery.push({
                "match": {
                    "publications.authorList": {
                        "query": query.authorList,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.title != null) {
            searchQuery.push({
                "match": {
                    "publications.title": {
                        "query": query.title,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: limit,
                body: {
                    query: {
                        "nested": {
                            "path": "publications",
                            "query": {
                                "bool": {
                                    "must": searchQuery
                                }
                            },
                            "inner_hits": {
                                "name": "nestedElement",
                                "size": 100
                            }
                        }
                    }
                }
            })
                .then(res => {
                    const finalResults = {"hits": []};

                    for (let i = 0; i < res.body.hits.hits.length; i++) {
                        const hit = res.body.hits.hits[i];

                        const arcID = hit._source.arcID;
                        const arcVersion = hit._source.arcVersion;

                        for (let j = 0; j < hit.inner_hits.nestedElement.hits.hits.length; j++) {
                            const element = hit.inner_hits.nestedElement.hits.hits[j]._source;
                            const score = hit.inner_hits.nestedElement.hits.hits[j]._score;

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }
                    }

                    finalResults.hits.sort(function (x, y) {
                        const scoreX = x.score;
                        const scoreY = y.score;

                        if (scoreX < scoreY) return 1;
                        if (scoreX > scoreY) return -1;
                        return 0;
                    });

                    if (finalResults.hits.length > 0) {
                        finalResults.hits = finalResults.hits.slice(0, limit);
                    }

                    resolve(finalResults);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    /**
     * Performance a basic field search + Fuzziness for ARCs.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchARCs(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.arcID != null) {
            searchQuery.push({
                "match": {
                    "arcID": {
                        "query": query.arcID,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.arcVersion != null) {
            searchQuery.push({
                "match": {
                    "arcVersion": {
                        "query": query.arcVersion,
                    }
                }
            });
        }

        if (query.createdBefore != null && query.createdAfter != null) {
            searchQuery.push({
                "range": {
                    "arcCreationDate": {
                        "gt": query.createdAfter,
                        "lt": query.createdBefore
                    }
                }
            });
        } else if (query.createdBefore != null) {
            searchQuery.push({
                "range": {
                    "arcCreationDate": {
                        "lt": query.createdBefore
                    }
                }
            });
        } else if (query.createdAfter != null) {
            searchQuery.push({
                "range": {
                    "arcCreationDate": {
                        "gt": query.createdAfter
                    }
                }
            });
        }

        if (query.lastModifiedBefore != null && query.lastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "arcLastModifiedDate": {
                        "gt": query.lastModifiedAfter,
                        "lt": query.lastModifiedBefore
                    }
                }
            });
        } else if (query.lastModifiedBefore != null) {
            searchQuery.push({
                "range": {
                    "arcLastModifiedDate": {
                        "lt": query.lastModifiedBefore
                    }
                }
            });
        } else if (query.lastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "arcLastModifiedDate": {
                        "gt": query.lastModifiedAfter
                    }
                }
            });
        }

        if (query.sizeSmallerThan != null && query.sizeBiggerThan != null) {
            searchQuery.push({
                "range": {
                    "arcSize": {
                        "gt": query.sizeBiggerThan,
                        "lt": query.sizeSmallerThan
                    }
                }
            });
        } else if (query.sizeSmallerThan != null) {
            searchQuery.push({
                "range": {
                    "arcSize": {
                        "lt": query.sizeSmallerThan
                    }
                }
            });
        } else if (query.sizeBiggerThan != null) {
            searchQuery.push({
                "range": {
                    "arcSize": {
                        "gt": query.sizeBiggerThan
                    }
                }
            });
        }

        if (query.gitLabUserID != null) {
            searchQuery.push({
                "match": {
                    "gitLabUserID": {
                        "query": query.gitLabUserID
                    }
                }
            });
        }

        if (query.gitLabUserName != null) {
            searchQuery.push({
                "match": {
                    "gitLabUserName": {
                        "query": query.gitLabUserName,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.gitLabUserUserName != null) {
            searchQuery.push({
                "match": {
                    "gitLabUserUserName": {
                        "query": query.gitLabUserUserName,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        if (query.gitLabUserEmail != null) {
            searchQuery.push({
                "match": {
                    "gitLabUserEmail": {
                        "query": query.gitLabUserEmail,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }


        if (query.assaysCreatedBefore != null && query.assaysCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "assays.creationDate": {
                        "gt": query.assaysCreatedAfter,
                        "lt": query.assaysCreatedBefore
                    }
                }
            });
        } else if (query.assaysCreatedBefore != null) {
            searchQuery.push({
                "range": {
                    "assays.creationDate": {
                        "lt": query.assaysCreatedBefore
                    }
                }
            });
        } else if (query.assaysCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "assays.creationDate": {
                        "gt": query.assaysCreatedAfter
                    }
                }
            });
        }

        if (query.workflowsCreatedBefore != null && query.workflowsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "workflows.creationDate": {
                        "gt": query.workflowsCreatedAfter,
                        "lt": query.workflowsCreatedBefore
                    }
                }
            });
        } else if (query.workflowsCreatedBefore != null) {
            searchQuery.push({
                "range": {
                    "workflows.creationDate": {
                        "lt": query.workflowsCreatedBefore
                    }
                }
            });
        } else if (query.workflowsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "workflows.creationDate": {
                        "gt": query.workflowsCreatedAfter
                    }
                }
            });
        }

        if (query.externalsCreatedBefore != null && query.externalsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "externals.creationDate": {
                        "gt": query.externalsCreatedAfter,
                        "lt": query.externalsCreatedBefore
                    }
                }
            });
        } else if (query.externalsCreatedBefore != null) {
            searchQuery.push({
                "range": {
                    "externals.creationDate": {
                        "lt": query.externalsCreatedBefore
                    }
                }
            });
        } else if (query.externalsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "externals.creationDate": {
                        "gt": query.externalsCreatedAfter
                    }
                }
            });
        }

        if (query.runsCreatedBefore != null && query.runsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "runs.creationDate": {
                        "gt": query.runsCreatedAfter,
                        "lt": query.runsCreatedBefore
                    }
                }
            });
        } else if (query.runsCreatedBefore != null) {
            searchQuery.push({
                "range": {
                    "runs.creationDate": {
                        "lt": query.runsCreatedBefore
                    }
                }
            });
        } else if (query.runsCreatedAfter != null) {
            searchQuery.push({
                "range": {
                    "runs.creationDate": {
                        "gt": query.runsCreatedAfter
                    }
                }
            });
        }

        if (query.assaysLastModifiedBefore != null && query.assaysLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "assays.lastModifiedDate": {
                        "gt": query.assaysLastModifiedAfter,
                        "lt": query.assaysLastModifiedBefore
                    }
                }
            });
        } else if (query.assaysLastModifiedBefore != null) {
            searchQuery.push({
                "range": {
                    "assays.lastModifiedDate": {
                        "lt": query.assaysLastModifiedBefore
                    }
                }
            });
        } else if (query.assaysLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "assays.lastModifiedDate": {
                        "gt": query.assaysLastModifiedAfter
                    }
                }
            });
        }

        if (query.workflowsLastModifiedBefore != null && query.workflowsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "workflows.lastModifiedDate": {
                        "gt": query.workflowsLastModifiedAfter,
                        "lt": query.workflowsLastModifiedBefore
                    }
                }
            });
        } else if (query.workflowsLastModifiedBefore != null) {
            searchQuery.push({
                "range": {
                    "workflows.lastModifiedDate": {
                        "lt": query.workflowsLastModifiedBefore
                    }
                }
            });
        } else if (query.workflowsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "workflows.lastModifiedDate": {
                        "gt": query.workflowsLastModifiedAfter
                    }
                }
            });
        }

        if (query.externalsLastModifiedBefore != null && query.externalsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "externals.lastModifiedDate": {
                        "gt": query.externalsLastModifiedAfter,
                        "lt": query.externalsLastModifiedBefore
                    }
                }
            });
        } else if (query.externalsLastModifiedBefore != null) {
            searchQuery.push({
                "range": {
                    "externals.lastModifiedDate": {
                        "lt": query.externalsLastModifiedBefore
                    }
                }
            });
        } else if (query.externalsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "externals.lastModifiedDate": {
                        "gt": query.externalsLastModifiedAfter
                    }
                }
            });
        }

        if (query.runsLastModifiedBefore != null && query.runsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "runs.lastModifiedDate": {
                        "gt": query.runsLastModifiedAfter,
                        "lt": query.runsLastModifiedBefore
                    }
                }
            });
        } else if (query.runsLastModifiedBefore != null) {
            searchQuery.push({
                "range": {
                    "runs.lastModifiedDate": {
                        "lt": query.runsLastModifiedBefore
                    }
                }
            });
        } else if (query.runsLastModifiedAfter != null) {
            searchQuery.push({
                "range": {
                    "runs.lastModifiedDate": {
                        "gt": query.runsLastModifiedAfter
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
                esClient.search({
                        index: 'metadata',
                        size: limit,
                        body: {
                            query: {
                                "bool": {
                                    "must": searchQuery
                                }
                            }
                        }
                    }
                )
                    .then(res => {
                        const finalResults = {"hits": []};

                        for (let i = 0; i < res.body.hits.hits.length; i++) {
                            const hit = res.body.hits.hits[i];

                            const arcID = hit._source.arcID;
                            const arcVersion = hit._source.arcVersion;
                            const element = hit._source;
                            const score = hit._score;

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }

                        finalResults.hits.sort(function (x, y) {
                            const scoreX = x.score;
                            const scoreY = y.score;

                            if (scoreX < scoreY) return 1;
                            if (scoreX > scoreY) return -1;
                            return 0;
                        });

                        if (finalResults.hits.length > 0) {
                            finalResults.hits = finalResults.hits.slice(0, limit);
                        }

                        resolve(finalResults);
                    })
                    .catch(err => {
                        reject(err);
                        logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                    });
            }
        )
            ;
    }

    /**
     * Performance a basic field search + Fuzziness for Assays.
     * Search Query is a conjunction (AND) of parameters.
     *
     * @param query
     * @returns {Promise<unknown>}
     */
    searchAssays(query) {
        const esClient = this.esClient;

        const searchQuery = []

        if (query.filename != null) {
            searchQuery.push({
                    "match": {
                        "studies.assays.filename": {
                            "query": query.filename,
                            "fuzziness": "AUTO"
                        }
                    }
                }
            );
        }

        if (query.measurementTypeAnnotationValueString != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.measurementType.annotationValue_string": {
                        "query": query.measurementTypeAnnotationValueString,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.measurementTypeAnnotationValueNumber != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.measurementType.annotationValue_number": {
                        "query": query.measurementTypeAnnotationValueNumber,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.measurementTypeTermSource != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.measurementType.termSource": {
                        "query": query.measurementTypeTermSource,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.measurementTypeTermAccession != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.measurementType.termAccession": {
                        "query": query.measurementTypeTermAccession,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.technologyTypeAnnotationValue != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.technologyType.annotationValue": {
                        "query": query.technologyTypeAnnotationValue,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.technologyTypeTermSource != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.technologyType.termSource": {
                        "query": query.technologyTypeTermSource,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }
        if (query.technologyTypeTermAccession != null) {
            searchQuery.push({
                "match": {
                    "studies.assays.technologyType.termAccession": {
                        "query": query.technologyTypeTermAccession,
                        "fuzziness": "AUTO"
                    }
                }
            });
        }

        let limit = 20;
        if (query.limit != null) {
            limit = query.limit;
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: limit,
                body: {
                    query: {
                        "nested": {
                            "path": "studies.assays",
                            "query": {
                                "bool": {
                                    "must": searchQuery
                                }
                            },
                            "inner_hits": {
                                "name": "nestedElement",
                                "size": 100
                            }
                        }
                    }
                }
            })
                .then(res => {
                    const finalResults = {"hits": []};

                    for (let i = 0; i < res.body.hits.hits.length; i++) {
                        const hit = res.body.hits.hits[i];

                        const arcID = hit._source.arcID;
                        const arcVersion = hit._source.arcVersion;

                        for (let j = 0; j < hit.inner_hits.nestedElement.hits.hits.length; j++) {
                            const element = hit.inner_hits.nestedElement.hits.hits[j]._source;
                            const score = hit.inner_hits.nestedElement.hits.hits[j]._score;

                            const intermediateResult = {
                                "arcID": arcID,
                                "arcVersion": arcVersion,
                                "score": score,
                                "data": element
                            };

                            finalResults.hits.push(intermediateResult);
                        }
                    }

                    finalResults.hits.sort(function (x, y) {
                        const scoreX = x.score;
                        const scoreY = y.score;

                        if (scoreX < scoreY) return 1;
                        if (scoreX > scoreY) return -1;
                        return 0;
                    });

                    if (finalResults.hits.length > 0) {
                        finalResults.hits = finalResults.hits.slice(0, limit);
                    }

                    resolve(finalResults);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }

    isaQuery(req) {
        const esClient = this.esClient;

        let limit = 20;
        if (req.body.queryLimit != null) {
            limit = req.body.queryLimit
        }

        let fields = []
        if (req.body.queryFields != null) {
            fields = req.body.queryFields
        }

        return new Promise(function (resolve, reject) {
            esClient.search({
                index: 'investigation',
                size: limit,
                body: parser(req.body.queryExpression)
            })
                .then(res => {
                    const hits = res.body.hits;

                    const nestedFields = ['ontologySourceReferences', 'comments', 'publications', 'comments', 'people',
                        'roles', 'studies', 'studyDesignDescriptors', 'protocols', 'parameters', 'components', 'sources',
                        'samples', 'otherMaterials', 'characteristics', 'derivesFrom', 'processSequence', 'assays', 'dataFiles',
                        'characteristicCategories', 'unitCategories', 'factors']

                    function getRelPath(absPath) {
                        const lastWord = absPath.substring(absPath.lastIndexOf('.') + 1);
                        const tmpAbsPath = absPath.slice(0, absPath.lastIndexOf('.'));
                        let penultimateWord = tmpAbsPath.substring(tmpAbsPath.lastIndexOf('.') + 1);

                        if (!absPath.includes(".")) {
                            penultimateWord = "";
                        }

                        if (nestedFields.includes(penultimateWord) || penultimateWord.length === 0) {
                            return lastWord;
                        } else {
                            return getRelPath(tmpAbsPath) + "." + lastWord;
                        }
                    }

                    // Go recursive along the result paths and swap _source fields with inner_hits.
                    function recBuild(hits) {
                        for (let i = 0; i < hits.hits.length; i++) {
                            const hit = hits.hits[i];

                            if (hit.hasOwnProperty('inner_hits')) {
                                let relPath = undefined;
                                let results = [];

                                for (let j = 0; j < Object.keys(hit.inner_hits).length; j++) {
                                    const absPath = Object.keys(hit.inner_hits)[0].replace(/[0-9]/g, '');
                                    relPath = getRelPath(absPath);

                                    const result = []

                                    // Recursive Call
                                    recBuild(Object.values(hit.inner_hits)[j].hits);

                                    for (let k = 0; k < Object.values(hit.inner_hits)[j].hits.hits.length; k++) {
                                        result.push(Object.values(hit.inner_hits)[j].hits.hits[k]._source);
                                    }

                                    results.push(result);
                                }

                                const finalResult = [];

                                // Intersection
                                // PROBLEM: Inner_hits nestings are not equal in depth, which is why taking the intersection always gives an empty result.
                                /*      for (let x = 0; x < results.length; x++) {
                                          for (let y = 0; y < results.length; y++) {
                                              for (let v = 0; v < results.length; v++) {

                                                  if (x != v) {
                                                      for (let w = 0; w < results.length; w++) {
                                                          if (isEqual(results[x][y], results[v][w])) {
                                                              finalResult.push(results[x][y]);
                                                          }
                                                      }
                                                  }
                                              }
                                          }
                                      }
                                */
                                const relPathArray = relPath.split(".");

                                function changeSource(path, source) {
                                    if (path.length === 0) {
                                        return source;
                                    } else {
                                        const jsonObject = {};
                                        jsonObject[path[0]] = changeSource(path.splice(1), source);
                                        return jsonObject
                                    }
                                }

                                const changedSourceObject = changeSource(relPathArray, results.flat());
                                const k = Object.keys(changedSourceObject)[0];
                                const v = Object.values(changedSourceObject)[0];
                                hit._source[k] = v;
                            }
                        }
                    }

                    recBuild(hits);

                    const result = {};
                    result.hits = [];

                    for (let i = 0; i < hits.hits.length; i++) {
                        if (fields.length > 0) {
                            pruneObject(hits.hits[i]._source, fields);
                        }
                        const hit = {};
                        hit.score = hits.hits[i]._score;
                        hit.data = hits.hits[i]._source;
                        result.hits.push(hit);
                    }

                    // Fields that are not to be erased are marked first and unmarked fields are removed in the second step.
                    function pruneObject(jsonObject, listOfPaths) {
                        for (let i = 0; i < listOfPaths.length; i++) {
                            followAndMark(jsonObject, listOfPaths[i].split("."))
                        }

                        // Delete unmarked
                        prune(jsonObject);
                    }

                    function followAndMark(jsonObject, pathFragments) {
                        if (pathFragments.length !== 0 && jsonObject.hasOwnProperty(pathFragments[0])) {
                            jsonObject[pathFragments[0] + "_DO_NOT_DELETE"] = null;

                            if (Array.isArray(jsonObject[pathFragments[0]])) {
                                for (let j = 0; j < jsonObject[pathFragments[0]].length; j++) {
                                    followAndMark(jsonObject[pathFragments[0]][j], Array.from(pathFragments).splice(1));
                                }
                            } else {
                                followAndMark(jsonObject[pathFragments[0]], Array.from(pathFragments).splice(1));
                            }
                        }
                    }

                    function prune(jsonElement) {
                        const keys = Object.keys(jsonElement);
                        const marker = keys.filter(e => e.endsWith("_DO_NOT_DELETE"));

                        for (let i = 0; i < keys.length; i++) {
                            if (!marker.includes(keys[i] + "_DO_NOT_DELETE")) {
                                delete jsonElement[keys[i]];
                            } else {
                                if (Array.isArray(jsonElement[keys[i]])) {
                                    for (let j = 0; j < jsonElement[keys[i]].length; j++) {
                                        prune(jsonElement[keys[i]][j]);
                                    }
                                } else if (toString.call(jsonElement[keys[i]]) === '[object Object]') {
                                    prune(jsonElement[keys[i]]);
                                }
                            }
                        }
                    }

                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                    logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                });
        });
    }
}

module.exports = ElasticSearchConnector;