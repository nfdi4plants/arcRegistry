let params = [];
// let arcID = '', arcVersion = '';
const fields = {
    'ARC ID': 'arcID',
    'Identifier': 'identifier',
    'File Name': 'filename',
    'Title': 'title',
    'Description': 'description',
    'Submitted Before (Date)': 'submittedBefore',
    'Submitted After (Date)': 'submittedAfter',
    'Published Before (Date)': 'publishedBefore',
    'Published After (Date)': 'publishedAfter'
};

const fieldsForModal = {
    'Select': ['select'],
    'ARC ID': ['arcID'],
    'Identifier': ['identifier', 'studies.identifier'],
    'Version': ['arcVersion', 'ontologySourceReferences.version'],
    'Description': ['description', 'ontologySourceReferences.description'],
    'Submission Date': ['submissionDate'],
    'Title': ['title', 'publications.title', 'studies.title'],
    'Public Release Date': ['publicReleaseDate'],
    'Comment': ['ontologySourceReferences.comments.name', 'comments.name', 'people.comments.name', 'studies.people.comments.name', 'studies.protocols.comments.name', 'studies.protocols.parameters.parameterName.comments.name', 'studies.characteristicCategories.characteristicType.comments.name', 'studies.assays.processSequence.parameterValues.category.parameterName.comments.name', 'studies.assays.processSequence.executesProtocol.comments.name', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.comments.name', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.comments.name', 'studies.processSequence.inputs.characteristics.category.characteristicType.comments.name', 'studies.processSequence.parameterValues.category.parameterName.comments.name', 'studies.processSequence.executesProtocol.comments.name', 'studies.processSequence.executesProtocol.parameters.parameterName.comments.name'],
    'Comment Description': ['ontologySourceReferences.comments.value', 'comments.value', 'people.comments.value', 'studies.people.comments.value', 'studies.protocols.comments.value', 'studies.protocols.parameters.parameterName.comments.value', 'studies.characteristicCategories.characteristicType.comments.value', 'studies.assays.processSequence.parameterValues.category.parameterName.comments.value', 'studies.assays.processSequence.executesProtocol.comments.value', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.comments.value', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.comments.value', 'studies.processSequence.inputs.characteristics.category.characteristicType.comments.value', 'studies.processSequence.parameterValues.category.parameterName.comments.value', 'studies.processSequence.executesProtocol.comments.value', 'studies.processSequence.executesProtocol.parameters.parameterName.comments.value'],
    'First Name': ['people.firstName', 'studies.people.firstName'],
    'Last Name': ['people.lastName', 'studies.people.lastName'],
    'Address': ['people.address', 'studies.people.address'],
    'Phone': ['people.phone', 'studies.people.phone'],
    'Affiliation': ['people.affiliation', 'studies.people.affiliation'],
    'Mid Initials': ['people.midInitials'],
    'Fax': ['people.fax'],
    'Email': ['people.email', 'studies.people.email'],
    'Annotation Value': ['people.roles.annotationValue', 'publications.status.annotationValue', 'studies.people.roles.annotationValue', 'studies.characteristicCategories.characteristicType.annotationValue', 'studies.assays.processSequence.parameterValues.category.parameterName.annotationValue', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.annotationValue', 'studies.assays.measurementType.annotationValue', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.annotationValue', 'studies.processSequence.inputs.characteristics.category.characteristicType.annotationValue', 'studies.processSequence.parameterValues.category.parameterName.annotationValue', 'studies.processSequence.executesProtocol.parameters.parameterName.annotationValue', 'studies.protocols.parameters.parameterName.annotationValue'],
    'Term Accession': ['people.roles.termAccession', 'studies.people.roles.termAccession', 'studies.characteristicCategories.characteristicType.termAccession', 'studies.assays.processSequence.parameterValues.category.parameterName.termAccession', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.termAccession', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.termAccession', 'studies.processSequence.inputs.characteristics.category.characteristicType.termAccession'],
    'Term Source': ['people.roles.termSource', 'studies.people.roles.termSource', 'studies.characteristicCategories.characteristicType.termSource', 'studies.assays.processSequence.parameterValues.category.parameterName.termSource', 'studies.assays.processSequence.executesProtocol.parameters.parameterName.termSource', 'studies.processSequence.outputs.derivesFrom.characteristics.category.characteristicType.termSource', 'studies.processSequence.inputs.characteristics.category.characteristicType.termSource'],
    'File': ['studies.filename', 'studies.assays.filename', 'ontologySourceReferences.file'],
    'Other names': ['ontologySourceReferences.name', 'studies.protocols.name', 'studies.processSequence.name', 'studies.processSequence.executesProtocol.name', 'studies.processSequence.inputs.name', 'studies.processSequence.outputs.name', 'studies.processSequence.outputs.derivesFrom.name', 'studies.assays.processSequence.name', 'studies.assays.processSequence.executesProtocol.name', 'studies.assays.processSequence.inputs.name', 'studies.assays.processSequence.outputs.name', 'studies.assays.processSequence.outputs.derivesFrom.name'],
    'Other values': ['studies.processSequence.parameterValues.value', 'studies.processSequence.inputs.characteristics.value', 'studies.processSequence.outputs.derivesFrom.characteristics.value', 'studies.assays.processSequence.parameterValues.value'],
    'Author List': ['publications.authorList'],
    'DOI': ['publications.doi'],
    'pubMedID': ['publications.pubMedID']
};

const operators = {
    'equals': '=',
    'contains': 'contains',
    'greater than': '>',
    'greater than or equal': '>=',
    'less than': '<',
    'less than or equal': '<='
};

function pageLoadData() {
    // in case of empty parameters, use the getInvestigation API, else queryAPI
    if (params.length === 0) {
        invokeAPI([], 'getInvestigations').then((response) => {
            let formattedResp = formatGetInvestigationsResponse(JSON.parse(response));
            loadDataTable(formattedResp);
        }).catch((error) => {
            console.log("Error :: " + JSON.stringify(error));
        });
    } else {
        invokePostAPI(params, 'OR', 'postQuery').then((response) => {
            let formattedResp = formatGetInvestigationsResponse(JSON.parse(response));
            loadDataTable(formattedResp);
        }).catch((error) => {
            console.log("Error :: " + JSON.stringify(error));
        });
    }
}

function pageLoadTable() {
    let $isaTable = $('#isaTable');
    $isaTable.DataTable({
        columns: [
            { title: 'Location' },
            { title: 'ARC Name' },
            { title: 'ARC ID' },
            { title: 'Title' },
            { title: 'Description' },
            { title: 'ARC Version' },
            { title: 'Related Studies & Assays' },
            { title: 'Submission Date' },
            { title: 'Public Release Date' },
            { title: 'Host' }
        ],
        columnDefs: [{
            targets: [0, 3, 4, 7, 8],
            render: function (data) {
                if (data.length > 100) {
                    data = data.substring(0, 100).concat('...');
                } else if (data.length === 0) {
                    data = '-';
                }
                return data;
            }
        }]
    });

    $isaTable.on('click', 'tbody tr', function () {
        let table = $('#isaTable').DataTable();
        let isNotEmpty = table.rows().count() !== 0;
        if (isNotEmpty) {
            let data = table.row(this).data();
            let arcParams = [];
            arcParams.push({
                key: 'gitLabHost',
                value: data[9]
            })
            arcParams.push({
                key: 'arcID',
                value: data[2]
            })
            arcParams.push({
                key: 'arcVersion',
                value: data[5]
            })
            displayISADetails(arcParams).then(() => {
                $('#modalForDetails').modal('show');
            }).catch((error) => {
                console.log("Error :: " + JSON.stringify(error));
            });
        }

    });
}

function formatGetInvestigationsResponse(response) {
    let arr = [];
    if (response.hasOwnProperty('hits')) {
        response.hits.forEach((ele) => {
            let innerArr = [];
            innerArr.push(ele.data.gitLabHostLocation || "");
            innerArr.push(ele.data.identifier || "");
            innerArr.push(ele.data.arcID || "");
            innerArr.push(ele.data.title || "");
            innerArr.push(ele.data.description || "");
            innerArr.push(ele.data.arcVersion || "");
            innerArr.push(getRelatedStudiesAndAssays(ele.data.studies));
            innerArr.push(dateFormatter(ele.data.submissionDate || ""));
            innerArr.push(dateFormatter(ele.data.publicReleaseDate || ""));
            innerArr.push(ele.data.gitLabHost || "");
            arr.push(innerArr);
        });
    }
    return arr;
}

function loadDataTable(formattedResp) {
    let table = $('#isaTable').DataTable();
    table.clear();
    if (formattedResp.length !== 0) {
        formattedResp.forEach(element => {
            table.row.add(element);
        });
    }
    table.draw();
}

function getOperatorDesc(operator) {
    return Object.keys(operators)[Object.values(operators).indexOf(operator)];
}

function addKeyword() {
    let filterCriteria = document.getElementById('inputKeyword').value;
    let inputValue = document.getElementById('inputValue').value;
    let selectedOperator = '=';
    let selectedOperatorDesc = getOperatorDesc(selectedOperator);
    if (filterCriteria !== "Select" && inputValue !== null) {
        if (filterCriteria.includes('Date')) {
            inputValue = inputValue.split('-').reverse().join('-');
        }
        let newKeyword = fields[filterCriteria];
        if (params.findIndex(param => ((param.key === newKeyword) && (param.operator === selectedOperator) && (param.value === inputValue))) >= 0) {
            $('#modalForParameterExists').modal('show');
        } else {
            //add the predicate to the array
            params.push({
                key: newKeyword,
                value: inputValue,
                operator: selectedOperator
            });
            //invoke function to fetch results for the given predicates
            invokePostAPI(params, 'OR', 'postQuery').then((response) => {
                let formattedResp = formatGetInvestigationsResponse(JSON.parse(response));
                loadDataTable(formattedResp);
                // add all the relevant predicates - todo
                $('#filterResult').append(`<div class="item item_${newKeyword}_${inputValue}_${selectedOperatorDesc} filter alert d-inline-block alert-dismissible input-group-append" style="margin-bottom: 0.1rem !important; padding-top: 0.1rem !important; padding-bottom: 0.1rem !important;">${newKeyword} ${selectedOperator} ${inputValue}<button type="button" class="close" onclick="removeKeyword('${newKeyword}_${inputValue}_${selectedOperatorDesc}')" style="padding-top: 0.1rem !important;" data-dismiss="alert">&times;</button></div>`);
            }).catch((error) => {
                console.log("Error :: " + JSON.stringify(error));
            }).finally(() => {
                $('#btnSearch').prop('disabled', true);
            });
        }
    }
    document.getElementById('inputKeyword').value = 'Select';
    document.getElementById('inputValue').value = '';
}

function removeKeyword(filter) {
    //remove the predicate from the screen
    $(".item_" + filter).remove();
    let index = filter.indexOf('_');
    let keyword = filter.substring(0, index);
    let filter1 = filter.slice(index + 1);
    index = filter1.indexOf('_');
    let inputValue = filter1.substring(0, index);
    let selectedOperator = operators[filter1.slice(index + 1)];
    //remove the predicate from the array
    params.splice(params.findIndex(param => ((param.key === keyword) && (param.value === inputValue) && (param.operator === selectedOperator))), 1)
    pageLoadData();
}

function getPredicatesFromAdvSearch() {
    // clean up all the existing predicates on screen. We will be adding them again!!!
    $(".item").remove();
    // there is no need to invoke the API here. Just pass on the predicates to the main screen and invoke the page load function.
    if (params.length > 0) {
        params.forEach(param => {
            let newKeyword = param.key;
            let inputValue = param.value;
            let selectedOperator = param.operator;
            let selectedOperatorDesc = getOperatorDesc(selectedOperator);
            $('#filterResult').append(`<div class="item item_${newKeyword}_${inputValue}_${selectedOperatorDesc} filter alert d-inline-block alert-dismissible input-group-append" style="margin-bottom: 0.1rem !important; padding-top: 0.1rem !important; padding-bottom: 0.1rem !important;">${newKeyword} ${selectedOperator} ${inputValue}<button type="button" class="close" onclick="removeKeyword('${newKeyword}_${inputValue}_${selectedOperatorDesc}')" style="padding-top: 0.1rem !important;" data-dismiss="alert">&times;</button></div>`);
        });
    }
    //$('#modalForSearch').modal('hide');
    clearAll();
    //pageLoadData();
    invokePostAPI(params, 'OR', 'postQuery').then((response) => {
        let formattedResp = formatGetInvestigationsResponse(JSON.parse(response));
        loadDataTable(formattedResp);
    }).catch((error) => {
        console.log("Error :: " + JSON.stringify(error));
    });
}

function loadDropdown() {
    let searchList = document.getElementById('inputKeyword');
    Object.keys(fields).forEach((key) => {
        searchList.add(new Option(key));
    });
}

function checkToEnableButton() {
    let filterCriteria = document.getElementById('inputKeyword').value;
    let inputValue = document.getElementById('inputValue').value;
    if (filterCriteria !== "Select" && inputValue.trim() !== "") {
        $('#btnSearch').prop('disabled', false);
    } else {
        $('#btnSearch').prop('disabled', true);
    }
}

function showAdvancedSearchModal() {
    let $resultTable = $('#resultTable');
    $resultTable.DataTable({
        columns: [
            { title: 'Location' },
            { title: 'ARC Name' },
            { title: 'ARC ID' },
            { title: 'Parameter Type' },
            { title: 'ARC Version' },
            { title: 'Study' },
            { title: 'Assay' },
            { title: 'Study Protocol' },
            { title: 'Process Sequence' },
            { title: 'Host' }
        ],
        pageLength: 50,
        columnDefs: [{
            targets: [0],
            render: data => {
                return (data.length === 0 ? '-' : data);
            }
        }]
    });
    $('#modalForSearch').modal('show');
}

function clearAll() {
    document.getElementById('queryToExecute').replaceChildren();
    document.getElementById('inputKeyFromAdvSearch').value = '';
    document.getElementById('inputValueFromAdvSearch').value = '';
    document.getElementById('rdAssays').checked = true;
    document.getElementById('rdStudies').checked = false;
    document.getElementById('rdFactors').checked = false;
    document.getElementById('rdParameters').checked = true;
    document.getElementById('chkAnywhere').checked = false;
    let table = $('#resultTable').DataTable();
    table.clear();
    table.destroy();
}

function addResultToTable() {
    addParameterToQueryBox();
    let result = [];
    let promises = [];
    $.map($("#queryToExecute").children(), d => {
        let vals = $(d).attr("id").split('_');
        let params = [];
        if (vals[0] !== '') {
            params.push({
                key: 'parameterName',
                value: vals[0]
            });
        }
        if (vals[1] !== '') {
            params.push({
                key: 'parameterValue',
                value: vals[1]
            });
        }
        promises.push(invokeAPI(params, 'getAllParams').then((response) => {
            result.push(JSON.parse(response));
        }).catch((error) => {
            console.log("Error :: " + JSON.stringify(error));
        }));
    });
    Promise.all(promises).then(() => {
        loadParamsDataTable(result);
    }).finally(() => {
        document.getElementById('inputKeyFromAdvSearch').value = '';
        document.getElementById('inputValueFromAdvSearch').value = '';
        document.getElementById('resultTable').removeAttribute('hidden');
        document.getElementById('divParamDetails').setAttribute('hidden', true);
    });
}

function addParameterToQueryBox() {
    let inputKeyFromAdvSearch = document.getElementById('inputKeyFromAdvSearch').value;
    let inputValueFromAdvSearch = document.getElementById('inputValueFromAdvSearch').value;
    let selectedOperatorDesc = 'equals';
    let selectedOperator = '=';
    if (inputKeyFromAdvSearch.trim() !== '' && inputValueFromAdvSearch.trim() !== '') {
        $('#queryToExecute').append(`<div id="${inputKeyFromAdvSearch}_${inputValueFromAdvSearch}_${selectedOperatorDesc}" class="item item_${inputKeyFromAdvSearch}_${inputValueFromAdvSearch}_${selectedOperatorDesc} filter alert d-inline-block alert-dismissible input-group-append" style="margin-bottom: 0.1rem !important; padding-top: 0.1rem !important; padding-bottom: 0.1rem !important;">${inputKeyFromAdvSearch} ${selectedOperator} ${inputValueFromAdvSearch}<button type="button" class="close" onclick="removeAdvSearchSelection('${inputKeyFromAdvSearch}_${inputValueFromAdvSearch}_${selectedOperatorDesc}')" style="padding-top: 0.1rem !important;" data-dismiss="alert">&times;</button></div>`);
    }
    if (inputKeyFromAdvSearch.trim() !== '' && inputValueFromAdvSearch.trim() === '') {
        $('#queryToExecute').append(`<div id="${inputKeyFromAdvSearch}_" class="item item_${inputKeyFromAdvSearch}_ filter alert d-inline-block alert-dismissible input-group-append" style="margin-bottom: 0.1rem !important; padding-top: 0.1rem !important; padding-bottom: 0.1rem !important;">${inputKeyFromAdvSearch}<button type="button" class="close" onclick="removeAdvSearchSelection('${inputKeyFromAdvSearch}_')" style="padding-top: 0.1rem !important;" data-dismiss="alert">&times;</button></div>`);
    }
    if (inputKeyFromAdvSearch.trim() === '' && inputValueFromAdvSearch.trim() !== '') {
        $('#queryToExecute').append(`<div id="_${inputValueFromAdvSearch}" class="item item_${inputValueFromAdvSearch}_ filter alert d-inline-block alert-dismissible input-group-append" style="margin-bottom: 0.1rem !important; padding-top: 0.1rem !important; padding-bottom: 0.1rem !important;">${inputValueFromAdvSearch}<button type="button" class="close" onclick="removeAdvSearchSelection('${inputValueFromAdvSearch}_')" style="padding-top: 0.1rem !important;" data-dismiss="alert">&times;</button></div>`);
    }
}

function removeAdvSearchSelection(filter) {
    //remove the predicate from the screen
    $(".item_" + filter).remove();
    setTimeout(addResultToTable, 200);
}

function goToARCDetails() {
    let params = {};
    params["arcID"] = arcID;
    params["arcVersion"] = arcVersion;
    displayARCDetails(params).then(() => {
        document.getElementById('arcDetails').removeAttribute('hidden');
        document.getElementById('isaDetails').setAttribute('hidden', true);
    }).catch(() => {
        document.getElementById('isaDetails').removeAttribute('hidden');
        document.getElementById('arcDetails').setAttribute('hidden', true);
    });
}

function backToISADetails() {
    document.getElementById('isaDetails').removeAttribute('hidden');
    document.getElementById('arcDetails').setAttribute('hidden', true);
}

function formatGetParamsResponse(data) {
    let arr = [];
    arr.push(data.gitLabHostLocation || "");
    arr.push(data.investigationFilename || "");
    arr.push(data.arcID || "");
    arr.push(data.valuesType || "");
    arr.push(data.arcVersion);
    arr.push(data.studyIdentifier || "");
    arr.push(data.assayIdentifier || "");
    arr.push(data.protocolName || "");
    arr.push(data.processSequenceName || "");
    arr.push(data.gitLabHost || "");
    return arr;
}

function loadParamsDataTable(response) {
    let paramTable = $('#resultTable').DataTable();
    paramTable.clear();
    if (response.length !== 0) {
        response.forEach(element => {
            if (element.hits.length !== 0) {
                element.hits.forEach((ele) => {
                    let data = ele.data;
                    if (document.getElementById('chkAnywhere').checked) {
                        paramTable.row.add(formatGetParamsResponse(data));
                    } else {
                        let radio = document.querySelector("input[type='radio'][name=isaRadios]:checked").value;
                        let subRadio = document.querySelector("input[type='radio'][name=subRadios]:checked").value;
                        if (data.valuesType.includes(radio + '_' + subRadio)) {
                            paramTable.row.add(formatGetParamsResponse(data));
                        }
                    }
                });
            }
        });
    }
    paramTable.draw();
    paramTable.on('click', 'tbody tr', function () {
        let tableRows = $('#resultTable').DataTable();
        let isNotEmpty = tableRows.rows().count() !== 0;
        if (isNotEmpty) {
            let data = tableRows.row(this).data();
            let paramParams = [];
            paramParams.push({
                key: 'gitLabHost',
                value: data[9]
            })
            paramParams.push({
                key: 'arcID',
                value: data[2]
            })
            paramParams.push({
                key: 'arcVersion',
                value: data[4]
            })
            paramParams.push({
                key: 'type',
                value: data[3]
            })
            displayParamDetails(paramParams);
        }
    });
}

function displayParamDetails(paramParams) {
    let result = {};
    let promises = [];
    promises.push(invokeAPI(paramParams, 'getParameter').then((response) => {
        response = JSON.parse(response);
        result.isaResp = response;
    }));
    promises.push(invokeAPI(paramParams, 'getSpecificARC').then((response) => {
        response = JSON.parse(response);
        result.arcResp = response;
    }));

    Promise.all(promises).then(() => {
        createParamModal(result);
    }).catch((error) => {
        console.log(error)
    });
}

function createParamModal(response) {
    let detailsContent = document.getElementById('divParamDetails');
    detailsContent.innerHTML = '';
    let text = detailsContent.innerHTML;
    let studyIdentifier = "";
    let assayIdentifier = "";
    let valuesType = "";

    let headings = response.isaResp.hits[0].data; //using first object to extract common data
    if (headings.hasOwnProperty('studyIdentifier')) {
        studyIdentifier = headings.studyIdentifier;
    }
    if (headings.hasOwnProperty('assayIdentifier')) {
        assayIdentifier = headings.assayIdentifier;
    }
    if (headings.hasOwnProperty('valuesType')) {
        valuesType = headings.valuesType;
    }

    //arc data
    let arcData = response.arcResp;
    text += `<div class="row"><div class="col col-11">`;
    if (response.arcResp.hasOwnProperty('investigationFilename')) {
        text += `<a id="linkToARC" href="${arcData.gitLabHostURL}" target="_blank"><h4 class="modal-title" id="filename">${arcData.investigationFilename}</h4></a><br>`
    }
    text += `</div>`;
    text += `<div class="col col-1"><button type="button" id="btnBackToTable" class="close" onClick="onClickRowClose()"><span aria-hidden="true">&times;</span></button></div></div>`;
    text += `<div class="container box"><div class="row gx-sm-5"><div class="col col-6">
            <div class="card"><div class="card-header">ARC Details</div>
            <div class="card-body"><h5 class="card-title">ARC ID ${arcData.arcID || "-"}</h5>
            <h6 class="card-subtitle mb-2 text-muted">ARC Version ${arcData.arcVersion || "-"}</h6>
            <div class="row gx-sm-5"><div class="col col-4">Location:</div><div class="col col-8">${arcData.gitLabHostLocation || "-"}</div></div>
            <div class="row gx-sm-5"><div class="col col-4">Visibility:</div><div class="col col-8">${arcData.gitLabRepoVisibility || "-"}</div></div>
            <div class="row gx-sm-5"><div class="col col-4">Created On:</div><div class="col col-8">${dateFormatter(arcData.arcCreationDate) || "-"}</div></div>
            <div class="row gx-sm-5"><div class="col col-4">Modified On:</div><div class="col col-8">${dateFormatter(arcData.arcLastModifiedDate) || "-"}</div></div>
            </div></div></div>
            <div class="col col-6"><div class="card"><div class="card-header">Metadata</div>
            <div class="card-body"><h5 class="card-title">ISA Details</h5><h6 class="card-subtitle mb-2 text-muted">From Gitlab</h6>
            <div class="row gx-sm-5"></div>
            <div class="row gx-sm-5"><div class="col col-4">Study:</div><div class="col col-8">${studyIdentifier || "-"}</div></div>
            <div class="row gx-sm-5"><div class="col col-4">Assay:</div><div class="col col-8">${assayIdentifier || "-"}</div></div>
            <div class="row gx-sm-5"></div><div class="row gx-sm-5"><div class="col col-4">Parameters Type:</div><div class="col col-8">${valuesType || "-"}</div></div>
            <div class="row gx-sm-5"></div><div class="row gx-sm-5"><div class="col col-4">Gitlab User:</div><div class="col col-8">${arcData.gitLabUserName || "-"}</div></div>
            </div></div></div></div></div>`;

    text += `<div id="paramcontent" class="container modal-databox">`;
    text += `<div class="row">`;
    text += `</div>`;
    text += `<table class="table w-auto table-striped table-hover text-center"><thead><tr>
                        <th scope="col">Protocol Name</th>
                        <th scope="col">Process Sequence</th>
                        <th scope="col">Term Source</th>
                        <th scope="col">Term Accession</th><th scope="col">Name</th>
                        <th scope="col">Value</th><th scope="col">Unit</th></tr></thead><tbody>`;
    response.isaResp.hits.forEach((e) => {
        let ele = e.data;
        text += `<tr><td><small>${ele.protocolName || "-"}</small></td>
                     <td><small>${ele.processSequenceName || "-"}</small></td>
                     <td><small>${ele.nameTermSource || "-"}</small></td>
                     <td><small>${ele.nameTermAccession || "-"}</small></td>
                     <td><small>${ele.name || "-"}</small></td>
                     <td><small>${ele.value || "-"}</small></td>
                     <td><small>${ele.valueUnit || "-"}</small></td>`;
    });
    text += `</tbody></table>`;
    text += `</div>`;
    detailsContent.innerHTML = text;
    document.getElementById('divParamDetails').removeAttribute('hidden');
    document.getElementById('resultTable').setAttribute('hidden', true);
}

function onClickRowClose() {
    document.getElementById('divParamDetails').removeChild(document.getElementById('paramcontent'));
    document.getElementById('resultTable').removeAttribute('hidden');
    document.getElementById('divParamDetails').setAttribute('hidden', true);
}

function getRelatedStudiesAndAssays(studiesArray) {
    let details = '';
    studiesArray.forEach((ele) => {
        if (ele.hasOwnProperty('assays') && ele.assays.length !== 0) {
            let values = '';
            ele.assays.forEach((assay) => {
                if (assay.filename !== undefined) {
                    values += assay.filename.split('\\')[0];
                }
            });
            if (values.trim() != '') {
                details += ele.identifier + ' [' + values + ' ], ';
            }
        }
    });
    if (details.length > 100) {
        details.substring(0, 100).concat('...')
    }
    if (details.length == 0) {
        details = '-';
    }
    return details;
}

document.addEventListener("DOMContentLoaded", () => {
    let $inputValue = $('#inputValue');
    let $inputKeyFromAdvSearch = $('#inputKeyFromAdvSearch');
    let $inputValueFromAdvSearch = $('#inputValueFromAdvSearch');
    loadDropdown();
    pageLoadTable();
    pageLoadData();
    $inputValue.keyup(checkToEnableButton);
    $inputValue.keypress(function (event) {
        if (event.which === '13') {
            event.preventDefault();
        }
    });
    $('#inputKeyword').change(checkToEnableButton);
    $('#btnAdvSearch').click(() => {
        showAdvancedSearchModal();
    });
    $('#btnModalClear').click(() => {
        document.getElementById('query').value = '';
    });
    $('#btnSelect').click(addResultToTable);
    //$('#btnAdd').click(addParameterToQueryBox);
    $('#btnModalClose').click(clearAll);
    $('#getARCDetails').click(goToARCDetails);
    $('#backISADetails').click(backToISADetails);
    $('#btnDataModalClose').click(() => {
        document.getElementById('ontologyContent').replaceChildren();
        document.getElementById('publicationContent').replaceChildren();
        document.getElementById('peopleContent').replaceChildren();
        document.getElementById('studiesContent').replaceChildren();
    });
    $inputKeyFromAdvSearch.keypress(function (event) {
        if (event.which === '13') {
            event.preventDefault();
        }
    });
    $inputValueFromAdvSearch.keypress(function (event) {
        if (event.which === '13') {
            event.preventDefault();
        }
    });
    $("#inputKeyFromAdvSearch").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: getNode() + 'getAllParams',
                dataType: "json",
                data: {
                    parameterName: document.getElementById('inputKeyFromAdvSearch').value
                },
                type: 'GET',
                success: function (data) {
                    let result = [];
                    if (data.hits.length !== 0) {
                        data.hits.forEach((ele) => {
                            // this is needed because response only accepts array of strings
                            if (result.indexOf(ele.data.name) < 0)
                                (typeof ele.data.name) == 'number' ? result.push(JSON.stringify(ele.data.name)) : result.push(ele.data.name);
                            //  result.push(ele.data.name);
                        });
                        response(result);
                    }
                },
                error: function (result) {
                    console.log("Error");
                }
            });
        },
        autoFocus: true,
        minLength: 3,
        select: function (event, ui) {
            $("#inputKeyFromAdvSearch").val(ui.item.Value);
        }
    });
    $("#inputValueFromAdvSearch").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: getNode() + 'getAllParams',
                dataType: "json",
                data: {
                    parameterValue: document.getElementById('inputValueFromAdvSearch').value
                },
                type: 'GET',
                success: function (data) {
                    let result = [];
                    if (data.hits.length !== 0) {
                        data.hits.forEach((ele) => {
                            // this is needed because response only accepts array of strings
                            if (result.indexOf(ele.data.value) < 0 && result.indexOf(JSON.stringify(ele.data.value)) < 0)
                                (typeof ele.data.value) == 'number' ? result.push(JSON.stringify(ele.data.value)) : result.push(ele.data.value);
                            //  result.push(ele.data.value);

                        });
                        response(result);
                    }
                },
                error: function (result) {
                    console.log("Error");
                }
            });
        },
        autoFocus: true,
        minLength: 3,
        select: function (event, ui) {
            $("#inputValueFromAdvSearch").val(ui.item.Value);
        }
    });
    $('#modalForSearch').on('hidden.bs.modal', function (event) {
        clearAll();
    });
    $('#chkAnywhere').on('change', (event) => {
        if (event.target.checked) {
            document.getElementById('rdAssays').disabled = true;
            document.getElementById('rdStudies').disabled = true;
            document.getElementById('rdFactors').disabled = true;
            document.getElementById('rdParameters').disabled = true;
        } else {
            //default selection
            document.getElementById('rdAssays').disabled = false;
            document.getElementById('rdStudies').disabled = false;
            document.getElementById('rdFactors').disabled = false;
            document.getElementById('rdParameters').disabled = false;
            document.getElementById('rdAssays').checked = true;
            document.getElementById('rdStudies').checked = false;
            document.getElementById('rdFactors').checked = false;
            document.getElementById('rdParameters').checked = true;
        }
    });
    $('#rdAssays').on('click', (event) => {
        if (event.target.checked) {
            document.getElementById('rdStudies').checked = false;
        }
    });
    $('#rdStudies').on('click', (event) => {
        if (event.target.checked) {
            document.getElementById('rdAssays').checked = false;
        }
    });
    $('#rdFactors').on('click', (event) => {
        if (event.target.checked) {
            document.getElementById('rdParameters').checked = false;
        }
    });
    $('#rdParameters').on('click', (event) => {
        if (event.target.checked) {
            document.getElementById('rdFactors').checked = false;
        }
    });
});