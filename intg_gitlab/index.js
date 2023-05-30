const express = require("express");
const bodyParser = require("body-parser");
const databaseConnector = require("./databaseConnector");
const secrets = require('./secrets');
const logger = require('./Logger');
const gitlabUtils = require("./gitlabUtils");
const util = require("node:util");
const fs = require("fs");
const {resolve} = require('node:path');
const exec = util.promisify(require('node:child_process').exec);
const app = express();

// Parse incoming request bodies to JSON object
app.use(bodyParser.json());

// Triggered by a POST request at /webhook
app.post("/webhook", function (req, res) {

    // Immediately return 200 OK
    res.sendStatus(200) //why?

    // Process only the push messages after repo commits.
    const eventName = req.body.event_name;

    if (eventName.includes("push")) {
        console.log("Push message received. Request body attached " + JSON.stringify(req.body));

        // Get metadata out of response body
        const indexOfDoubleSlash = req.body.project.web_url.indexOf('//');
        const HOSTNAME = req.body.project.web_url.substring(indexOfDoubleSlash + 2, req.body.project.web_url.indexOf('/', indexOfDoubleSlash + 2));
        const hostVersion = 'v15.5.2-ee';
        let isaInvestigationFile = 'isa.investigation.xlsx';
        let gitlabCommit = req.body.commits[0];
        let projectID = req.body.project.id;
        let projectName = req.body.project.name;
        let projectNameWOSpaces = projectName.replace(/ /g, "_");
        let visibilityLevel = req.body.project.visibility_level;
        let projectURL = req.body.project.web_url;
        let totalCommits = req.body.total_commits_count;
        let userID = req.body.user_id;
        let userName = req.body.user_name;
        let userUserName = req.body.user_username;
        let userEmail = req.body.user_email;
        let arcTimestamp = gitlabCommit.timestamp;
        let lastModifiedBy = gitlabCommit.author.name;
        let addedFiles = gitlabCommit.added;
        let modifiedFiles = gitlabCommit.modified;
        let deletedFiles = gitlabCommit.removed;
        let repoVisibility = '';
        let hostLocation = '';

        // list of variables for new ARCs
        let gAssays = [];
        let gStudies = [];
        let gWorkflows = [];
        let gExternals = [];
        let gRuns = [];

        let arcID = null;
        let arcVersion = 0;

        getARCVisibility(visibilityLevel).then(desc => {
            repoVisibility = desc;
        })

        getLocationFromHostName(HOSTNAME).then(location => {
            hostLocation = location;
        })

        // check if there are any commits. This is to identify which push message to process from the gitlab.
        if (totalCommits > 0) {
            // arcID is required for subsequenct processing
            arcID = projectID;
            let apiKey = secrets.read(HOSTNAME);  //read the Hostname specific apiKey
            if (apiKey === '') {
                logger("arc_intg_gitlab", new Date(), "No gitlab token setup for the host " + HOSTNAME + ". arcID is " + arcID, "Error", {});
            }  //read the default apiKey
            else {
                logger("arc_isa", new Date(), "Received push message from the Gitlab server " + HOSTNAME + ". Repository ID is " + arcID, "Info", req.body);
                //download the isa investigation file from the root directory
                let promise1 = gitlabUtils.getRepoFiles(HOSTNAME, '/api/v4/projects/' + projectID + '/repository/tree/?ref=main&private_token=' + apiKey, projectID)
                    .then(dirList => {
                        return new Promise(function (resolve, reject) {
                            for (let dir in dirList) {
                                let pathString = dirList[dir].path;
                                if (pathString.includes("xlsx")) {
                                    let gitlabURIString = '/repository/files/' + encodeURIComponent(pathString) + '/raw?ref=main&private_token=' + apiKey;
                                    console.log('gitlabURIString : ' + gitlabURIString);
                                    let fullPath = projectNameWOSpaces + '/' + pathString;
                                    let index = fullPath.lastIndexOf("/");
                                    let dirPath = fullPath.slice(0, index);
                                    let cmd = 'mkdir -p ' + dirPath;
                                    exec(cmd).then(() => {
                                    }).then(() => gitlabUtils.downloadFile(HOSTNAME, '/api/v4/projects/' + projectID + gitlabURIString, projectNameWOSpaces + '/' + pathString)
                                        .then(r => console.log(r))
                                        .then(() => resolve()));
                                }
                            }
                        })
                    });

                //download the assay files from the root directory
                let promise2 = gitlabUtils.getRepoFiles(HOSTNAME, '/api/v4/projects/' + projectID + '/repository/tree/?recursive=true&ref=main&private_token=' + apiKey, projectID)
                    .then(dirList => {
                        return new Promise(function (resolve, reject) {
                            for (let dir in dirList) {
                                gitlabUtils.getRepoFiles(HOSTNAME, '/api/v4/projects/' + projectID + '/repository/tree/?path=' + dirList[dir].path + '&ref=main&private_token=' + apiKey, projectID)
                                    .then(fileList => {
                                        for (let file in fileList) {
                                            // build the list of files while parsing through the folders.
                                            // this is required for ARC data, particularly for the new ARC.
                                            // existing ARCs will get the updated info directly from the gitlab server.
                                            let filePath = fileList[file].path;
                                            let indexOfFirstSlash = 0;
                                            if (filePath.includes('assays/')) {
                                                indexOfFirstSlash = filePath.indexOf('/');
                                                gAssays.push(filePath.slice(indexOfFirstSlash + 1));
                                            }
                                            if (filePath.includes('studies/')) {
                                                indexOfFirstSlash = filePath.indexOf('/');
                                                gStudies.push(filePath.slice(indexOfFirstSlash + 1));
                                            }
                                            if (filePath.includes('workflows/')) {
                                                indexOfFirstSlash = filePath.indexOf('/');
                                                gWorkflows.push(filePath.slice(indexOfFirstSlash + 1));
                                            }
                                            if (filePath.includes('externals/')) {
                                                indexOfFirstSlash = filePath.indexOf('/');
                                                gExternals.push(filePath.slice(indexOfFirstSlash + 1));
                                            }
                                            if (filePath.includes('runs/')) {
                                                indexOfFirstSlash = filePath.indexOf('/');
                                                gRuns.push(filePath.slice(indexOfFirstSlash + 1));
                                            }
                                            // code to download the folder structure based on the xlsx files!!!
                                            if (filePath.includes('xlsx')) {
                                                let pathString = fileList[file].path;
                                                let gitlabURIString = '/repository/files/' + encodeURIComponent(pathString) + '/raw?ref=main&private_token=' + apiKey;
                                                console.log('gitlabURIString ' + gitlabURIString);
                                                let fullPath = projectNameWOSpaces + '/' + pathString;
                                                let index = fullPath.lastIndexOf("/");
                                                let dirPath = fullPath.slice(0, index);
                                                let cmd = 'mkdir -p ' + dirPath;
                                                exec(cmd).then(() => gitlabUtils.downloadFile(HOSTNAME, '/api/v4/projects/' + projectID + gitlabURIString, projectNameWOSpaces + '/' + pathString)
                                                    .then(r => console.log(r))
                                                    .then(() => resolve()));
                                            }
                                        }
                                    });
                            }
                        })

                    });

                Promise.all([promise1, promise2]).then(() => gitlabUtils.executeCommand(projectNameWOSpaces).then(r => console.log(r)).then(() => {
                    let jsonPath = __dirname + '/' + projectNameWOSpaces + '/' + projectNameWOSpaces + '.json';
                    console.log('jsonPath: ' + jsonPath);
                    fs.readFile(jsonPath, 'utf-8', (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const jsonData = JSON.parse(data);
                        //logic to process the investigation.json file.
                        // Filter the files that were renamed
                        // const renamedFiles = r.filter(value => value.renamed_file);
                        // Since the renamed files are also in the addedFiles array,
                        // only a deletion of the old file name is necessary
                        // for (let i = 0; i < renamedFiles.length; i++) {
                        //    deletedFiles.push(renamedFiles[i].old_path);
                        // }
                        databaseConnector.getLatestARCFromHost(arcID, HOSTNAME).then(result => {
                            if (Object.keys(result).length === 0) {
                                // Empty result, thus no ARC with arcID exists
                                logger("arc_isa", new Date(), "ARC with ID " + arcID + " is not found in the database for the location " + hostLocation + ".Generating...", "Info", {});
                                let arcObject = {
                                    arcID: arcID,
                                    arcVersion: 0,
                                    arcCreationDate: arcTimestamp,
                                    arcLastModifiedDate: arcTimestamp,
                                    arcSize: 0,
                                    gitLabUserID: userID,
                                    gitLabUserName: userName,
                                    gitLabUserUserName: userUserName,
                                    gitLabUserEmail: userEmail,
                                    gitLabRepoVisibility: repoVisibility,
                                    investigationFilename: projectNameWOSpaces,
                                    gitLabHost: HOSTNAME,
                                    gitlabHostVersion: hostVersion,
                                    gitLabHostURL: projectURL,
                                    gitLabHostLocation: hostLocation,
                                    investigations: [],
                                    assays: [],
                                    studies: [],
                                    workflows: [],
                                    externals: [],
                                    runs: []
                                };

                                //write the investigation file
                                arcObject.investigations.push({
                                    file: isaInvestigationFile,
                                    status: 'new',
                                    creationDate: arcTimestamp,
                                    lastModifiedDate: arcTimestamp,
                                    lastModifiedBy: lastModifiedBy
                                });

                                for (let i = 0; i < gAssays.length; i++) {
                                    arcObject.assays.push({
                                        file: gAssays[i],
                                        status: 'new',
                                        creationDate: arcTimestamp,
                                        lastModifiedDate: arcTimestamp,
                                        lastModifiedBy: lastModifiedBy
                                    });
                                }

                                for (let i = 0; i < gStudies.length; i++) {
                                    arcObject.studies.push({
                                        file: gStudies[i],
                                        status: 'new',
                                        creationDate: arcTimestamp,
                                        lastModifiedDate: arcTimestamp,
                                        lastModifiedBy: lastModifiedBy
                                    });
                                }

                                for (let i = 0; i < gWorkflows.length; i++) {
                                    arcObject.workflows.push({
                                        file: gWorkflows[i],
                                        status: 'new',
                                        creationDate: arcTimestamp,
                                        lastModifiedDate: arcTimestamp,
                                        lastModifiedBy: lastModifiedBy
                                    });
                                }

                                for (let i = 0; i < gExternals.length; i++) {
                                    arcObject.externals.push({
                                        file: gExternals[i],
                                        status: 'new',
                                        creationDate: arcTimestamp,
                                        lastModifiedDate: arcTimestamp,
                                        lastModifiedBy: lastModifiedBy
                                    });
                                }

                                for (let i = 0; i < gRuns.length; i++) {
                                    arcObject.runs.push({
                                        file: gRuns[i],
                                        status: 'new',
                                        creationDate: arcTimestamp,
                                        lastModifiedDate: arcTimestamp,
                                        lastModifiedBy: lastModifiedBy
                                    });
                                }

                                // no problem creating the new ISA file associated with ARC version 0.
                                // no need to pass the hostname as it is already there in arc object!
                                databaseConnector.createLatestARC(arcObject)
                                    .then(result => logger("arc_isa", new Date(), "ArcID " + arcID + " successfully processed for the location " + hostLocation + ". Generating ISA file...", "Info", {}))
                                    .catch(err => {
                                        console.error(new Date() + " ERROR: " + JSON.stringify(err));
                                        logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                    });

                                //check the visibility level before creating the investigation file.
                                //in case ARC is private, do not create the investigation file!!!

                                if (visibilityLevel > 0) {
                                    //data is the reqJSON body which is the ISA file from arcCommander
                                    //need to pass hostname to create investigation under that particular host
                                    databaseConnector.createInvestigation(arcID, arcVersion, HOSTNAME, hostLocation, jsonData)
                                        .then(() => {
                                            logger("arc_isa", new Date(), "Processed the ISA file for the ArcID " + arcID + " for the location " + hostLocation, "Info", {});
                                            getParameterValues(arcObject, jsonData)
                                                .then((paramObjects) => {
                                                    paramObjects.forEach(paramObject => {
                                                        databaseConnector.createParameterValues(paramObject)
                                                            .then(() => logger("arc_isa_parameters", new Date(), "Processed the parameter " + paramObject.nameTermAnnotationValue + " for the ARC " + paramObject.arcID, "Info", {}))
                                                            .catch(err => {
                                                                console.log("An error occurred in invoking createParameterValues API " + err);
                                                                logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                                            })
                                                    });
                                                });
                                        })
                                        .catch(err => {
                                            console.log("An error occurred in invoking createInvestigation API " + err);
                                            logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                        });
                                }
                            } else {
                                // ARC with arcID already exists, thus create new ARC with incremented arcVersion
                                logger("arc_isa", new Date(), "ARC with ID " + arcID + " , version " + arcVersion + " found in the database for the location " + hostLocation + ". Generating a new version...", "Info", {});
                                arcVersion = result.arcVersion + 1;
                                let newArcObject = {
                                    arcID: result.arcID,
                                    arcVersion: arcVersion,
                                    arcCreationDate: result.arcCreationDate,
                                    arcLastModifiedDate: arcTimestamp,
                                    arcSize: 0,
                                    gitLabUserID: userID,
                                    gitLabUserName: userName,
                                    gitLabUserUserName: userUserName,
                                    gitLabUserEmail: userEmail,
                                    gitLabRepoVisibility: repoVisibility,
                                    investigationFilename: projectNameWOSpaces,
                                    gitLabHost: HOSTNAME,
                                    gitlabHostVersion: hostVersion,
                                    gitLabHostURL: projectURL,
                                    gitLabHostLocation: hostLocation,
                                    investigations: [],
                                    assays: [],
                                    studies: [],
                                    workflows: [],
                                    externals: [],
                                    runs: []
                                };

                                console.log(new Date() + " addedFiles are: " + JSON.stringify(addedFiles));
                                for (let i = 0; i < addedFiles.length; i++) {
                                    if (addedFiles[i].includes('investigation')) {
                                        newArcObject.investigations.push({
                                            file: isaInvestigationFile,
                                            status: 'new',
                                            lastModifiedDate: arcTimestamp,
                                            lastModifiedBy: lastModifiedBy
                                        });
                                    } else {
                                        let indexOfFirstSlash = addedFiles[i].indexOf('/');
                                        let subFolder = addedFiles[i].substring(0, indexOfFirstSlash);
                                        if (subFolder.includes('assays')) {
                                            newArcObject.assays.push({
                                                file: addedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'new',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('studies')) {
                                            newArcObject.studies.push({
                                                file: addedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'new',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('runs')) {
                                            newArcObject.runs.push({
                                                file: addedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'new',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('workflows')) {
                                            newArcObject.workflows.push({
                                                file: addedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'new',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('externals')) {
                                            newArcObject.externals.push({
                                                file: addedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'new',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                    }
                                }

                                console.log(new Date() + " modifiedFiles are: " + JSON.stringify(modifiedFiles));
                                for (let i = 0; i < modifiedFiles.length; i++) {
                                    if (modifiedFiles[i].includes('investigation')) {
                                        newArcObject.investigations.push({
                                            file: isaInvestigationFile,
                                            status: 'modified',
                                            lastModifiedDate: arcTimestamp,
                                            lastModifiedBy: lastModifiedBy
                                        });
                                    } else {
                                        let indexOfFirstSlash = modifiedFiles[i].indexOf('/');
                                        let subFolder = modifiedFiles[i].substring(0, indexOfFirstSlash);
                                        if (subFolder.includes('assays')) {
                                            newArcObject.assays.push({
                                                file: modifiedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'modified',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('studies')) {
                                            newArcObject.studies.push({
                                                file: modifiedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'modified',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('runs')) {
                                            newArcObject.runs.push({
                                                file: modifiedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'modified',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('workflows')) {
                                            newArcObject.workflows.push({
                                                file: modifiedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'modified',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('externals')) {
                                            newArcObject.externals.push({
                                                file: modifiedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'modified',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                    }
                                }

                                console.log(new Date() + " deletedFiles are: " + JSON.stringify(deletedFiles));
                                for (let i = 0; i < deletedFiles.length; i++) {
                                    if (deletedFiles[i].includes('investigation')) {
                                        newArcObject.investigations.push({
                                            file: isaInvestigationFile,
                                            status: 'deleted',
                                            lastModifiedDate: arcTimestamp,
                                            lastModifiedBy: lastModifiedBy
                                        });
                                    } else {
                                        let indexOfFirstSlash = deletedFiles[i].indexOf('/');
                                        let subFolder = deletedFiles[i].substring(0, indexOfFirstSlash);
                                        if (subFolder.includes('assays')) {
                                            newArcObject.assays.push({
                                                file: deletedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'deleted',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('studies')) {
                                            newArcObject.studies.push({
                                                file: deletedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'deleted',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('runs')) {
                                            newArcObject.runs.push({
                                                file: deletedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'deleted',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('workflows')) {
                                            newArcObject.workflows.push({
                                                file: deletedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'deleted',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                        if (subFolder.includes('externals')) {
                                            newArcObject.externals.push({
                                                file: deletedFiles[i].slice(indexOfFirstSlash + 1),
                                                status: 'deleted',
                                                lastModifiedDate: arcTimestamp,
                                                lastModifiedBy: lastModifiedBy
                                            });
                                        }
                                    }
                                }

                                // not passing the hostname as it is already there in the arc object.
                                databaseConnector.createLatestARC(newArcObject)
                                    .then(result => logger("arc_isa", new Date(), "ArcID " + arcID + " with new version " + arcVersion + " successfully processed for the location " + hostLocation, "Info", {}))
                                    .catch(err => {
                                        console.error(new Date() + " ERROR: " + JSON.stringify(err));
                                        logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                    });

                                if (visibilityLevel > 0) {
                                    //data is the reqJSON body which is the ISA file from arcCommander
                                    // need to check if the investigation file got modified...
                                    if ((addedFiles.filter(e => e.includes('investigation')).length > 0) ||
                                        (modifiedFiles.filter(e => e.includes('investigation')).length > 0)) {
                                        logger("arc_isa", new Date(), "Processing the new investigation file for the ARC ID" + arcID + " with new version " + arcVersion + " for the location " + hostLocation, "Info", {})

                                        //need to pass hostname to create investigation under that particular host
                                        databaseConnector.createInvestigation(arcID, arcVersion, HOSTNAME, hostLocation, jsonData)
                                            .then(() => {
                                                logger("arc_isa", new Date(), "Processed the ISA file for the ArcID " + arcID + "and version " + arcVersion + " for the location " + hostLocation, "Info", {});
                                                getParameterValues(newArcObject, jsonData).then((paramObjects) => {
                                                    paramObjects.forEach(paramObject => {
                                                        databaseConnector.createParameterValues(paramObject)
                                                            .then(() => logger("arc_isa_parameters", new Date(), "Processed the parameter " + paramObject.nameTermAnnotationValue + " for the ARC " + paramObject.arcID, "Info", {}))
                                                            .catch(err => {
                                                                console.log("An error occurred in invoking createParameterValues API " + err);
                                                                logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                                            })
                                                    });
                                                })
                                            })
                                            .catch(err => {
                                                console.log("An error occurred in invoking createInvestigation API " + err);
                                                logger("arc_intg_gitlab", new Date(), JSON.stringify(err), "Error", req.body);
                                            });

                                    } else {
                                        logger("arc_isa", new Date(), "No updates found in the investigation file for the ARC ID" + arcID + " and version " + arcVersion + " for the location " + hostLocation, "Info", {})
                                    }
                                    //    }
                                }
                            }
                        });
                    });
                }));
            }
        }
    } else {
        logger("arc_isa", new Date(), "Not a push message. Rejecting the webhook request.", "Info", req.body);
    }
});

function getARCVisibility(visibilityLevel) {
    return new Promise(function (resolve) {

        let visibilityLevelDesc = '';
        if (visibilityLevel > 0) {
            visibilityLevelDesc = 'Public';
        } else if (visibilityLevel === 0) {
            visibilityLevelDesc = 'Private';
        } else {
            visibilityLevelDesc = 'Unknown';
        }

        resolve(visibilityLevelDesc);
    })
}


function getLocationFromHostName(hostName) {
    return new Promise(function (resolve) {
        let location = '';
        if (hostName.includes('gitdev.nfdi4plants.org')) {
            location = 'Freiburg';
        } else if (hostName.includes('gitdev2.nfdi4plants.org')) {
            location = 'Freiburg2';
        } else {
            location = 'Unknown';
        }
        resolve(location);
    })
}

function getParameterValues(arcObject, jsonData) {
    return new Promise(function (resolve) {
        let paramObjects = [];
        let studies = jsonData['studies'];

        //study parameters
        if (typeof studies !== 'undefined') {
            studies.forEach(function (study) {
                let studyProtocols = study['protocols'];
                if (typeof studyProtocols !== 'undefined') {
                    studyProtocols.forEach(function (studyProtocol) {
                        let parameters = studyProtocol['parameters'];
                        if (typeof parameters !== 'undefined') {
                            parameters.forEach(function (parameter) {
                                console.log('study parameters: ' + parameter);
                                let paramObject = {};
                                paramObject.arcID = arcObject.arcID;
                                paramObject.arcVersion = arcObject.arcVersion;
                                paramObject.investigationFilename = arcObject.investigationFilename;
                                paramObject.gitLabHost = arcObject.gitLabHost;
                                paramObject.gitLabHostLocation = arcObject.gitLabHostLocation;
                                paramObject.studyIdentifier = study.identifier;
                                paramObject.protocolName = studyProtocol.name;
                                paramObject.isaPath = 'studies.protocols.parameters';
                                paramObject.valuesType = 'study_parameters';

                                if (parameter.hasOwnProperty('parameterName')) {
                                    if (typeof (parameter.parameterName) === 'object') {
                                        if (parameter.parameterName.hasOwnProperty('termSource')) {
                                            paramObject.nameTermSource = parameter.parameterName.termSource;
                                        }
                                        if (parameter.parameterName.hasOwnProperty('termAccession')) {
                                            paramObject.nameTermAccession = parameter.parameterName.termAccession;
                                        }
                                        if (parameter.parameterName.hasOwnProperty('annotationValue')) {
                                            paramObject.nameTermAnnotationValue = parameter.parameterName.annotationValue;
                                            paramObject.name = parameter.parameterName.annotationValue;
                                        }
                                    } else {
                                        paramObject.name = parameter.annotationValue;
                                    }
                                }
                                paramObjects.push(paramObject);
                            })
                        }
                    });
                }
            });
        }


        //study factors
        if (typeof studies !== 'undefined') {
            studies.forEach(function (study) {
                let studyFactors = study['factors'];
                if (typeof studyFactors !== 'undefined') {
                    studyFactors.forEach(function (studyFactor) {
                        if (typeof studyFactor !== 'undefined') {
                            console.log('study factors: ' + studyFactor);
                            let paramObject = {};
                            paramObject.arcID = arcObject.arcID;
                            paramObject.arcVersion = arcObject.arcVersion;
                            paramObject.investigationFilename = arcObject.investigationFilename;
                            paramObject.gitLabHost = arcObject.gitLabHost;
                            paramObject.gitLabHostLocation = arcObject.gitLabHostLocation;
                            paramObject.studyIdentifier = study.identifier;
                            paramObject.isaPath = 'studies.factors';
                            paramObject.valuesType = 'study_factors';

                            if (studyFactor.hasOwnProperty('factorName')) {
                                paramObject.name = studyFactor.factorName;
                            }

                            if (studyFactor.hasOwnProperty('factorType')) {
                                if (typeof (studyFactor.factorType) === 'object') {
                                    if (studyFactor.factorType.hasOwnProperty('termSource')) {
                                        paramObject.nameTermSource = studyFactor.factorType.termSource;
                                    }
                                    if (studyFactor.factorType.hasOwnProperty('termAccession')) {
                                        paramObject.nameTermAccession = studyFactor.factorType.termAccession;
                                    }
                                    if (studyFactor.factorType.hasOwnProperty('annotationValue')) {
                                        paramObject.nameTermAnnotationValue = studyFactor.factorType.annotationValue;
                                        paramObject.name = studyFactor.factorType.annotationValue;
                                    }
                                }
                            }
                            paramObjects.push(paramObject);
                        }
                    });
                }
            });
        }

        //assay parameter values
        if (typeof studies !== 'undefined') {
            studies.forEach(function (study) {
                let assays = study['assays'];
                if (typeof assays !== 'undefined') {
                    assays.forEach(function (assay) {
                        let processSequences = assay['processSequence'];
                        if (typeof processSequences !== 'undefined') {
                            processSequences.forEach(function (processSequence) {
                                let parameterValues = processSequence['parameterValues'];
                                if (typeof parameterValues !== 'undefined') {
                                    parameterValues.forEach(function (parameterValue) {
                                        console.log('assay parameters: ' + parameterValue);
                                        let paramObject = {};
                                        paramObject.arcID = arcObject.arcID;
                                        paramObject.arcVersion = arcObject.arcVersion;
                                        paramObject.investigationFilename = arcObject.investigationFilename;
                                        paramObject.gitLabHost = arcObject.gitLabHost;
                                        paramObject.gitLabHostLocation = arcObject.gitLabHostLocation;
                                        paramObject.studyIdentifier = study.identifier;
                                        paramObject.assayIdentifier = assay.filename;
                                        paramObject.protocolName = processSequence.executesProtocol.name;
                                        paramObject.processSequenceName = processSequence.name;
                                        paramObject.isaPath = 'studies.assays.processSequence.parameterValues';
                                        paramObject.valuesType = 'assay_parameters';

                                        if (parameterValue.category.hasOwnProperty('parameterName')) {
                                            paramObject.name = '';
                                            if (parameterValue.category.parameterName.hasOwnProperty('termSource')) {
                                                paramObject.nameTermSource = parameterValue.category.parameterName.termSource;
                                            }
                                            if (parameterValue.category.parameterName.hasOwnProperty('termSource')) {
                                                paramObject.nameTermSource = parameterValue.category.parameterName.termSource;
                                            }
                                            if (parameterValue.category.parameterName.hasOwnProperty('termAccession')) {
                                                paramObject.nameTermAccession = parameterValue.category.parameterName.termAccession;
                                            }
                                            if (parameterValue.category.parameterName.hasOwnProperty('annotationValue')) {
                                                paramObject.nameTermAnnotationValue = parameterValue.category.parameterName.annotationValue;
                                                paramObject.name = parameterValue.category.parameterName.annotationValue;
                                            }
                                        }

                                        if (parameterValue.hasOwnProperty('value')) {
                                            if (typeof (parameterValue.value) === 'object') {
                                                if (parameterValue.value.hasOwnProperty('termSource')) {
                                                    paramObject.valueTermSource = parameterValue.value.termSource;
                                                }
                                                if (parameterValue.value.hasOwnProperty('termAccession')) {
                                                    paramObject.valueTermAccession = parameterValue.value.termAccession;
                                                }
                                                if (parameterValue.value.hasOwnProperty('annotationValue')) {
                                                    paramObject.valueTermAnnotationValue = parameterValue.value.annotationValue;
                                                    paramObject.value = parameterValue.value.annotationValue;
                                                }
                                            } else {
                                                paramObject.value = parameterValue.value;
                                            }
                                        }

                                        if (parameterValue.hasOwnProperty('unit')) {
                                            if (typeof (parameterValue.unit) === 'object') {
                                                if (parameterValue.unit.hasOwnProperty('termSource')) {
                                                    paramObject.valueUnitTermSource = parameterValue.unit.termSource;
                                                }
                                                if (parameterValue.unit.hasOwnProperty('termAccession')) {
                                                    paramObject.valueUnitTermAccession = parameterValue.unit.termAccession;
                                                }
                                                if (parameterValue.unit.hasOwnProperty('annotationValue')) {
                                                    paramObject.valueUnitTermAnnotationValue = parameterValue.unit.annotationValue;
                                                    paramObject.valueUnit = parameterValue.unit.annotationValue;
                                                }
                                            } else {
                                                paramObject.valueUnit = parameterValue.unit;
                                            }
                                        }
                                        paramObjects.push(paramObject);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // assay input factor values
        if (typeof studies !== 'undefined') {
            studies.forEach(function (study) {
                let assays = study['assays'];
                if (typeof assays !== 'undefined') {
                    assays.forEach(function (assay) {
                        let processSequences = assay['processSequence'];
                        if (typeof processSequences !== 'undefined') {
                            processSequences.forEach(function (processSequence) {
                                let inputs = processSequence['inputs'];
                                if (typeof inputs !== 'undefined') {
                                    inputs.forEach(function (input) {
                                        let factorValues = input['factorValues'];
                                        if (typeof factorValues !== 'undefined') {
                                            factorValues.forEach(function (factorValue) {
                                                console.log('assay input factors: '  + factorValues);
                                                let paramObject = {};
                                                paramObject.arcID = arcObject.arcID;
                                                paramObject.arcVersion = arcObject.arcVersion;
                                                paramObject.investigationFilename = arcObject.investigationFilename;
                                                paramObject.gitLabHost = arcObject.gitLabHost;
                                                paramObject.gitLabHostLocation = arcObject.gitLabHostLocation;
                                                paramObject.studyIdentifier = study.identifier;
                                                paramObject.assayIdentifier = assay.filename;
                                                paramObject.protocolName = processSequence.executesProtocol.name;
                                                paramObject.processSequenceName = processSequence.name;
                                                paramObject.isaPath = 'studies.assays.processSequence.inputs.factorValues';
                                                paramObject.valuesType = 'assay_input_factors';
                                                //        paramObject.derivesFrom = ' ';
                                                if (factorValue.category.hasOwnProperty('factorName')) {
                                                    paramObject.name = factorValue.category.factorName;
                                                    if (factorValue.category.hasOwnProperty('factorType')){
                                                        if (typeof(factorValue.category.factorType) === 'object'){
                                                            if (factorValue.category.factorType.hasOwnProperty('termSource')) {
                                                                paramObject.nameTermSource = factorValue.category.factorType.termSource;
                                                            }
                                                            if (factorValue.category.factorType.hasOwnProperty('termAccession')) {
                                                                paramObject.nameTermAccession = factorValue.category.factorType.termAccession;
                                                            }
                                                            if (factorValue.category.factorType.hasOwnProperty('annotationValue')) {
                                                                paramObject.nameTermAnnotationValue = factorValue.category.factorType.annotationValue;
                                                                paramObject.name = factorValue.category.factorType.annotationValue;
                                                            }
                                                        }
                                                    }
                                                }

                                                if (factorValue.hasOwnProperty('value')) {
                                                    if (typeof (factorValue.value) === 'object') {
                                                        if (factorValue.value.hasOwnProperty('termSource')) {
                                                            paramObject.valueTermSource = factorValue.value.termSource;
                                                        }
                                                        if (factorValue.value.hasOwnProperty('termAccession')) {
                                                            paramObject.valueTermAccession = factorValue.value.termAccession;
                                                        }
                                                        if (factorValue.value.hasOwnProperty('annotationValue')) {
                                                            paramObject.valueTermAnnotationValue = factorValue.value.annotationValue;
                                                            paramObject.value = factorValue.value.annotationValue;
                                                        }
                                                    } else {
                                                        paramObject.value = factorValue.value;
                                                    }
                                                }

                                                if (factorValue.hasOwnProperty('unit')) {
                                                    if (typeof (factorValue.unit) === 'object') {
                                                        if (factorValue.unit.hasOwnProperty('termSource')) {
                                                            paramObject.valueUnitTermSource = factorValue.unit.termSource;
                                                        }
                                                        if (factorValue.unit.hasOwnProperty('termAccession')) {
                                                            paramObject.valueUnitTermAccession = factorValue.unit.termAccession;
                                                        }
                                                        if (factorValue.unit.hasOwnProperty('annotationValue')) {
                                                            paramObject.valueUnitTermAnnotationValue = factorValue.unit.annotationValue;
                                                            paramObject.valueUnit = factorValue.unit.annotationValue;
                                                        }
                                                    } else {
                                                        paramObject.valueUnit = factorValue.unit;
                                                    }
                                                }
                                                paramObjects.push(paramObject);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // assay output factor values
        if (typeof studies !== 'undefined') {
            studies.forEach(function (study) {
                let assays = study['assays'];
                if (typeof assays !== 'undefined') {
                    assays.forEach(function (assay) {
                        let processSequences = assay['processSequence'];
                        if (typeof processSequences !== 'undefined') {
                            processSequences.forEach(function (processSequence) {
                                let outputs = processSequence['outputs'];
                                if (typeof outputs !== 'undefined') {
                                    outputs.forEach(function (output) {
                                        let factorValues = output['factorValues'];
                                        if (typeof factorValues !== 'undefined') {
                                            factorValues.forEach(function (factorValue) {
                                                console.log('assay output factors: ' + factorValue);
                                                let paramObject = {};
                                                paramObject.arcID = arcObject.arcID;
                                                paramObject.arcVersion = arcObject.arcVersion;
                                                paramObject.investigationFilename = arcObject.investigationFilename;
                                                paramObject.gitLabHost = arcObject.gitLabHost;
                                                paramObject.gitLabHostLocation = arcObject.gitLabHostLocation;
                                                paramObject.studyIdentifier = study.identifier;
                                                paramObject.assayIdentifier = assay.filename;
                                                paramObject.protocolName = processSequence.executesProtocol.name;
                                                paramObject.processSequenceName = processSequence.name;
                                                paramObject.isaPath = 'studies.assays.processSequence.outputs.factorValues';
                                                paramObject.valuesType = 'assay_output_factors';
                                                //        paramObject.derivesFrom = ' ';
                                                if (factorValue.category.hasOwnProperty('factorName')) {
                                                    paramObject.name = factorValue.category.factorName;
                                                    if (factorValue.category.hasOwnProperty('factorType')){
                                                        if (typeof(factorValue.category.factorType) === 'object'){
                                                            if (factorValue.category.factorType.hasOwnProperty('termSource')) {
                                                                paramObject.nameTermSource = factorValue.category.factorType.termSource;
                                                            }
                                                            if (factorValue.category.factorType.hasOwnProperty('termAccession')) {
                                                                paramObject.nameTermAccession = factorValue.category.factorType.termAccession;
                                                            }
                                                            if (factorValue.category.factorType.hasOwnProperty('annotationValue')) {
                                                                paramObject.nameTermAnnotationValue = factorValue.category.factorType.annotationValue;
                                                                paramObject.name = factorValue.category.factorType.annotationValue;
                                                            }
                                                        }
                                                    }
                                                }

                                                if (factorValue.hasOwnProperty('value')) {
                                                    if (typeof (factorValue.value) === 'object') {
                                                        if (factorValue.value.hasOwnProperty('termSource')) {
                                                            paramObject.valueTermSource = factorValue.value.termSource;
                                                        }
                                                        if (factorValue.value.hasOwnProperty('termAccession')) {
                                                            paramObject.valueTermAccession = factorValue.value.termAccession;
                                                        }
                                                        if (factorValue.value.hasOwnProperty('annotationValue')) {
                                                            paramObject.valueTermAnnotationValue = factorValue.value.annotationValue;
                                                            paramObject.value = factorValue.value.annotationValue;
                                                        }
                                                    } else {
                                                        paramObject.value = factorValue.value;
                                                    }
                                                }

                                                if (factorValue.hasOwnProperty('unit')) {
                                                    if (typeof (factorValue.unit) === 'object') {
                                                        if (factorValue.unit.hasOwnProperty('termSource')) {
                                                            paramObject.valueUnitTermSource = factorValue.unit.termSource;
                                                        }
                                                        if (factorValue.unit.hasOwnProperty('termAccession')) {
                                                            paramObject.valueUnitTermAccession = factorValue.unit.termAccession;
                                                        }
                                                        if (factorValue.unit.hasOwnProperty('annotationValue')) {
                                                            paramObject.valueUnitTermAnnotationValue = factorValue.unit.annotationValue;
                                                            paramObject.valueUnit = factorValue.unit.annotationValue;
                                                        }
                                                    } else {
                                                        paramObject.valueUnit = factorValue.unit;
                                                    }
                                                }
                                                paramObjects.push(paramObject);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        resolve(paramObjects);
    })
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
    logger("arc_intg_gitlab", new Date(), "Service arc_intg_gitlab started on port 3000.", "Info", {});
});