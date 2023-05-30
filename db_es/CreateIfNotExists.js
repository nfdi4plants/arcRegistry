// added gitLabRepoVisibility field to the DB

const logger = require('./Logger');

module.exports = function (client) {
    return new Promise(function (resolve, reject) {
        client.indices.exists({index: 'metadata'})
            .then(result => {
                if (result.statusCode !== 200) {
                    console.log('No index metadata exists.');
                    logger("arc_db_es", new Date(), 'No index metadata exists.', "Info", {});
                    console.log('Create new index metadata.');
                    logger("arc_db_es", new Date(), 'Create new index metadata.', "Info", {});

                    client.indices.create({index: 'metadata', body: metaDataMapping})
                        .then(result => console.log(result.body))
                        .catch(err => {
                            console.error(new Date() + " ERROR: " + err.meta.body.error);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                } else {
                    console.log('Index metadata already exists.');
                }
                resolve();
            })
            .catch(err => {
                console.error(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });


        client.indices.exists({index: 'parameter_values'})
            .then(result => {
                if (result.statusCode !== 200) {
                    console.log('No index parameter_values exists.');
                    logger("arc_db_es", new Date(), 'No index parameter_values exists.', "Info", {});
                    console.log('Create new index parameter_values.');
                    logger("arc_db_es", new Date(), 'Create new index parameter_values.', "Info", {});

                    client.indices.create({index: 'parameter_values', body: valuesMapping})
                        .then(result => console.log(result.body))
                        .catch(err => {
                            console.error(new Date() + " ERROR: " + err.meta.body.error);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                } else {
                    console.log('Index parameter_values already exists.');
                }
                resolve();
            })
            .catch(err => {
                console.error(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });


        client.indices.exists({index: 'investigation'})
            .then(result => {
                if (result.statusCode !== 200) {
                    console.log('No index investigation exists.');
                    logger("arc_db_es", new Date(), 'No index investigation exists.', "Info", {});
                    console.log('Create new index investigation.');
                    logger("arc_db_es", new Date(), 'Create new index investigation.', "Info", {});

                    client.indices.create({index: 'investigation', body: investigationMapping})
                        .then(result => console.log(result.body))
                        .catch(err => {
                            console.error(new Date() + err);
                            logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
                        });
                } else {
                    console.log('Index investigation already exists.');
                }
                resolve();
            })
            .catch(err => {
                console.error(err);
                logger("arc_db_es", new Date(), JSON.stringify(err), "Error", {});
            });
    })
}

const metaDataMapping = {
    "settings": {
        "index.mapping.total_fields.limit": 100000,
        "number_of_shards": 1,
        "number_of_replicas": 1
    },
    "mappings": {
        "properties": {
            "arcID": {
                "type": "keyword"
            },
            "arcVersion": {
                "type": "integer"
            },
            "arcCreationDate": {
                "type": "date"
            },
            "arcLastModifiedDate": {
                "type": "date"
            },
            "investigationFilename": {
                "type": "keyword"
            },
            "arcSize": {
                "type": "long"
            },
            "gitLabUserID": {
                "type": "long"
            },
            "gitLabUserName": {
                "type": "text"
            },
            "gitLabUserUserName": {
                "type": "keyword"
            },
            "gitLabUserEmail": {
                "type": "keyword"
            },
            "gitLabRepoVisibility": {
                "type": "keyword"
            },
            "gitLabHost":{
                "type": "keyword"
            },
            "gitLabHostURL":{
                "type": "text"
            },
            "gitLabHostLocation":{
                "type": "text"
            },
            "gitLabHostVersion":{
                "type": "text"
            },
            "investigations": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            },
            "assays": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            },
            "studies": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            },
            "workflows": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            },
            "externals": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            },
            "runs": {
                "properties": {
                    "file": {
                        "type": "keyword"
                    },
                    "status": {
                        "type": "keyword"
                    },
                    "creationDate": {
                        "type": "date"
                    },
                    "lastModifiedDate": {
                        "type": "date"
                    },
                    "lastModifiedBy": {
                        "type": "text"
                    }
                }
            }
        }
    }
}

const valuesMapping = {
    "settings": {
        "index.mapping.total_fields.limit": 100000,
        "number_of_shards": 1,
        "number_of_replicas": 1
    },
    "mappings": {
        "properties": {
            "arcID": {
                "type": "keyword"
            },
            "arcVersion": {
                "type": "integer"
            },
            "investigationFilename": {
                "type": "keyword"
            },
            "gitLabHost": {
                "type": "keyword"
            },
            "gitLabHostLocation": {
                "type": "text"
            },
            "studyIdentifier": {
                "type": "keyword"
            },
            "assayIdentifier": {
                "type": "keyword"
            },
            "protocolName": {
                "type": "keyword"
            },
            "processSequenceName": {
                "type": "keyword"
            },
            "derivesFrom": {
                "type": "keyword"
            },
            "isaPath": {
                "type": "text"
            },
            "valuesType": {
                // types are characteristics, factors or parameters
                "type": "keyword"
            },
            "name": {
                "type": "text"
            },
            "nameTermSource": {
                "type": "keyword"
            },
            "nameTermAccession": {
                "type": "text"
            },
            "nameTermAnnotationValue": {
                "type": "text"
            },
            "value": {
                "type": "text"
            },
            "valueTermSource": {
                "type": "keyword"
            },
            "valueTermAccession": {
                "type": "text"
            },
            "valueTermAnnotationValue": {
                "type": "text"
            },
            "valueUnit": {
                "type": "text"
            },
            "valueUnitTermSource": {
                "type": "keyword"
            },
            "valueUnitTermAccession": {
                "type": "text"
            },
            "valueUnitTermAnnotationValue": {
                "type": "text"
            }
        }
    }
}

const investigationMapping = {
    "settings": {
        "index.mapping.total_fields.limit": 100000,
        "index.mapping.nested_fields.limit": 100000,
        "index.mapping.nested_objects.limit": 100000,
        "number_of_shards": 1,
        "number_of_replicas": 1
    },
    "mappings": {
        "dynamic_templates": [
            {
                "annotationValue": {
                    "match": "annotationValue",
                    "mapping": {
                        "type": "keyword"
                    }
                }
            },
            {
                "otherMaterials": {
                    "path_match": "*.otherMaterials.*.derivesFrom",
                    "mapping": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "keyword"
                            },
                            "type": {
                                "type": "keyword"
                            },
                            "characteristics": {
                                "type": "nested",
                                "properties": {
                                    "category": {
                                        "type": "object",
                                        "properties": {
                                            "characteristicType": {
                                                "type": "nested"
                                            }
                                        }
                                    },
                                    "value": {
                                        "type": "keyword"
                                    },
                                    "unit": {
                                        "type": "object"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "previousProcess": {
                    "match": "previousProcess",
                    "mapping": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "keyword"
                            },
                            "executesProtocol": {
                                "type": "object",
                                "properties": {
                                    "comments": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "text"
                                            },
                                            "value": {
                                                "type": "text"
                                            }
                                        }
                                    },
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "protocolType": {
                                        "type": "object"
                                    },
                                    "description": {
                                        "type": "text"
                                    },
                                    "uri": {
                                        "type": "keyword"
                                    },
                                    "version": {
                                        "type": "keyword"
                                    },
                                    "parameters": {
                                        "type": "nested",
                                        "properties": {
                                            "parameterName": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "components": {
                                        "type": "nested",
                                        "properties": {
                                            "componentName": {
                                                "type": "keyword"
                                            },
                                            "componentType": {
                                                "type": "object"
                                            }
                                        }
                                    }
                                }
                            },
                            "parameterValues": {
                                "type": "nested",
                                "properties": {
                                    "category": {
                                        "type": "object",
                                        "properties": {
                                            "parameterName": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "value": {
                                        "type": "keyword"
                                    },
                                    "unit": {
                                        "type": "object"
                                    }
                                }
                            },
                            "performer": {
                                "type": "text"
                            },
                            "date": {
                                "type": "keyword"
                            },
                            "previousProcess": {
                                "type": "object"
                            },
                            "nextProcess": {
                                "type": "object"
                            },
                            "inputs": {
                                "type": "nested"
                            },
                            "outputs": {
                                "type": "nested"
                            },
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "nextProcess": {
                    "match": "nextProcess",
                    "mapping": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "keyword"
                            },
                            "executesProtocol": {
                                "type": "object",
                                "properties": {
                                    "comments": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "text"
                                            },
                                            "value": {
                                                "type": "text"
                                            }
                                        }
                                    },
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "protocolType": {
                                        "type": "object"
                                    },
                                    "description": {
                                        "type": "text"
                                    },
                                    "uri": {
                                        "type": "keyword"
                                    },
                                    "version": {
                                        "type": "keyword"
                                    },
                                    "parameters": {
                                        "type": "nested",
                                        "properties": {
                                            "parameterName": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "components": {
                                        "type": "nested",
                                        "properties": {
                                            "componentName": {
                                                "type": "keyword"
                                            },
                                            "componentType": {
                                                "type": "object"
                                            }
                                        }
                                    }
                                }
                            },
                            "parameterValues": {
                                "type": "nested",
                                "properties": {
                                    "category": {
                                        "type": "object",
                                        "properties": {
                                            "parameterName": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "value": {
                                        "type": "keyword"
                                    },
                                    "unit": {
                                        "type": "object"
                                    }
                                }
                            },
                            "performer": {
                                "type": "text"
                            },
                            "date": {
                                "type": "keyword"
                            },
                            "previousProcess": {
                                "type": "object"
                            },
                            "nextProcess": {
                                "type": "object"
                            },
                            "inputs": {
                                "type": "nested"
                            },
                            "outputs": {
                                "type": "nested"
                            },
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ],
        "properties": {
            "arcID": {
                "type": "keyword"
            },
            "arcVersion": {
                "type": "integer"
            },
            "gitLabHost":{
                "type": "keyword"
            },
            "gitLabHostURL":{
                "type": "text"
            },
            "gitLabHostLocation":{
                "type": "text"
            },
            "gitLabHostVersion":{
                "type": "text"
            },
            "filename": {
                "type": "keyword"
            },
            "identifier": {
                "type": "keyword"
            },
            "title": {
                "type": "text"
            },
            "description": {
                "type": "text"
            },
            "submissionDate": {
                "type": "text"
            },
            "publicReleaseDate": {
                "type": "text"
            },
            "ontologySourceReferences": {
                "type": "nested",
                "properties": {
                    "comments": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "text"
                            },
                            "value": {
                                "type": "text"
                            }
                        }
                    },
                    "description": {
                        "type": "text"
                    },
                    "file": {
                        "type": "keyword"
                    },
                    "name": {
                        "type": "text"
                    },
                    "version": {
                        "type": "keyword"
                    }
                }
            },
            "publications": {
                "type": "nested",
                "properties": {
                    "comments": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "text"
                            },
                            "value": {
                                "type": "text"
                            }
                        }
                    },
                    "pubMedID": {
                        "type": "keyword"
                    },
                    "doi": {
                        "type": "keyword"
                    },
                    "authorList": {
                        "type": "text"
                    },
                    "title": {
                        "type": "text"
                    },
                    "status": {
                        "type": "object"
                    }
                }
            },
            "people": {
                "type": "nested",
                "properties": {
                    "lastName": {
                        "type": "text"
                    },
                    "firstName": {
                        "type": "text"
                    },
                    "midInitials": {
                        "type": "text"
                    },
                    "email": {
                        "type": "text"
                    },
                    "phone": {
                        "type": "keyword"
                    },
                    "fax": {
                        "type": "keyword"
                    },
                    "address": {
                        "type": "text"
                    },
                    "affiliation": {
                        "type": "text"
                    },
                    "roles": {
                        "type": "nested"
                    },
                    "comments": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "text"
                            },
                            "value": {
                                "type": "text"
                            }
                        }
                    }
                }
            },
            "studies": {
                "type": "nested",
                "properties": {
                    "filename": {
                        "type": "text"
                    },
                    "identifier": {
                        "type": "keyword"
                    },
                    "title": {
                        "type": "text"
                    },
                    "description": {
                        "type": "text"
                    },
                    "submissionDate": {
                        "type": "text"
                    },
                    "publicReleaseDate": {
                        "type": "text"
                    },
                    "publications": {
                        "type": "nested",
                        "properties": {
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            },
                            "pubMedID": {
                                "type": "keyword"
                            },
                            "doi": {
                                "type": "keyword"
                            },
                            "authorList": {
                                "type": "text"
                            },
                            "title": {
                                "type": "text"
                            },
                            "status": {
                                "type": "object"
                            }
                        }
                    },
                    "people": {
                        "type": "nested",
                        "properties": {
                            "lastName": {
                                "type": "text"
                            },
                            "firstName": {
                                "type": "text"
                            },
                            "midInitials": {
                                "type": "text"
                            },
                            "email": {
                                "type": "text"
                            },
                            "phone": {
                                "type": "keyword"
                            },
                            "fax": {
                                "type": "keyword"
                            },
                            "address": {
                                "type": "text"
                            },
                            "affiliation": {
                                "type": "text"
                            },
                            "roles": {
                                "type": "nested"
                            },
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            }
                        }
                    },
                    "studyDesignDescriptors": {
                        "type": "nested"
                    },
                    "protocols": {
                        "type": "nested",
                        "properties": {
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            },
                            "name": {
                                "type": "keyword"
                            },
                            "protocolType": {
                                "type": "object"
                            },
                            "description": {
                                "type": "text"
                            },
                            "uri": {
                                "type": "keyword"
                            },
                            "version": {
                                "type": "keyword"
                            },
                            "parameters": {
                                "type": "nested",
                                "properties": {
                                    "parameterName": {
                                        "type": "object"
                                    }
                                }
                            },
                            "components": {
                                "type": "nested",
                                "properties": {
                                    "componentName": {
                                        "type": "keyword"
                                    },
                                    "componentType": {
                                        "type": "object"
                                    }
                                }
                            }
                        }
                    },
                    "materials": {
                        "type": "object",
                        "properties": {
                            "sources": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "characteristics": {
                                        "type": "nested",
                                        "properties": {
                                            "category": {
                                                "type": "object",
                                                "properties": {
                                                    "characteristicType": {
                                                        "type": "nested"
                                                    }
                                                }
                                            },
                                            "value": {
                                                "type": "keyword"
                                            },
                                            "unit": {
                                                "type": "object"
                                            }
                                        }
                                    }
                                }
                            },
                            "samples": {
                                "type": "nested",
                                "properties": {
                                    "characteristics": {
                                        "type": "nested",
                                        "properties": {
                                            "category": {
                                                "type": "object",
                                                "properties": {
                                                    "characteristicType": {
                                                        "type": "nested"
                                                    }
                                                }
                                            },
                                            "value": {
                                                "type": "keyword"
                                            },
                                            "unit": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "factorValues": {
                                        "type": "nested",
                                        "properties": {
                                            "category": {
                                                "type": "object",
                                                "properties": {
                                                    "factorName": {
                                                        "type": "keyword"
                                                    },
                                                    "factorType": {
                                                        "type": "object"
                                                    },
                                                    "comments": {
                                                        "type": "nested",
                                                        "properties": {
                                                            "name": {
                                                                "type": "text"
                                                            },
                                                            "value": {
                                                                "type": "text"
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            "value": {
                                                "type": "keyword"
                                            },
                                            "unit": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "derivesFrom": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "keyword"
                                            },
                                            "characteristics": {
                                                "type": "nested",
                                                "properties": {
                                                    "category": {
                                                        "type": "object",
                                                        "properties": {
                                                            "characteristicType": {
                                                                "type": "nested"
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "type": "keyword"
                                                    },
                                                    "unit": {
                                                        "type": "object"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "otherMaterials": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "type": {
                                        "type": "keyword"
                                    },
                                    "characteristics": {
                                        "type": "nested",
                                        "properties": {
                                            "category": {
                                                "type": "object",
                                                "properties": {
                                                    "characteristicType": {
                                                        "type": "nested"
                                                    }
                                                }
                                            },
                                            "value": {
                                                "type": "keyword"
                                            },
                                            "unit": {
                                                "type": "object"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "processSequence": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "keyword"
                            },
                            "executesProtocol": {
                                "type": "nested",
                                "properties": {
                                    "comments": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "text"
                                            },
                                            "value": {
                                                "type": "text"
                                            }
                                        }
                                    },
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "protocolType": {
                                        "type": "object"
                                    },
                                    "description": {
                                        "type": "text"
                                    },
                                    "uri": {
                                        "type": "keyword"
                                    },
                                    "version": {
                                        "type": "keyword"
                                    },
                                    "parameters": {
                                        "type": "nested",
                                        "properties": {
                                            "parameterName": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "components": {
                                        "type": "nested",
                                        "properties": {
                                            "componentName": {
                                                "type": "keyword"
                                            },
                                            "componentType": {
                                                "type": "object"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "assays": {
                        "type": "nested",
                        "properties": {
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            },
                            "filename": {
                                "type": "keyword"
                            },
                            "measurementType": {
                                "type": "object"
                            },
                            "technologyType": {
                                "type": "object",
                                "properties": {
                                    "ontologyAnnotation": {
                                        "type": "object"
                                    }
                                }
                            },
                            "technologyPlatform": {
                                "type": "text"
                            },
                            "dataFiles": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "type": {
                                        "type": "keyword"
                                    },
                                    "comments": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "text"
                                            },
                                            "value": {
                                                "type": "text"
                                            }
                                        }
                                    }
                                }
                            },
                            "materials": {
                                "type": "object",
                                "properties": {
                                    "samples": {
                                        "type": "nested",
                                        "properties": {
                                            "characteristics": {
                                                "type": "nested",
                                                "properties": {
                                                    "category": {
                                                        "type": "object",
                                                        "properties": {
                                                            "characteristicType": {
                                                                "type": "nested"
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "type": "keyword"
                                                    },
                                                    "unit": {
                                                        "type": "object"
                                                    }
                                                }
                                            },
                                            "factorValues": {
                                                "type": "nested",
                                                "properties": {
                                                    "category": {
                                                        "type": "object",
                                                        "properties": {
                                                            "factorName": {
                                                                "type": "keyword"
                                                            },
                                                            "factorType": {
                                                                "type": "object"
                                                            },
                                                            "comments": {
                                                                "type": "nested",
                                                                "properties": {
                                                                    "name": {
                                                                        "type": "text"
                                                                    },
                                                                    "value": {
                                                                        "type": "text"
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "type": "keyword"
                                                    },
                                                    "unit": {
                                                        "type": "object"
                                                    }
                                                }
                                            },
                                            "derivesFrom": {
                                                "type": "nested",
                                                "properties": {
                                                    "name": {
                                                        "type": "keyword"
                                                    },
                                                    "characteristics": {
                                                        "type": "nested",
                                                        "properties": {
                                                            "category": {
                                                                "type": "object",
                                                                "properties": {
                                                                    "characteristicType": {
                                                                        "type": "nested"
                                                                    }
                                                                }
                                                            },
                                                            "value": {
                                                                "type": "keyword"
                                                            },
                                                            "unit": {
                                                                "type": "object"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "otherMaterials": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "keyword"
                                            },
                                            "type": {
                                                "type": "keyword"
                                            },
                                            "characteristics": {
                                                "type": "nested",
                                                "properties": {
                                                    "category": {
                                                        "type": "object",
                                                        "properties": {
                                                            "characteristicType": {
                                                                "type": "nested"
                                                            }
                                                        }
                                                    },
                                                    "value": {
                                                        "type": "keyword"
                                                    },
                                                    "unit": {
                                                        "type": "object"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "characteristicCategories": {
                                "type": "nested",
                                "properties": {
                                    "characteristicType": {
                                        "type": "nested"
                                    }
                                }
                            },
                            "unitCategories": {
                                "type": "nested"
                            },
                            "processSequence": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "keyword"
                                    },
                                    "executesProtocol": {
                                        "type": "object",
                                        "properties": {
                                            "comments": {
                                                "type": "nested",
                                                "properties": {
                                                    "name": {
                                                        "type": "text"
                                                    },
                                                    "value": {
                                                        "type": "text"
                                                    }
                                                }
                                            },
                                            "name": {
                                                "type": "keyword"
                                            },
                                            "protocolType": {
                                                "type": "object"
                                            },
                                            "description": {
                                                "type": "text"
                                            },
                                            "uri": {
                                                "type": "keyword"
                                            },
                                            "version": {
                                                "type": "keyword"
                                            },
                                            "parameters": {
                                                "type": "nested",
                                                "properties": {
                                                    "parameterName": {
                                                        "type": "object"
                                                    }
                                                }
                                            },
                                            "components": {
                                                "type": "nested",
                                                "properties": {
                                                    "componentName": {
                                                        "type": "keyword"
                                                    },
                                                    "componentType": {
                                                        "type": "object"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "parameterValues": {
                                        "type": "nested",
                                        "properties": {
                                            "category": {
                                                "type": "object",
                                                "properties": {
                                                    "parameterName": {
                                                        "type": "object"
                                                    }
                                                }
                                            },
                                            "value": {
                                                "type": "keyword"
                                            },
                                            "unit": {
                                                "type": "object"
                                            }
                                        }
                                    },
                                    "performer": {
                                        "type": "text"
                                    },
                                    "date": {
                                        "type": "keyword"
                                    },
                                    "inputs": {
                                        "type": "nested"
                                    },
                                    "outputs": {
                                        "type": "nested"
                                    },
                                    "comments": {
                                        "type": "nested",
                                        "properties": {
                                            "name": {
                                                "type": "text"
                                            },
                                            "value": {
                                                "type": "text"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "factors": {
                        "type": "nested",
                        "properties": {
                            "factorName": {
                                "type": "keyword"
                            },
                            "factorType": {
                                "type": "object"
                            },
                            "comments": {
                                "type": "nested",
                                "properties": {
                                    "name": {
                                        "type": "text"
                                    },
                                    "value": {
                                        "type": "text"
                                    }
                                }
                            }
                        }
                    },
                    "characteristicCategories": {
                        "type": "nested",
                        "properties": {
                            "characteristicType": {
                                "type": "object"
                            }
                        }
                    },
                    "unitCategories": {
                        "type": "nested"
                    },
                    "comments": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "text"
                            },
                            "value": {
                                "type": "text"
                            }
                        }
                    }
                }
            },
            "comments": {
                "type": "nested",
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "text"
                    }
                }
            }
        }
    }
}