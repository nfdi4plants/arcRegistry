module.exports = function (client) {
    return new Promise(function (resolve) {
        client.indices.exists({index: 'logs'})
            .then(result => {
                if (result.statusCode === 404) {
                    console.log('No index logs exists.');
                    console.log('Create new index logs.');
                    client.indices.create({index: 'logs', body: logsMapping})
                        .then(result => console.log(result.body))
                        .catch(err => console.error(new Date() + " Error: " + JSON.stringify(err, null, 2)));
                } else {
                    console.log('Index logs already exists.');
                }
                resolve();
            })
            .catch(err => console.error(err));
    })
}

const logsMapping = {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 1
    },
    "mappings": {
        "properties": {
            "service": {
                "type": "keyword"
            },
            "date": {
                "type": "date"
            },
            "severity": {
                "type": "keyword"
            },
            "message": {
                "type": "text"
            },
            "originalRequest": {
                "type": "object"
            }
        }
    }
}