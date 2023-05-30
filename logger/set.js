module.exports = function (client, request) {

    return new Promise(function (resolve, reject) {
        client.index({
            index: 'logs',
            body: request.body
        }).catch(err => {
            reject(err);
            console.error(new Date() + " " + err);
        });
    });
}