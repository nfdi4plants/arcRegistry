const booleanParser = require('boolean-parser');
const logger = require('./Logger');

module.exports = function (ISAquery) {

    // 0. Only allow "AND, OR, =, <, >"
    const searchPhrase = ISAquery;

    // 1. Parse query into disjunctions of conjunctions
    const parsedQuery = booleanParser.parseBooleanQuery(searchPhrase);

    // testing with usage of global variable
    let nestedFieldsResults = [];

    /**
     * Parses the comparison operators and parameters to ElasticSearch query search operators
     *
     * @param parsedQueryElementElement
     * @returns {{}}
     */
    function parseCompOp(parsedQueryElementElement) {
        let result = {}

        if (parsedQueryElementElement.includes('=')) {
            const indexOfOp = parsedQueryElementElement.indexOf('=');
            const fstPart = parsedQueryElementElement.substring(0, indexOfOp).trim();
            const sndPart = parsedQueryElementElement.substring(indexOfOp + 1).trim();

            // Equals to a String or Number
            if (sndPart.charAt(0) === '"' || sndPart.charAt(0) === "'") {
                result = [fstPart, {
                    "match": {
                        [fstPart]: {
                            "query": sndPart.substring(1, sndPart.length - 1)
                        }
                    }
                }]
            } else {
                result = [fstPart, {
                    "match": {
                        [fstPart]: {
                            "query": Number(sndPart)
                        }
                    }

                }]
            }

        } else if (parsedQueryElementElement.includes('<')) {
            const indexOfOp = parsedQueryElementElement.indexOf('<');
            const fstPart = parsedQueryElementElement.substring(0, indexOfOp).trim();
            const sndPart = parsedQueryElementElement.substring(indexOfOp + 1).trim();

            result = [fstPart, {
                "range": {
                    [fstPart]: {
                        "lt": Number(sndPart)
                    }
                }
            }]

        } else if (parsedQueryElementElement.includes('>')) {
            const indexOfOp = parsedQueryElementElement.indexOf('>');
            const fstPart = parsedQueryElementElement.substring(0, indexOfOp).trim();
            const sndPart = parsedQueryElementElement.substring(indexOfOp + 1).trim();

            result = [fstPart, {
                "range": {
                    [fstPart]: {
                        "gt": Number(sndPart)
                    }
                }
            }]
        }

        return result;
    }

    const body = {
        query: {
            "bool": {
                "should": []
            }
        }
    }


    // 2. Check nested fields and parse comparison operators
    for (let i = 0; i < parsedQuery.length; i++) {
        const conjunction = {
            "bool": {
                "must": []
            }
        };

        for (let j = 0; j < parsedQuery[i].length; j++) {
            // 3. Parse comparison operator
            const parsedCompOp = parseCompOp(parsedQuery[i][j]);

            // 4. Check nested fields
            const parsedNestedField = parseNestedField(parsedCompOp[0], parsedCompOp[1]);

            // 5. Join conjunctions
            conjunction.bool.must.push(parsedNestedField);
        }

        body.query.bool.should.push(conjunction);
    }
    // 6. Return ElasticSearch search query
    return body;

    function getPosition(string, subString, index) {
        return string.split(subString, index).join(subString).length;
    }

    function parseNestedField(key, input) {
        const nestedFields = ['ontologySourceReferences', 'comments', 'publications', 'comments', 'people',
            'roles', 'studies', 'studyDesignDescriptors', 'protocols', 'parameters', 'components', 'sources',
            'samples', 'otherMaterials', 'characteristics', 'derivesFrom', 'processSequence', 'assays', 'dataFiles',
            'characteristicCategories', 'unitCategories', 'factors']
        let result = input

        const splittedKey = key.split('.').reverse();

        for (let i = 0; i < splittedKey.length; i++) {
            if (nestedFields.includes(splittedKey[i])) {
                var j = i;
                while (nestedFieldsResults.includes(key.substring(0, getPosition(key, '.', splittedKey.length - i)) + j)) {
                    ++j;
                }
                result = {
                    "nested": {
                        "path": key.substring(0, getPosition(key, '.', splittedKey.length - i)),
                        "query": result,
                        "inner_hits": {
                            "size": 100,
                            "name": key.substring(0, getPosition(key, '.', splittedKey.length - i)) + j
                        }
                    }
                }
            }
        }

        if(result.hasOwnProperty('nested')){
            nestedFieldsResults.push(result.nested.inner_hits.name);
        }
        return result;
    }
}
