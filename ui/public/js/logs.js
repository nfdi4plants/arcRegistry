//predicates array
let params = [];

const fields = {
    'Service': 'service',
    'Date After': 'after',
    'Date Before': 'before',
    'Severity': 'severity',
    'Message': 'message'
};

function pageLoadData() {
    invokeAPI(params, 'getLogs').then((response) => {
        let formattedResp = formatGetLogsResponse(JSON.parse(response));
        loadDataTable(formattedResp);
    }).catch((error) => {
        console.log("Error :: " + JSON.stringify(error));
    });
}

function pageLoadTable() {
    let $logsTable = $('#logsTable');

    $logsTable.DataTable({
        columns: [
            { title: 'Service' },
            { title: 'Date' },
            { title: 'Severity' },
            { title: 'Message' }
        ]
    });

    $logsTable.on('click', 'tbody tr', function () {
        let table = $logsTable.DataTable();
        let isNotEmpty = table.rows().count() !== 0;
        if (isNotEmpty) {
            let data = table.row(this).data();
            document.getElementById('dateTimestamp').innerHTML = data[1];
            document.getElementById('messageDetails').innerHTML = data[3];
            document.getElementById('requestDetails').innerHTML = data[4];
            $('#modalForDetails').modal('show');
        }
    });
}

function formatGetLogsResponse(response) {
    let arr = [];
    // need to check for both positive and error response
    if (response.hasOwnProperty('hits')){
        response.hits.forEach((ele) => {
            if (ele.data.service === 'arc_isa'){
                let innerArr = [];
                innerArr.push(ele.data.service || "");
                innerArr.push(dateFormatter(ele.data.date || ""));
                innerArr.push(ele.data.severity || "");
                innerArr.push(ele.data.message || "");
                innerArr.push(Object.keys(ele.data.originalRequest).length !== 0 ? JSON.stringify(ele.data.originalRequest, null, "\t") : "-");
                arr.push(innerArr);
            }

        });
    } else {
        console.log(response.meta.body.error);
    }
    return arr;
}

function loadDataTable(formattedResp) {
    let table = $('#logsTable').DataTable();
    table.clear();
    if (formattedResp.length !== 0) {
        formattedResp.forEach(element => {
            table.row.add(element);
        });
    }
    table.draw();
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

function addKeyword() {
    let filterCriteria = document.getElementById('inputKeyword').value;
    let inputValue = document.getElementById('inputValue').value;

    if (filterCriteria !== "Select" && inputValue != null) {
        if (filterCriteria.includes('Date')) {
            inputValue = inputValue.split('-').reverse().join('-');
        }
        let newKeyword = fields[filterCriteria];

        if (params.findIndex(param => (param.key === newKeyword)) >= 0) {
            $('#modalForParameterExists').modal('show');
        } else {
            //add the predicate to the array
            params.push({
                key: newKeyword,
                value: inputValue
            });
            //invoke function to fetch results for the given predicates
            invokeAPI(params, 'getLogs').then((response) => {
                let formattedResp = formatGetLogsResponse(JSON.parse(response));
                loadDataTable(formattedResp);
                $('#filterResult').append(`<div class="item item_${newKeyword}_${inputValue} filter alert d-inline-block alert-dismissible fade show input-group-append">${newKeyword} = <strong>${inputValue}</strong><button type="button" onclick="removeKeyword('${newKeyword}_${inputValue}')" class="close" data-dismiss="alert">&times;</button></div>`);
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

// this function gets invoked when user clicks the X button on the predicate
function removeKeyword(filter) {
    //remove the predicate from the screen
    $(".item_" + filter).remove();
    let index = filter.indexOf('_');
    let keyword = filter.substring(0,index);
    let inputValue = filter.slice(index+1)
    //remove the predicate from the array
    params.splice(params.findIndex(param => ((param.key === keyword) && (param.value === inputValue))), 1)
    // load with the remaining predicate list.
    pageLoadData();
}

document.addEventListener("DOMContentLoaded", () => {
    let $inputValue = $('#inputValue');
    let $inputKeyword = $('#inputKeyword');
    let $btnSearch = $('#btnSearch');

    loadDropdown();
    pageLoadTable();
    pageLoadData();
    $inputValue.keyup(checkToEnableButton);
    $inputValue.keypress(function (event) {
        if (event.which === '13') {
            event.preventDefault();
        }
    });
    $inputKeyword.change(checkToEnableButton);
    $btnSearch.click(addKeyword);
});