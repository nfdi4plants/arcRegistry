//predicates array
let params = [];

const fields = {
  'ARC ID': 'arcID',
  'Version': 'arcVersion',
  'GitLab Username': 'gitLabUserName',
  'GitLab EmailID': 'gitLabUserEmail',
}

const fieldsWithNewListBox = {
  "ARC Size": {
    "Select": "select",
    "Smaller Than": "sizeSmallerThan",
    "Bigger Than": "sizeBiggerThan"
  },
  "Dates": {
    'Select': 'select',
    'ARCs Created Before' : 'createdBefore',
    'ARCs Created After' : 'createdAfter',
    'ARCs Modified Before' : 'lastModifiedBefore',
    'ARCs Modified After' : 'lastModifiedAfter',
    'Assays Created Before': 'assaysCreatedBefore',
    'Assays Created After': 'assaysCreatedAfter',
    'Studies Created Before': 'studiesCreatedBefore',
    'Studies Created After': 'studiesCreatedAfter',
    'Workflows Created Before': 'workflowsCreatedBefore',
    'Workflows Created After': 'workflowsCreatedAfter',
    'Runs Created Before': 'runsCreatedBefore',
    'Runs Created After': 'runsCreatedAfter',
    'Assays Last Modified Before': 'assaysLastModifiedBefore',
    'Assays Last Modified After': 'assaysLastModifiedAfter',
    'Studies Last Modified Before': 'studiesLastModifiedBefore',
    'Studies Last Modified After': 'studiesLastModifiedAfter',
    'Workflows Last Modified Before': 'workflowsLastModifiedBefore',
    'Workflows Last Modified After': 'workflowsLastModifiedAfter',
    'Runs Last Modified Before': 'runsLastModifiedBefore',
    'Runs Last Modified After': 'runsLastModifiedAfter'
  }
};

function pageLoadTable() {
  let $arcTable = $('#arcTable');
  $arcTable.DataTable({
    columns: [
      { title: 'Location'},
      { title: 'ARC ID' },
      { title: 'Version' },
      { title: 'Visibility'},
      { title: 'ARC Name' },
      { title: 'Username' },
      { title: 'Creation Date' },
      { title: 'Last Modified Date' },
      { title: '#Assay  Files' },
      { title: '#Studies Files' },
      { title: '#Workflow Files' },
      { title: '#Run Files' },
      { title: 'Host'}
    ],
    order: [[7, 'desc']]
  });
  $arcTable.on('click', 'tbody tr', function () {
    let table = $('#arcTable').DataTable();
    let isNotEmpty = table.rows().count() !== 0;
    if (isNotEmpty) {
      let data = table.row(this).data();
      let arcParams = [];
      arcParams.push({
        key: 'gitLabHost',
        value: data[12]
      })
      arcParams.push({
        key: 'arcID',
        value: data[1]
      })
      arcParams.push({
        key: 'arcVersion',
        value: data[2]
      })
      displayARCDetails(arcParams).then(() => {
        $('#modalForDetails').modal('show');
      }).catch((error) => {
        console.log("Error :: " + JSON.stringify(error));
      });
    }
  });
}

function pageLoadData() {
  invokeAPI([], 'getARCs').then((response) => {
    let formattedResp = formatGetARCsResponse(JSON.parse(response));
    loadDataTable(formattedResp);
  }).catch((error) => {
    console.log("Error :: " + JSON.stringify(error));
  });
}

function loadDataTable(formattedResp) {
  let table = $('#arcTable').DataTable();
  table.clear();
  if (formattedResp.length !== 0) {
    formattedResp.forEach(element => {
      table.row.add(element);
    });
  }
  table.draw();
}

function formatGetARCsResponse(response, specificARCFlag) {
  let arr = [];
  // the response from the getSpecificARC is slightly different from the generic getARCs API.
  // and hence need to check first.

  if (specificARCFlag) {
    let innerArr = [];
    if (response.hasOwnProperty('arcID')) {
      innerArr.push(response.gitLabHostLocation);
      innerArr.push(response.arcID);
      innerArr.push(response.arcVersion);
      innerArr.push(response.gitLabRepoVisibility);
      innerArr.push(response.investigationFilename);
      innerArr.push(response.gitLabUserName);
      innerArr.push(dateFormatter(response.arcCreationDate));
      innerArr.push(dateFormatter(response.arcLastModifiedDate));
      innerArr.push(response.assays.length);
      innerArr.push(response.studies.length);
      innerArr.push(response.workflows.length);
      innerArr.push(response.runs.length);
      innerArr.push(response.gitLabHost);
      arr.push(innerArr);
    }
  } else {
    if (response.hasOwnProperty('hits')) {
      response.hits.forEach((ele) => {
        let innerArr = [];
        innerArr.push(ele.data.gitLabHostLocation);
        innerArr.push(ele.data.arcID);
        innerArr.push(ele.data.arcVersion);
        innerArr.push(ele.data.gitLabRepoVisibility);
        innerArr.push(ele.data.investigationFilename);
        innerArr.push(ele.data.gitLabUserName);
        innerArr.push(dateFormatter(ele.data.arcCreationDate));
        innerArr.push(dateFormatter(ele.data.arcLastModifiedDate));
        innerArr.push(ele.data.assays.length);
        innerArr.push(ele.data.studies.length);
        innerArr.push(ele.data.workflows.length);
        innerArr.push(ele.data.runs.length);
        innerArr.push(ele.data.gitLabHost);
        arr.push(innerArr);
      });
    } else {
      console.log(response.meta.body.error);
    }
  }
  return arr;
}

function addKeyword() {
  let filterCriteria = document.getElementById('inputKeyword').value;
  let childCriteria = document.getElementById('childInputKeyword').value;
  let inputValue = document.getElementById('inputValue').value;

  if (childCriteria === 'Select') childCriteria = '';

  //date logic
  if (filterCriteria.includes('Date')) {
    inputValue = inputValue.split('-').reverse().join('-');
  }

  // we need to force user to select an ARC before letting to select any other parameters
  if (filterCriteria !== "Select" && inputValue != null) {
    if (params.length === 0) {
      addToParamsAndInvoke(filterCriteria, childCriteria, inputValue);
      // no selection has made so far!!!
/*      if (filterCriteria === 'ARC ID') {
        addToParamsAndInvoke(filterCriteria, childCriteria, inputValue);
      } else {
        // pop the alert prompting user to select an ARC first
        $('#modalForErrorSelectARCID').modal('show');
      }*/
    } else if (params.length > 0) {
      // Assumed that ARC has already been selected. Now allow user to only select other parameters (one each).
      let tempKey = dropDownToAPIValue(filterCriteria, childCriteria);
     if (params.findIndex(param => (param.key === tempKey)) >= 0) {
       $('#modalForErrorARCExists').modal('show');
     } else {
       addToParamsAndInvoke(filterCriteria, childCriteria, inputValue);
     }
    } else {
      // pop the alert prompting user to select an ARC first
      $('#modalForErrorSelectARCID').modal('show');
    }
  }
  document.getElementById('inputKeyword').value = 'Select';
  document.getElementById('inputValue').value = '';
  document.getElementById('childInputKeyword').value = 'Select';
}


function specificARCVersion(){
  let specificArc = false;
  if ((params.findIndex(param => (param.key === 'arcID'))) >=0 &&
      (params.findIndex(param => (param.key === 'arcVersion'))) >=0 &&
      (params.findIndex(param => (param.key === 'gitLabHost'))) >=0 ) {
    specificArc = true;
  }
  return specificArc;
}

function addToParamsAndInvoke(filterCriteria, childCriteria, inputValue) {
   let newKeyword = dropDownToAPIValue(filterCriteria, childCriteria);
   let endPoint = 'getARCs';
   let specificARCFlag = false;
   //add the predicate to the array
    params.push({
      key: newKeyword,
      value: inputValue
    });

  if (specificARCVersion()){
    endPoint = 'getSpecificARC';
    specificARCFlag = true;
  }

  //invoke function to fetch results for the given predicates
  invokeAPI(params, endPoint).then((response) => {
    let formattedResp = formatGetARCsResponse(JSON.parse(response), specificARCFlag);
    loadDataTable(formattedResp);
//      $('#filterResult').append(`<div class="filter alert d-inline-block alert-dismissible fade show input-group-append">${newKeyword} = <strong>${inputValue}</strong><button type="button" onclick="removeKeyword('${newKeyword}')" class="close" data-dismiss="alert">&times;</button></div>`);
    $('#filterResult').append(`<div class="item item_${newKeyword}_${inputValue} filter alert d-inline-block alert-dismissible fade show input-group-append">${newKeyword} = <strong>${inputValue}</strong><button type="button" onclick="removeKeyword('${newKeyword}_${inputValue}')" class="close" data-dismiss="alert">&times;</button></div>`);
  }).catch((error) => {
    console.log("Error :: " + JSON.stringify(error));
  }).finally(() => {
    $('#btnSearch').prop('disabled', true);
  });

}

function dropDownToAPIValue(firstKey, secondKey){
  if (secondKey === ''){
    return fields[firstKey];
  } else {
    let dropDownOptions = fieldsWithNewListBox[firstKey];
    return dropDownOptions[secondKey];
  }
}

// this function gets invoked when user clicks the X button on the predicate
function removeKeyword(filter) {
  if (filter.includes('arcID')){
    // when the user removes ARC selection, cleanup all other predicates
    //remove the entire div and reset the predicate selection
    $(".item" ).remove();
    params  = [];
  } else {
    //remove the predicate from the screen
    $(".item_" + filter).remove();
    let index = filter.indexOf('_');
    let keyword = filter.substring(0,index);
    let inputValue = filter.slice(index+1)
    //remove the predicate from the array
    params.splice(params.findIndex(param => ((param.key === keyword) && (param.value === inputValue))), 1)
  }
  invokeAPI(params, 'getARCs').then((response) => {
    let formattedResp = formatGetARCsResponse(JSON.parse(response));
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
  Object.keys(fieldsWithNewListBox).forEach((key) => {
    searchList.add(new Option(key));
  });
}

function displayNewListBox(filterCriteria) {
  let childList = document.getElementById('childInputKeyword');
  childList.replaceChildren();
  Object.keys(fieldsWithNewListBox[filterCriteria]).forEach((key) => {
    childList.add(new Option(key));
  });
  $('#btnSearch').prop('disabled', true);
}

function isNewListNeeded() {
  let filterCriteria = document.getElementById('inputKeyword').value;
  let parentInput = document.getElementById('parentInput');
  let childList = document.getElementById('childInput');
  let childInputKeyword = document.getElementById('childInputKeyword');
  if (fieldsWithNewListBox.hasOwnProperty(filterCriteria)) {
    parentInput.classList.remove('col-md-8');
    parentInput.classList.add('col-md-4');
    childList.style.display = "block";
    displayNewListBox(filterCriteria);
  } else {
    parentInput.classList.remove('col-md-4');
    parentInput.classList.add('col-md-8');
    childList.style.display = "none";
    childInputKeyword.replaceChildren();
  }
}

/*
function getIDForVersion() {
  paramsObj.arcID = id;
  paramsObj.arcVersion = versionSearch;
  params = "arcID=" + id + "&arcVersion=" + versionSearch;
  invokeServiceCall(paramsObj, 'getARCs').then((response) => {
    let formattedResp = formatGetARCsResponse(JSON.parse(response));
    loadDataTable(formattedResp);
    $('#modalForID').modal('hide');
    $filterResult.append(`<div class="filter alert d-inline-block alert-dismissible fade show">ARC ID = <strong>${id}</strong><button type="button" onclick="removeKeyword('ARC ID')" class="close" data-dismiss="alert">&times;</button></div>`);
    $filterResult.append(`<div class="filter alert d-inline-block alert-dismissible fade show">Version = <strong>${versionSearch}</strong><button type="button" onclick="removeKeyword('Version')" class="close" data-dismiss="alert">&times;</button></div>`);
  }).catch((error) => {
    console.log("Error :: " + JSON.stringify(error));
    removeKeyword('Version');
    removeKeyword('ARC ID');
  }).finally(() => {
    $('#btnSearch').prop('disabled', true);
  });
}
 */

function checkToEnableButton() {
  let filterCriteria = document.getElementById('inputKeyword').value;
  let inputValue = document.getElementById('inputValue').value;

  if (filterCriteria !== 'Dates' ) {
    document.getElementById('inputValue').removeAttribute('placeholder');
  }

  if (filterCriteria !== "Select" && inputValue.trim() !== "") {
    let childList = document.getElementById('childInput');
    if (childList.style.display === "block") {
      let childCriteria = document.getElementById('childInputKeyword').value;
      if (childCriteria !== "Select") {
        $('#btnSearch').prop('disabled', false);
      } else {
        $('#btnSearch').prop('disabled', true);
      }
    } else {
      $('#btnSearch').prop('disabled', false);
    }
  } else {
    $('#btnSearch').prop('disabled', true);
  }
}

function childListCheck() {
  let filterCriteria = document.getElementById('inputKeyword').value;
  let childCriteria = document.getElementById('childInputKeyword').value;
  let inputValue = document.getElementById('inputValue').value;
  if (filterCriteria === 'Dates' ) {
    document.getElementById('inputValue').setAttribute('placeholder', 'dd-mm-yyyy')
  }
  if (filterCriteria !== "Select" && inputValue.trim() !== "" && childCriteria !== "Select") {
    $('#btnSearch').prop('disabled', false);
  } else {
    $('#btnSearch').prop('disabled', true);
  }
}

//function backToARCDetails() {
//  document.getElementById('arcDetails').removeAttribute('hidden');
//  document.getElementById('isaDetails').setAttribute('hidden', true);
//}

document.addEventListener("DOMContentLoaded", () => {
  let $inputValue = $('#inputValue');
  loadDropdown();
  pageLoadTable();
  pageLoadData();
  $inputValue.keyup(checkToEnableButton);
  $inputValue.keypress(function (event) {
    if (event.which === '13') {
      event.preventDefault();
    }
  });
  $('#inputKeyword').change(function () {
    isNewListNeeded();
    checkToEnableButton();
  });
  $('#childInputKeyword').change(childListCheck);
//  $('#backARCDetails').click(backToARCDetails);
});