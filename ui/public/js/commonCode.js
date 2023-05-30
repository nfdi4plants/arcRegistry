//common code used in arc and isa search
function displayISADetails(arcParams) {
    return new Promise((resolve, reject) => {
        invokeAPI(arcParams, 'getInvestigation').then((response) => {
            response = JSON.parse(response);
            if (response.hasOwnProperty('ontologySourceReferences')) {
                loadOntologyReference(response.ontologySourceReferences);
            } else {
                let text = `<b>No ontology source reference details available.</b>`;
                document.getElementById('ontologyContent').insertAdjacentHTML('beforeend', text);
            }
            if (response.hasOwnProperty('publications')) {
                loadPublications(response.publications);
            } else {
                let text = `<b>No publication details available.</b>`;
                document.getElementById('publicationContent').insertAdjacentHTML('beforeend', text);
            }
            if (response.hasOwnProperty('people')) {
                loadPeople(response.people);
            } else {
                let text = `<b>No people details available.</b>`;
                document.getElementById('peopleContent').insertAdjacentHTML('beforeend', text);
            }
            if (response.hasOwnProperty('studies')) {
                loadStudies(response.studies);
            } else {
                let text = `<b>No studies details available.</b>`;
                document.getElementById('studiesContent').insertAdjacentHTML('beforeend', text);
            }
            if (response.hasOwnProperty('comments')) {
                //loadComments(response.comments);
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}

function loadOntologyReference(resp) {
    let text = "";
    let ontologyContent = document.getElementById('ontologyContent');
    resp.forEach((ele) => {
        text += '<div class="container modal-databox has-bg-lightolive-40">';
        if (ele.hasOwnProperty('file') || ele.hasOwnProperty('name')) {
            text += `<b style="word-wrap:break-word">${ele.name || ""} : ${ele.file || ""}</b>`;
        }
        if (ele.hasOwnProperty('version')) {
            text += `<small> Version ${ele.version}</small>`;
        }
        if (ele.hasOwnProperty('description')) {
            text += `<p><small><b>A brief description: </b>${ele.description}</small></p>`;
        }
        text += '</div>';
    });
    ontologyContent.innerHTML = text;
}

function loadPublications(resp) {
    let text = "";
    let publicationContent = document.getElementById('publicationContent');
    resp.forEach((ele) => {
        text += '<div class="container modal-databox has-bg-lightyellow-70">';
        if (ele.hasOwnProperty('title')) {
            text += `<b>${ele.title} </b><br>`;
        }
        if (ele.hasOwnProperty('authorlist')) {
            text += `<small>${ele.authorList}</small><br>`;
        }
        text += '<p>';
        if (ele.hasOwnProperty('pubMedID')) {
            text += `<small><b>Publication ID: </b>${ele.pubMedID}</small><br>`;
        }
        if (ele.hasOwnProperty('doi')) {
            text += `<small><b>Digital Object Identifier: </b>${ele.doi}</small>`;
        }
        if (ele.hasOwnProperty('status') && ele.status.hasOwnProperty('annotationValue')) {
            text += `<br><small><b>Status: </b>${ele.status.annotationValue}</small>`;
        }
        text += '</p></div>';
    });
    publicationContent.innerHTML = text;
}

function loadStudies(resp) {
    let text = "";
    let studiesContent = document.getElementById('studiesContent');
    resp.forEach((ele, index) => {
        text += '<div class="container modal-databox has-bg-darkblue-lighter-70>';
        if (ele.hasOwnProperty('identifier')) {
            let id = 'studies' + index;
            let rowID = index + 1
            text += `<p id="studies${index}"><b><h4>${rowID}. ${ele.identifier}</b>`;
            if (ele.hasOwnProperty('title')) {
                text += `: <span><b>${ele.title}</b></span>`;
            }
            text += `</h4>`;
        }
        if (ele.hasOwnProperty('description')) {
            text += `<h6>${ele.description}</h6><br>`;
        }
        text += `</p>`;
        text += `<div class="container" id="studiesContent${index}">
        <div class="accordion" id="studies${index}AccordionModal">
        <div class="card">
            <div class="card-header has-bg-darkred-40" id="protocolsContent${index}Heading">
                <h2 class="mb-0">
                    <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#protocolsContent${index}" aria-expanded="true"
                    aria-controls="protocolsContent${index}"><b><h5>Protocols</h5></b></button>
                </h2>
            </div>
            <div id="protocolsContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="protocolsContent${index}Heading"
                 data-parent="#studies${index}AccordionModal">
                <div class="card-body" id="protocolsContent${index}">
                </div>
            </div>
        </div>
        <div class="card">
                <div class="card-header has-bg-darkred-40" id="processSequenceContent${index}Heading">
                    <h2 class="mb-0">
                        <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#processSequenceContent${index}" aria-expanded="true"
                        aria-controls="processSequenceContent${index}"><b><h5>Process Sequence</h5></b></button>
                    </h2>
                </div>
                <div id="processSequenceContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="processSequenceContent${index}Heading"
                     data-parent="#studies${index}AccordionModal">
                    <div class="card-body" id="processSequenceContent${index}">
                   </div>
                </div>
         </div>
        <div class="card">
                <div class="card-header has-bg-darkred-40" id="pplContent${index}Heading">
                    <h2 class="mb-0">
                        <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#pplContent${index}" aria-expanded="true"
                        aria-controls="pplContent${index}"><b><h5>People</h5></b></button>
                    </h2>
                </div>
                <div id="pplContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="pplContent${index}Heading"
                     data-parent="#studies${index}AccordionModal">
                    <div class="card-body" id="pplContent${index}">
                    </div>
                </div>
        </div>
        <div class="card">
                <div class="card-header has-bg-darkred-40" id="characteristicContent${index}Heading">
                    <h2 class="mb-0">
                        <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#characteristicContent${index}" aria-expanded="true"
                         aria-controls="characteristicContent${index}"><b><h5>Characteristics</h5></b></button>
                    </h2>
                </div>
                <div id="characteristicContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="characteristicContent${index}Heading"
                     data-parent="#studies${index}AccordionModal">
                    <div class="card-body" id="characteristicContent${index}">
                    </div>
                </div>
        </div>
        <div class="card">
                <div class="card-header has-bg-darkred-40" id="assaysContent${index}Heading">
                    <h2 class="mb-0">
                        <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#assaysContent${index}" aria-expanded="true"
                        aria-controls="assaysContent${index}"><b><h5>Assays</h5></b></button>
                    </h2>
                </div>
                <div id="assaysContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="assaysContent${index}Heading"
                     data-parent="#studies${index}AccordionModal">
                    <div class="card-body" id="assaysContent${index}">
                    </div>
                </div>
        </div>
        <div class="card">
                <div class="card-header has-bg-darkred-40" id="factorsContent${index}Heading">
                    <h2 class="mb-0">
                        <button class="btn btn-block text-left" type="button" data-toggle="collapse" data-target="#factorsContent${index}" aria-expanded="true"
                        aria-controls="factorsContent${index}"><b><h5>Factors</h5></b></button>
                    </h2>
                </div>
                <div id="factorsContent${index}" class="collapse has-bg-lightred-80" aria-labelledby="factorsContent${index}Heading"
                     data-parent="#studies${index}AccordionModal">
                    <div class="card-body" id="factorsContent${index}">
                    </div>
                </div>
        </div>
    </div>
</div>`;
        text += '</div>'; //for the container
    });
    studiesContent.innerHTML = text;
    loadInnerElementsOfStudies(resp);
}

function loadInnerElementsOfStudies(resp) {
    resp.forEach((ele, index) => {
        if (ele.hasOwnProperty('people') && ele.people.length !== 0) {
            let peopleContent = document.getElementById('pplContent' + index);
            let peopleText = "";
            ele.people.forEach((innerEle) => {
                peopleText += '<div class="col col-3 container modal-databox">';
                if (innerEle.hasOwnProperty('firstName') || innerEle.hasOwnProperty('midInitials') || innerEle.hasOwnProperty('lastName')) {
                    peopleText += `<b>${innerEle.firstName || ""} ${innerEle.midInitials || ""} ${innerEle.lastName || ""}</b>`;
                }
                peopleText += '<small>';
                if (innerEle.hasOwnProperty('affiliation')) {
                    peopleText += ` ${innerEle.affiliation}`;
                }
                peopleText += '<p>';
                if (innerEle.hasOwnProperty('address')) {
                    peopleText += `Address: ${innerEle.address}<br>`;
                }
                if (innerEle.hasOwnProperty('phone')) {
                    peopleText += `Phone: ${innerEle.phone}<br>`;
                }
                if (innerEle.hasOwnProperty('fax')) {
                    peopleText += `Fax: ${innerEle.fax}<br>`;
                }
                if (innerEle.hasOwnProperty('email')) {
                    peopleText += `Email: ${innerEle.email}<br>`;
                }
                if (innerEle.hasOwnProperty('roles')) {
                    peopleText += '<br><b>Roles</b>: ';
                    if (innerEle.roles[0].hasOwnProperty('annotationValue')) {
                        peopleText += `<b>${innerEle.roles[0].annotationValue}</b>`
                    }
                    if (innerEle.roles[0].hasOwnProperty('termAccession')) {
                        peopleText += ` ${innerEle.roles[0].termAccession}`
                    }
                }
                if (innerEle.hasOwnProperty('comments')) {
                    if (innerEle.comments[0].hasOwnProperty('name')) {
                        peopleText += `<p>Comments:<br> ${innerEle.comments[0].name}</b>`
                    }
                    if (innerEle.comments[0].hasOwnProperty('value')) {
                        peopleText += ` ${innerEle.comments[0].value}</p>`
                    }
                }
                peopleText += '</p></small></div>';
                peopleText += `<hr class="solid"></hr>`;
            });
            if (peopleText !== '') {
                peopleContent.innerHTML = peopleText;
            } else {
                peopleContent.innerHTML = 'Empty';
            }
        }
        if (ele.hasOwnProperty('protocols') && ele.protocols.length !== 0) {
            let protocolsContent = document.getElementById('protocolsContent' + index);
            let protocolsText = "";
            ele.protocols.forEach((innerEle) => {
                if (innerEle.hasOwnProperty('name')) {
                    protocolsText += `<b><h5>${innerEle.name}</h5></b>`;
                }
                if (innerEle.hasOwnProperty('comments') && innerEle.comments.length !== 0) {
                    innerEle.comments.forEach((obj) => {
                        if (obj.hasOwnProperty('name') && obj.hasOwnProperty('value')) {
                            protocolsText += `<small> (${obj.name}: ${obj.value})</small>`;
                        }
                    });
                }
                if (innerEle.hasOwnProperty('parameters') && innerEle.parameters.length !== 0) {
                    protocolsText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                        <th scope="col">Annotation Value</th><th scope="col">Comments</th></tr></thead><tbody>`;
                    innerEle.parameters.forEach((obj) => {
                        if (obj.hasOwnProperty('parameterName')) {
                            protocolsText += `<tr><td><small>${obj.parameterName.termSource || "-"}</small></td>
                            <td><small>${obj.parameterName.termAccession || "-"}</small></td>
                            <td><small>${obj.parameterName.annotationValue || "-"}</small></td>`;
                            if (obj.parameterName.hasOwnProperty('comments') && obj.parameterName.comments.length !== 0) {
                                if (obj.parameterName.comments.length === 1) {
                                    if (obj.parameterName.comments.hasOwnProperty('name') && obj.parameterName.comments.hasOwnProperty('value')) {
                                        protocolsText += `<td><small>${obj.parameterName.comments.name}: ${obj.parameterName.comments.value}</small></td>`;
                                    } else {
                                        protocolsText += `<td> - </td>`;
                                    }
                                } else {
                                    protocolsText += `<td>`;
                                    obj.parameterName.comments.forEach((innerObj) => {
                                        if (innerObj.hasOwnProperty('name') && innerObj.hasOwnProperty('value')) {
                                            protocolsText += `<small>${innerObj.name}: ${innerObj.value}, </small>`;
                                        } else {
                                            protocolsText += '-';
                                        }
                                    });
                                    protocolsText += `</td>`;
                                }
                            } else {
                                protocolsText += `<td> - </td>`;
                            }
                            protocolsText += `</tr>`;
                        }
                    });
                    protocolsText += `</tbody></table>`;
                }
            });
            if (protocolsText !== '') {
                protocolsContent.innerHTML = protocolsText;
            } else
                protocolsContent.innerHTML = "Empty";
        }
        if (ele.hasOwnProperty('processSequence') && ele.processSequence.length !== 0) {
            let processSequenceContent = document.getElementById('processSequenceContent' + index);
            let processSequenceText = "";
            ele.processSequence.forEach((innerEle) => {
                if (innerEle.hasOwnProperty('executesProtocol')) {
                    let executesProtocol = innerEle.executesProtocol;
                    if (executesProtocol.hasOwnProperty('name')) {
                        processSequenceText += `<b>${executesProtocol.name}</b>`;
                    }
                    if (executesProtocol.hasOwnProperty('comments') && executesProtocol.comments.length !== 0) {
                        executesProtocol.comments.forEach((obj) => {
                            if (obj.hasOwnProperty('name') && obj.hasOwnProperty('value')) {
                                processSequenceText += `<small> (${obj.name}: ${obj.value})</small>`;
                            }
                        });
                    }
                    if (executesProtocol.hasOwnProperty('parameters') && executesProtocol.parameters.length !== 0) {
                        processSequenceText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                            <th scope="col">Annotation Value</th><th scope="col">Comments</th></tr></thead><tbody>`;
                        executesProtocol.parameters.forEach((obj) => {
                            if (obj.hasOwnProperty('parameterName')) {
                                processSequenceText += `<tr><td><small>${obj.parameterName.termSource || "-"}</small></td>
                                <td><small>${obj.parameterName.termAccession || "-"}</small></td>
                                <td><small>${obj.parameterName.annotationValue || "-"}</small></td>`;
                                if (obj.parameterName.hasOwnProperty('comments') && obj.parameterName.comments.length !== 0) {
                                    if (obj.parameterName.comments.length === 1) {
                                        if (obj.parameterName.comments[0].name && obj.parameterName.comments[0].value) {
                                            processSequenceText += `<td><small>${obj.parameterName.comments[0].name}: ${obj.parameterName.comments[0].value}</small></td>`;
                                        } else {
                                            processSequenceText += `<td> - </td>`;
                                        }
                                    } else {
                                        processSequenceText += `<td>`;
                                        obj.parameterName.comments.forEach((innerObj) => {
                                            if (innerObj.hasOwnProperty('name') && innerObj.hasOwnProperty('value')) {
                                                processSequenceText += `<small>${innerObj.name}: ${innerObj.value}, </small>`;
                                            } else {
                                                processSequenceText += `-`;
                                            }
                                        });
                                        processSequenceText += `</td>`;
                                    }
                                } else {
                                    processSequenceText += `<td> - </td>`;
                                }
                                processSequenceText += `</tr>`;
                            }
                        });
                        processSequenceText += `</tbody></table>`;
                    }
                }
                if (innerEle.hasOwnProperty('parameterValues')) {
                    processSequenceText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                    <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th><th scope="col">Units</th></tr></thead><tbody>`;
                    innerEle.parameterValues.forEach((obj) => {
                        if (obj.hasOwnProperty('category')) {
                            if (obj.category.hasOwnProperty('parameterName')) {
                                let parameterName = obj.category.parameterName;
                                processSequenceText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                <td><small>${parameterName.termAccession || "-"}</small></td>
                                <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                    processSequenceText += `<td>`;
                                    parameterName.comments.forEach((commentsObj) => {
                                        if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                            processSequenceText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                        } else {
                                            processSequenceText += `-`;
                                        }
                                    });
                                    processSequenceText += `</td>`;
                                } else {
                                    processSequenceText += `<td> - </td>`;
                                }
                            }
                        }
                        if (obj.hasOwnProperty('value')) {
                            processSequenceText += `<td><small>${obj.value || "-"}</small></td>`;
                        } else {
                            processSequenceText += `<td> - </td>`;
                        }
                        if (obj.hasOwnProperty('unit')) {
                            processSequenceText += `<td><small>${obj.unit.annotationValue || "-"}</small></td>`;
                        } else {
                            processSequenceText += `<td> - </td>`;
                        }
                        processSequenceText += `</tr>`;
                    });
                    processSequenceText += `</tbody></table>`;
                }
                if (innerEle.hasOwnProperty('inputs') && innerEle.inputs.length !== 0) {
                    let inputs = innerEle.inputs;
                    inputs.forEach(inputsObj => {
                        if (inputsObj.hasOwnProperty('characteristics') && inputsObj.characteristics.length !== 0) {
                            let characteristics = inputsObj.characteristics;
                            if (inputsObj.hasOwnProperty('name')) {
                                processSequenceText += `<b>Input: ${inputsObj.name}</b>`;
                            }
                            processSequenceText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                    <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th></tr></thead><tbody>`;
                            characteristics.forEach(charEle => {
                                if (charEle.hasOwnProperty('category') && charEle.category.hasOwnProperty('characteristicType')) {
                                    let parameterName = charEle.category.characteristicType;
                                    processSequenceText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                    <td><small>${parameterName.termAccession || "-"}</small></td>
                                    <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                    if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                        processSequenceText += `<td>`;
                                        parameterName.comments.forEach((commentsObj) => {
                                            if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                                processSequenceText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                            } else {
                                                processSequenceText += `-`;
                                            }
                                        });
                                        processSequenceText += `</td>`;
                                    } else {
                                        processSequenceText += `<td> - </td>`;
                                    }
                                }
                                if (charEle.hasOwnProperty('value')) {
                                    processSequenceText += `<td><small>${charEle.value || "-"}</small></td>`;
                                }
                                processSequenceText += `</tr>`;
                            });
                            processSequenceText += `</tbody></table>`;
                        }
                    });
                }
                if (innerEle.hasOwnProperty('outputs') && innerEle.outputs.length !== 0) {
                    let outputs = innerEle.outputs;
                    outputs.forEach(outputsObj => {
                        if (outputsObj.hasOwnProperty('derivesFrom') && outputsObj.derivesFrom.length !== 0) {
                            outputsObj.derivesFrom.forEach(dfObj => {
                                if (dfObj.hasOwnProperty('characteristics') && dfObj.characteristics.length !== 0) {
                                    let characteristics = dfObj.characteristics;
                                    if (outputsObj.hasOwnProperty('name')) {
                                        processSequenceText += `<b>Output: ${outputsObj.name}</b>`;
                                    }
                                    processSequenceText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                            <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th></tr></thead><tbody>`;
                                    characteristics.forEach(charEle => {
                                        if (charEle.hasOwnProperty('category') && charEle.category.hasOwnProperty('characteristicType')) {
                                            let parameterName = charEle.category.characteristicType;
                                            processSequenceText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                                <td><small>${parameterName.termAccession || "-"}</small></td>
                                                <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                            if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                                processSequenceText += `<td>`;
                                                parameterName.comments.forEach((commentsObj) => {
                                                    if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                                        processSequenceText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                                    } else {
                                                        processSequenceText += `-`;
                                                    }
                                                });
                                                processSequenceText += `</td>`;
                                            } else {
                                                processSequenceText += `<td> - </td>`;
                                            }
                                        }
                                        if (charEle.hasOwnProperty('value')) {
                                            processSequenceText += `<td><small>${charEle.value || "-"}</small></td>`;
                                        }
                                        processSequenceText += `</tr>`;
                                    });
                                    processSequenceText += `</tbody></table>`;
                                }
                            });
                        }
                    });
                }
            });
            if (processSequenceText !== '') {
                processSequenceContent.innerHTML = processSequenceText;
            } else {
                processSequenceContent.innerHTML = 'Empty';
            }
        }
        if (ele.hasOwnProperty('characteristicCategories') && ele.characteristicCategories.length !== 0) {
            let charCategoriesContent = document.getElementById('characteristicContent' + index);
            let charCategoriesText = "";
            charCategoriesText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                        <th scope="col">Annotation Value</th><th scope="col">Comments</th></tr></thead><tbody>`;
            ele.characteristicCategories.forEach((innerEle) => {
                if (innerEle.hasOwnProperty('characteristicType')) {
                    let characteristicType = innerEle.characteristicType;
                    charCategoriesText += `<tr><td><small>${characteristicType.termSource || "-"}</small></td>
                            <td><small>${characteristicType.termAccession || "-"}</small></td>
                            <td><small>${characteristicType.annotationValue || "-"}</small></td>`;
                    if (characteristicType.hasOwnProperty('comments') && characteristicType.comments.length !== 0) {
                        if (characteristicType.comments.length === 1) {
                            if (characteristicType.comments[0].name && characteristicType.comments[0].value) {
                                charCategoriesText += `<td><small>${characteristicType.comments[0].name}: ${characteristicType.comments[0].value}</small></td>`;
                            } else {
                                charCategoriesText += `<td> - </td>`;
                            }
                        } else {
                            charCategoriesText += `<td>`;
                            characteristicType.comments.forEach((innerObj) => {
                                if (innerObj.hasOwnProperty('name') && innerObj.hasOwnProperty('value')) {
                                    charCategoriesText += `<small>${innerObj.name}: ${innerObj.value}, </small>`;
                                } else {
                                    charCategoriesText += `-`;
                                }
                            });
                            charCategoriesText += `</td>`;
                        }
                    } else {
                        charCategoriesText += `<td> - </td>`;
                    }
                    charCategoriesText += `</tr>`;
                }
            });
            charCategoriesText += `</tbody></table>`;
            charCategoriesContent.innerHTML = charCategoriesText;
        }
        if (ele.hasOwnProperty('assays') && ele.assays.length !== 0) {
            let assaysContent = document.getElementById('assaysContent' + index);
            let assaysText = "";
            ele.assays.forEach(innerEle => {
                if (innerEle.hasOwnProperty('measurementType') && innerEle.measurementType.hasOwnProperty('annotationValue')) {
                    assaysText += `<b>${innerEle.measurementType.annotationValue}</b>`;
                }
                if (innerEle.hasOwnProperty('characteristicCategories')) {
                    //no data available so unaware of structure
                }
                if (innerEle.hasOwnProperty('processSequence') && innerEle.processSequence.length !== 0) {
                    let processSequence = innerEle.processSequence;
                    processSequence.forEach((processEle) => {
                        if (processEle.hasOwnProperty('executesProtocol')) {
                            let executesProtocol = processEle.executesProtocol;
                            if (executesProtocol.hasOwnProperty('name')) {
                                assaysText += `<b>${executesProtocol.name}</b>`;
                            }
                            if (executesProtocol.hasOwnProperty('comments') && executesProtocol.comments.length !== 0) {
                                executesProtocol.comments.forEach((obj) => {
                                    if (obj.hasOwnProperty('name') && obj.hasOwnProperty('value')) {
                                        assaysText += `<small> (${obj.name}: ${obj.value})</small>`;
                                    }
                                });
                            }
                            if (executesProtocol.hasOwnProperty('parameters') && executesProtocol.parameters.length !== 0) {
                                assaysText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                                    <th scope="col">Annotation Value</th><th scope="col">Comments</th></tr></thead><tbody>`;
                                executesProtocol.parameters.forEach((obj) => {
                                    if (obj.hasOwnProperty('parameterName')) {
                                        assaysText += `<tr><td><small>${obj.parameterName.termSource || "-"}</small></td>
                                        <td><small>${obj.parameterName.termAccession || "-"}</small></td>
                                        <td><small>${obj.parameterName.annotationValue || "-"}</small></td>`;
                                        if (obj.parameterName.hasOwnProperty('comments') && obj.parameterName.comments.length !== 0) {
                                            if (obj.parameterName.comments.length === 1) {
                                                if (obj.parameterName.comments[0].name && obj.parameterName.comments[0].value) {
                                                    assaysText += `<td><small>${obj.parameterName.comments[0].name}: ${obj.parameterName.comments[0].value}</small></td>`;
                                                } else {
                                                    assaysText += `<td> - </td>`;
                                                }
                                            } else {
                                                assaysText += `<td>`;
                                                obj.parameterName.comments.forEach((innerObj) => {
                                                    if (innerObj.hasOwnProperty('name') && innerObj.hasOwnProperty('value')) {
                                                        assaysText += `<small>${innerObj.name}: ${innerObj.value}, </small>`;
                                                    } else {
                                                        assaysText += `-`;
                                                    }
                                                });
                                                assaysText += `</td>`;
                                            }
                                        } else {
                                            assaysText += `<td> - </td>`;
                                        }
                                        assaysText += `</tr>`;
                                    }
                                });
                                assaysText += `</tbody></table>`;
                            }
                        }
                        if (processEle.hasOwnProperty('parameterValues')) {
                            assaysText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                            <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th><th scope="col">Units</th></tr></thead><tbody>`;
                            processEle.parameterValues.forEach((obj) => {
                                if (obj.hasOwnProperty('category')) {
                                    if (obj.category.hasOwnProperty('parameterName')) {
                                        let parameterName = obj.category.parameterName;
                                        assaysText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                        <td><small>${parameterName.termAccession || "-"}</small></td>
                                        <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                        if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                            assaysText += `<td>`;
                                            parameterName.comments.forEach((commentsObj) => {
                                                if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                                    assaysText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                                } else {
                                                    assaysText += `-`;
                                                }
                                            });
                                            assaysText += `</td>`;
                                        } else {
                                            assaysText += `<td> - </td>`;
                                        }
                                    }
                                }
                                if (obj.hasOwnProperty('value')) {
                                    assaysText += `<td><small>${obj.value || "-"}</small></td>`;
                                } else {
                                    assaysText += `<td> - </td>`;
                                }
                                if (obj.hasOwnProperty('unit')) {
                                    assaysText += `<td><small>${obj.unit.annotationValue || "-"}</small></td>`;
                                } else {
                                    assaysText += `<td> - </td>`;
                                }
                                assaysText += `</tr>`;
                            });
                            assaysText += `</tbody></table>`;
                        }
                        if (processEle.hasOwnProperty('inputs') && processEle.inputs.length !== 0) {
                            let inputs = processEle.inputs;
                            inputs.forEach(inputsObj => {
                                if (inputsObj.hasOwnProperty('characteristics') && inputsObj.characteristics.length !== 0) {
                                    let characteristics = inputsObj.characteristics;
                                    if (inputsObj.hasOwnProperty('name')) {
                                        assaysText += `<b>Input: ${inputsObj.name}</b>`;
                                    }
                                    assaysText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                            <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th></tr></thead><tbody>`;
                                    characteristics.forEach(charEle => {
                                        if (charEle.hasOwnProperty('category') && charEle.category.hasOwnProperty('characteristicType')) {
                                            let parameterName = charEle.category.characteristicType;
                                            assaysText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                            <td><small>${parameterName.termAccession || "-"}</small></td>
                                            <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                            if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                                assaysText += `<td>`;
                                                parameterName.comments.forEach((commentsObj) => {
                                                    if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                                        assaysText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                                    } else {
                                                        assaysText += `-`;
                                                    }
                                                });
                                                assaysText += `</td>`;
                                            } else {
                                                assaysText += `<td> - </td>`;
                                            }
                                        }
                                        if (charEle.hasOwnProperty('value')) {
                                            assaysText += `<td><small>${charEle.value || "-"}</small></td>`;
                                        }
                                        assaysText += `</tr>`;
                                    });
                                    assaysText += `</tbody></table>`;
                                }
                            });
                        }
                        if (processEle.hasOwnProperty('outputs') && processEle.outputs.length !== 0) {
                            let outputs = processEle.outputs;
                            outputs.forEach(outputsObj => {
                                if (outputsObj.hasOwnProperty('derivesFrom') && outputsObj.derivesFrom.length !== 0) {
                                    outputsObj.derivesFrom.forEach(dfObj => {
                                        if (dfObj.hasOwnProperty('characteristics') && dfObj.characteristics.length !== 0) {
                                            let characteristics = dfObj.characteristics;
                                            if (outputsObj.hasOwnProperty('name')) {
                                                assaysText += `<b>Output: ${outputsObj.name}</b>`;
                                            }
                                            assaysText += `<table class="table table-striped"><thead><tr><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                                    <th scope="col">Annotation Value</th><th scope="col">Comments</th><th scope="col">Value</th></tr></thead><tbody>`;
                                            characteristics.forEach(charEle => {
                                                if (charEle.hasOwnProperty('category') && charEle.category.hasOwnProperty('characteristicType')) {
                                                    let parameterName = charEle.category.characteristicType;
                                                    assaysText += `<tr><td><small>${parameterName.termSource || "-"}</small></td>
                                                        <td><small>${parameterName.termAccession || "-"}</small></td>
                                                        <td><small>${parameterName.annotationValue || "-"}</small></td>`;
                                                    if (parameterName.hasOwnProperty('comments') && parameterName.comments.length !== 0) {
                                                        assaysText += `<td>`;
                                                        parameterName.comments.forEach((commentsObj) => {
                                                            if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                                                assaysText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                                                            } else {
                                                                assaysText += `-`;
                                                            }
                                                        });
                                                        assaysText += `</td>`;
                                                    } else {
                                                        assaysText += `<td> - </td>`;
                                                    }
                                                }
                                                if (charEle.hasOwnProperty('value')) {
                                                    assaysText += `<td><small>${charEle.value || "-"}</small></td>`;
                                                }
                                                assaysText += `</tr>`;
                                            });
                                            assaysText += `</tbody></table>`;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            if (assaysText !== '') {
                assaysContent.innerHTML = assaysText;
            } else {
                assaysContent.innerHTML = 'Empty';
            }
        }
        if (ele.hasOwnProperty('factors') && ele.factors.length !== 0) {
            let factorsContent = document.getElementById('factorsContent' + index);
            let factorsText = "";
            ele.factors.forEach((innerEle) => {
                factorsText += `<table class="table table-striped"><thead><tr><th scope="col">Factor Name</th><th scope="col">Term Source</th><th scope="col">Term Accession</th>
                    <th scope="col">Annotation Value</th><th scope="col">Comments</th></tr></thead><tbody>`;
                factorsText += `<tr>`;
                if (innerEle.hasOwnProperty('factorName')) {
                    factorsText += `<td><small>${innerEle.factorName || ""}</small></td>`;
                } else {
                    factorsText += `<td><small>-</small></td>`;
                }
                if (innerEle.hasOwnProperty('factorType')) {
                    let factorType = innerEle.factorType;
                    factorsText += `<td><small>${factorType.termSource || "-"}</small></td>
                                <td><small>${factorType.termAccession || "-"}</small></td>
                                <td><small>${factorType.annotationValue || "-"}</small></td>`;
                    if (factorType.hasOwnProperty('comments') && factorType.comments.length !== 0) {
                        factorsText += `<td>`;
                        factorType.comments.forEach((commentsObj) => {
                            if (commentsObj.hasOwnProperty('name') && commentsObj.hasOwnProperty('value')) {
                                factorsText += `<small>${commentsObj.name}: ${commentsObj.value}, </small>`;
                            } else {
                                factorsText += `-`;
                            }
                        });
                        factorsText += `</td></tr>`;
                    } else {
                        factorsText += `<td> - </td>`;
                    }
                } else {
                    factorsText += `</tr>`;
                }
                factorsText += `</tbody></table>`;
            });
            if (factorsText !== '') {
                factorsContent.innerHTML = factorsText;
            } else {
                factorsContent.innerHTML = 'Empty';
            }
        }
    });
}

function loadPeople(resp) {
    let peopleContent = document.getElementById('peopleContent');
    let text = "";
    resp.forEach((ele) => {
        text += '<div class="container modal-databox has-bg-lightmint-60">';
        if (ele.hasOwnProperty('firstName') || ele.hasOwnProperty('midInitials') || ele.hasOwnProperty('lastName')) {
            text += `<b>${ele.firstName || ""} ${ele.midInitials || ""} ${ele.lastName || ""}</b>`;
        }
        text += '<small>';
        if (ele.hasOwnProperty('affiliation')) {
            text += ` ${ele.affiliation}`;
        }
        text += '<p>';
        if (ele.hasOwnProperty('address')) {
            text += `Address: ${ele.address}<br>`;
        }
        if (ele.hasOwnProperty('phone')) {
            text += `Phone: ${ele.phone}<br>`;
        }
        if (ele.hasOwnProperty('fax')) {
            text += `Fax: ${ele.fax}<br>`;
        }
        if (ele.hasOwnProperty('email')) {
            text += `Email: ${ele.email}<br>`;
        }
        if (ele.hasOwnProperty('roles')) {
            text += '<br><b>Roles</b>: ';
            if (ele.roles[0].hasOwnProperty('annotationValue')) {
                text += `<b>${ele.roles[0].annotationValue}</b>`
            }
            if (ele.roles[0].hasOwnProperty('termAccession')) {
                text += ` ${ele.roles[0].termAccession}`
            }
        }
        if (ele.hasOwnProperty('comments')) {
            if (ele.comments[0].hasOwnProperty('name')) {
                text += `<p>Comments:<br> ${ele.comments[0].name}</b>`
            }
            if (ele.comments[0].hasOwnProperty('value')) {
                text += ` ${ele.comments[0].value}</p>`
            }
        }
        text += '</p></small></div>';
    });
    peopleContent.innerHTML = text;
}

function loadComments(resp) {
    resp.forEach((ele) => {
        $('#commentsContent').append(`<div class="container box has-bg-lightred-80">
        <small>${ele.name}: ${ele.value}</small></div>`);
    });
}

function setDisplayAttr(active, inactive1, inactive2, inactive3) {
    $('#' + active).style.display = 'block';
    $('#' + inactive1).style.display = 'none';
    //$('#'+inactive2).style.display = 'none';
    // $('#'+inactive3).style.display = 'none';
}
/*
function goToISADetails() {
    let params = {};
    params["arcID"] = document.getElementById('arcID').innerText;
    params["arcVersion"] = document.getElementById('version').innerText;
   displayISADetails(params).then(() => {
        document.getElementById('isaDetails').removeAttribute('hidden');
        document.getElementById('arcDetails').setAttribute('hidden', true);
    }).catch(() => {
        document.getElementById('arcDetails').removeAttribute('hidden');
        document.getElementById('isaDetails').setAttribute('hidden', true);
        alert("No related ISA details available.");
    });
}
 */

/*
function displayARCDetails(arcParams) {
    return new Promise((resolve, reject) => {
        invokeAPI(arcParams, 'getARCs').then((response) => {
            response = JSON.parse(response).hits[0].data;
            deleteExistingElements();
            setDetails(response);
            createElements(response);
        }).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}
 */

function displayARCDetails(arcParams) {
    return new Promise((resolve, reject) => {
        invokeAPI(arcParams, 'getSpecificARC').then((response) => {
            response = JSON.parse(response);
            if (response.length !== 0) {
                deleteExistingElements();
                setDetails(response);
                createElements(response);
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
}

function deleteExistingElements() {
    document.getElementById('investigationsContentAcc').replaceChildren();
    document.getElementById('assaysContentAcc').replaceChildren();
    document.getElementById('studiesContentAcc').replaceChildren();
    document.getElementById('workflowsContentAcc').replaceChildren();
    // document.getElementById('externalsContentAcc').replaceChildren();
    document.getElementById('runsContentAcc').replaceChildren();
}

function setDetails(resp) {
    let elements = {};
    let elementsWithAttr = {};
    elements['filename'] = resp.investigationFilename;
    elementsWithAttr['linkToARC'] = resp.gitLabHostURL;

    elements['location'] = resp.gitLabHostLocation;
    elements['visibility'] = resp.gitLabRepoVisibility;
    elements['creationDate'] = dateFormatter(resp.arcCreationDate);
    elements['modifiedDate'] = dateFormatter(resp.arcLastModifiedDate);

    elements['arcID'] = resp.arcID;
    elements['version'] = resp.arcVersion;

    elements['user'] = resp.gitLabUserName;
    elements['userID'] = resp.gitLabUserID;
    elements['email'] = resp.gitLabUserEmail;
    elements['host'] = resp.gitLabHost;

    setDataToHTML(elements, elementsWithAttr);
}

function createElements(resp) {
    if (resp.investigations.length !== 0) {
        let content = document.getElementById('investigationsContentAcc');
        createContentTable(content, resp.investigations);
        document.getElementById('investigationsContainer').style.display = 'block';
    } else {
        document.getElementById('investigationsContainer').style.display = 'none';
    }
    if (resp.studies.length !== 0) {
        let content = document.getElementById('studiesContentAcc');
        createContentTable(content, resp.studies);
        document.getElementById('studiesContainer').style.display = 'block';
    } else {
        document.getElementById('studiesContainer').style.display = 'none';
    }
    if (resp.assays.length !== 0) {
        let content = document.getElementById('assaysContentAcc');
        createContentTable(content, resp.assays);
        document.getElementById('assaysContainer').style.display = 'block';
    } else {
        document.getElementById('assaysContainer').style.display = 'none';
    }
    if (resp.workflows.length !== 0) {
        let content = document.getElementById('workflowsContentAcc');
        createContentTable(content, resp.workflows);
        document.getElementById('workflowsContainer').style.display = 'block';
    } else {
        document.getElementById('workflowsContainer').style.display = 'none';
    }
    /*
    if (resp.externals.length !== 0) {
        let content = document.getElementById('externalsContent');
        createRowCol(content, resp.externals, 'has-bg-lightmint-60');
        document.getElementById('externalsContainer').style.display = 'block';
    } else {
        document.getElementById('externalsContainer').style.display = 'none';
    }
     */
    if (resp.runs.length !== 0) {
        let content = document.getElementById('runsContentAcc');
        createContentTable(content, resp.runs);
        document.getElementById('runsContainer').style.display = 'block';
    } else {
        document.getElementById('runsContainer').style.display = 'none';
    }
}

function createContentTable(content, resp) {
    let headers = ["File", "Status", "Creation Date", "Last Modified Date", "Modified By"];
    let table = document.createElement('table');
    table.setAttribute("class", "table table-striped table-hover");
    //create the heading
    let header = table.createTHead();
    header.setAttribute("class", ".thead-light")
    let headerRow = header.insertRow(0);
    for (let i = 0; i < headers.length; i++) {
        headerRow.insertCell(i).innerHTML = headers[i];
    }
    let body = table.createTBody();
    resp.forEach((ele) => {
        let row = body.insertRow(ele.indexOf);
        row.insertCell(headers.indexOf('File')).innerHTML = ele['file'];
        row.insertCell(headers.indexOf('Status')).innerHTML = ele['status'];
        row.insertCell(headers.indexOf('Creation Date')).innerHTML = ele['creationDate'];
        row.insertCell(headers.indexOf('Last Modified Date')).innerHTML = ele['lastModifiedDate'];
        row.insertCell(headers.indexOf('Modified By')).innerHTML = ele['lastModifiedBy'];
    });
    table.appendChild(body);
    content.appendChild(table);
}

/*

function createRowCol(content, resp, bg) {
    let fields = {
        "file": "File",
        "size": "Size",
        "lastModifiedDate": "Last Modified Date",
        "creationDate": "Creation Date"
    };

    resp.forEach((ele) => {
        let row = createRowTag(bg);
        Object.keys(fields).forEach((key) => {
            let innerRow = document.createElement('row');
            innerRow.setAttribute("class", "row");
            let col = createColTag(fields[key]);
            innerRow.appendChild(col);
            let colData = (key.includes('Date')) ? createColDataTag(dateFormatter(ele[key])) : createColDataTag(ele[key]);
            innerRow.appendChild(colData);
            row.appendChild(innerRow);
        });
        content.appendChild(row);
    });
}

function createRowTag(bg) {
    let div = document.createElement('div');
    div.setAttribute("class", "container box row " + bg);
    return div;
}

function createColTag(name) {
    let col = document.createElement('div');
    col.setAttribute("class", "col col-4");
    col.textContent = col.innerText = name;
    return col;
}

function createColDataTag(name) {
    let col = document.createElement('div');
    col.setAttribute("class", "col col-8");
    col.textContent = col.innerText = name;
    return col;
}

 */

function setDataToHTML(elements, elementsWithAttr) {
    Object.keys(elements).forEach((key) => {
        let ele = document.getElementById(key);
        ele.innerText = ele.textContent = elements[key];
    });

    //set href attribute to the header
    let a = document.getElementById("linkToARC");
    a.setAttribute("href", elementsWithAttr['linkToARC']);
}