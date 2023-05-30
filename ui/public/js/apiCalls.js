//const NODE = 'https://arcregistrydev.nfdi4plants.org/';

/*const urls = {
    getARCs: 'https://arcregistrydev.nfdi4plants.org/getARCs',
    getInvestigations: 'https://arcregistrydev.nfdi4plants.org/getInvestigations',
    getInvestigation: 'https://arcregistrydev.nfdi4plants.org/getInvestigation',
    postQuery: 'https://arcregistrydev.nfdi4plants.org/postQuery',
    getPublications: 'https://arcregistrydev.nfdi4plants.org/getPublications',
    getLogs: 'https://arcregistrydev.nfdi4plants.org/getLogs',
    getSpecificARC: 'https://arcregistrydev.nfdi4plants.org/getSpecificARC',
    getAllParams: 'https://arcregistrydev.nfdi4plants.org/getAllParams',
    getParameter: 'https://arcregistrydev.nfdi4plants.org/getParameter'
};*/

const endPointsWithHost = ['getSpecificARC', 'getInvestigation'];

const queryFields = ['arcID', 'identifier', 'studies.identifier', 'arcVersion', 'ontologySourceReferences.version', 'description', 'ontologySourceReferences.description',
    'submissionDate', 'title', 'publications.title', 'studies.title', 'publicReleaseDate', 'comments.name', 'ontologySourceReferences.comments.name', 'people.comments.name',
    'studies.people.comments.name', 'studies.protocols.comments.name', 'studies.protocols.parameters.parameterName.comments.name', 'studies.characteristicCategories.characteristicType.comments.name',
    'studies.assays.processSequence.parameterValues.category.parameterName.comments.name', 'studies.assays.processSequence.executesProtocol.comments.name', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.comments.name',
    'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.comments.name', 'studies.processSequence.inputs.characteristics.category.characteristicType.comments.name',
    'studies.processSequence.parameterValues.category.parameterName.comments.name', 'studies.processSequence.executesProtocol.comments.name', 'studies.processSequence.executesProtocol.parameters.parameterName.comments.name',
    'comments.value', 'ontologySourceReferences.comments.value', 'people.comments.value', 'studies.people.comments.value', 'studies.protocols.comments.value', 'studies.protocols.parameters.parameterName.comments.value',
    'studies.characteristicCategories.characteristicType.comments.value', 'studies.assays.processSequence.parameterValues.category.parameterName.comments.value', 'studies.assays.processSequence.executesProtocol.comments.value',
    'studies.assays.processSequence.executesProtocol.parameters.parameterName.comments.value', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.comments.value',
    'studies.processSequence.inputs.characteristics.category.characteristicType.comments.value', 'studies.processSequence.parameterValues.category.parameterName.comments.value',
    'studies.processSequence.executesProtocol.comments.value', 'studies.processSequence.executesProtocol.parameters.parameterName.comments.value', 'people.firstName', 'studies.people.firstName',
    'people.lastName', 'studies.people.lastName', 'people.address', 'studies.people.address', 'people.phone', 'studies.people.phone', 'people.affiliation', 'studies.people.affiliation',
    'people.midInitials', 'people.fax', 'people.email', 'studies.people.email', 'people.roles.annotationValue', 'publications.status.annotationValue', 'studies.people.roles.annotationValue',
    'studies.characteristicCategories.characteristicType.annotationValue', 'studies.assays.processSequence.parameterValues.category.parameterName.annotationValue', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.annotationValue',
    'studies.assays.measurementType.annotationValue', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.annotationValue', 'studies.processSequence.inputs.characteristics.category.characteristicType.annotationValue',
    'studies.processSequence.parameterValues.category.parameterName.annotationValue', 'studies.processSequence.executesProtocol.parameters.parameterName.annotationValue',
    'studies.protocols.parameters.parameterName.annotationValue', 'people.roles.termAccession', 'studies.people.roles.termAccession', 'studies.characteristicCategories.characteristicType.termAccession',
    'studies.assays.processSequence.parameterValues.category.parameterName.termAccession', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.termAccession',
    'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.termAccession', 'studies.processSequence.inputs.characteristics.category.characteristicType.termAccession',
    'people.roles.termSource', 'studies.people.roles.termSource', 'studies.characteristicCategories.characteristicType.termSource', 'studies.assays.processSequence.parameterValues.category.parameterName.termSource',
    'studies.assays.processSequence.executesProtocol.parameters.parameterName.termSource', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.termSource',
    'studies.processSequence.inputs.characteristics.category.characteristicType.termSource', 'ontologySourceReferences.file', 'studies.filename', 'publications.authorList',
    'publications.doi', 'publications.pubMedID', 'ontologySourceReferences.name', 'studies.protocols.name', 'studies.processSequence.name', 'studies.processSequence.executesProtocol.name', 'studies.processSequence.inputs.name',
    'studies.processSequence.outputs.name', 'studies.processSequence.outputs.derivesFrom.name', 'studies.assays.processSequence.name', 'studies.assays.processSequence.executesProtocol.name', 'studies.assays.processSequence.inputs.name',
    'studies.assays.processSequence.outputs.name', 'studies.assays.processSequence.outputs.derivesFrom.name', 'studies.processSequence.parameterValues.value', 'studies.processSequence.inputs.characteristics.value',
    'studies.processSequence.outputs.derivesFrom.characteristics.value', 'studies.assays.processSequence.parameterValues.value'];

/*
const invokeServiceCall = (params, service) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = urls[service];
        if (Object.keys(params).length === 0) {
            xhr.open('GET', url);
        } else {
            let queryString = "";
            Object.keys(params).forEach(key => {
                queryString += key + "=" + params[key] + "&";
            });
            xhr.open('GET', url + '?' + queryString);
        }
        xhr.onload = () => {
            if (xhr.status === 200) resolve(xhr.responseText);
            else reject(Error(xhr.statusText + 'status : ' + xhr.status));
        }
        xhr.onerror = () => {
            reject(Error('Network Error'))
        }
        xhr.send();
    });
};
 */

function getQueryStringForService(params, service) {
    let queryString = '';
    if (endPointsWithHost.includes(service)) {
        let gitLabHost = params[params.findIndex(param => param.key === 'gitLabHost')].value;
        let arcID = params[params.findIndex(param => param.key === 'arcID')].value;
        let arcVersion = params[params.findIndex(param => param.key === 'arcVersion')].value;
        queryString = 'gitLabHost=' + gitLabHost + '&arcID=' + arcID + '&arcVersion=' + arcVersion;
    } else {
        params.forEach(param => queryString += param.key + "=" + param.value + "&");
    }
    return queryString;
}


const invokeAPI = (params, service) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let queryString = "";
        let url = getNode() + service;
        if (params.length === 0) {
            xhr.open('GET', url);
        } else {
            queryString = getQueryStringForService(params, service);
            xhr.open('GET', url + '?' + queryString);
        }
        xhr.onload = () => {
            if (xhr.status === 200) resolve(xhr.responseText);
            else reject(Error(xhr.statusText + 'status : ' + xhr.status));
        }
        xhr.onerror = () => {
            reject(Error('Network Error'))
        }
        xhr.send();
    });
};

const invokePostAPI = (params, booleanOperator, service) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = getNode() + service;
        let isFirstParam = true;
        let body = {};
        body.queryLimit = 10;
        body.queryFields = queryFields;
        body.queryExpression = "";
        params.forEach(param => {
            let expression = param.key + param.operator + "'" + param.value + "'";
            if (isFirstParam) {
                body.queryExpression += expression;
                isFirstParam = false;
            } else {
                body.queryExpression += " " + booleanOperator + " " + expression;
            }
        });
        let data = JSON.stringify(body);
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status === 200) resolve(xhr.responseText);
            else reject(Error(xhr.statusText + 'status : ' + xhr.status));
        }
        xhr.onerror = () => {
            reject(Error('Network Error'))
        }
        xhr.send(data);
    });
};


/*const invokePOSTCall = (params, operator, service) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = urls[service];
        let isFirstParam = true;
        let body = {};
        body.queryLimit = 10;
        body.queryFields = queryFields;
        body.queryExpression = "";

        params.forEach(key => {
            if (isFirstParam) {
                body.queryExpression += key;
                isFirstParam = false;
            } else {
                body.queryExpression += " " + operator + " " + key;
            }
        });
        let data = JSON.stringify(body);
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => {
            if (xhr.status === 200) resolve(xhr.responseText);
            else reject(Error(xhr.statusText + 'status : ' + xhr.status));
        }
        xhr.onerror = () => {
            reject(Error('Network Error'))
        }
        xhr.send(data);
    });
};*/
