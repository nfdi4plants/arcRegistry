module.exports = function (client, request) {
    const searchQuery = []

    // Service name
    if (request.query.service != null) {
        searchQuery.push({
            "match": {
                "service": {
                    "query": request.query.service
                }
            }
        });
    }

    // Creation date
    if (request.query.after != null && request.query.before != null) {
        searchQuery.push({
            "range": {
                "date": {
                    "gt": request.query.after,
                    "lt": request.query.before
                }
            }
        });
    } else if (request.query.before != null) {
        searchQuery.push({
            "range": {
                "date": {
                    "lt": request.query.before
                }
            }
        });
    } else if (request.query.after != null) {
        searchQuery.push({
            "range": {
                "date": {
                    "gt": request.query.after
                }
            }
        });
    }

    // Severity
    if (request.query.severity != null) {
        searchQuery.push({
            "match": {
                "severity": {
                    "query": request.query.severity
                }
            }
        });
    }

    // Message
    if (request.query.message != null) {
        searchQuery.push({
            "match": {
                "message": {
                    "query": request.query.message,
                    "fuzziness": "AUTO"
                }
            }
        });
    }

    // Limit
    let limit = 50;
    if (request.query.limit != null) {
        limit = request.query.limit;
    }

    return new Promise(function (resolve, reject) {
        client.search({
                index: 'logs',
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

                    const element = hit._source;
                    const score = hit._score;

                    const intermediateResult = {
                        "score": score,
                        "data": element
                    };

                    finalResults.hits.push(intermediateResult);
                }

                finalResults.hits.sort(function (x, y) {
                    const scoreX = x.score;
                    const scoreY = y.score;

                    if (scoreX < scoreY) return -1;
                    if (scoreX > scoreY) return 1;
                    return 0;
                });

                if (finalResults.hits.length > 0) {
                    finalResults.hits = finalResults.hits.slice(0, limit);
                }

                resolve(finalResults);
            })
            .catch(err => {
                reject(err);
                console.error(new Date() + " " + err)
            });
    });
}