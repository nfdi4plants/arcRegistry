const express = require('express');
const https = require('https');
const env = require('dotenv');
const fs = require('fs');
const app = express();
app.use(express.json());
env.config();

const options = {
    hostname: process.env.NODE_IP,
    port: process.env.API_PORT,
    path: "",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.API_KEY
    },
    rejectUnauthorized: false
};
const certOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const responseHandler = (path, req, res) => {
    let params = "?", data = JSON.stringify({});
    if (Object.keys(req.query).length !== 0) {
        Object.keys(req.query).forEach((key) => {
            params += key + "=" + req.query[key] + "&";
        });
        path += params;
    }
    options.headers["Content-Length"] = JSON.stringify({}).length;
    options.method = 'GET';
    options.path = encodeURI(path);
    options.agent = new https.Agent(options);
    req = https.request(options, response => {
        var chunks = [];
        response.on('data', d => {
            chunks.push(d);
        });
        response.on('end', () => {
            if (!res.headersSent) {
                chunks = Buffer.concat(chunks).toString();
                res.send(chunks);
            }
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(data);
    req.end();
};

const postResponseHandler = (path, req, res) => {
    let request = req.body;
    options.headers["Content-Length"] = JSON.stringify(req.body).length;
    options.method = 'POST';
    options.path = path;
    options.agent = new https.Agent(options);
    req = https.request(options, response => {
        var chunks = [];
        response.on('data', d => {
            chunks.push(d);
        });
        response.on('end', () => {
            if (!res.headersSent) {
                chunks = Buffer.concat(chunks).toString();
                res.send(chunks);
            }
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(JSON.stringify(request));
    req.end();
};

//static files
app.use(express.static(__dirname + '/public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))
app.use('/scss', express.static(__dirname + '/public/scss'))
app.use('/scripts', express.static(__dirname + '/node_modules'))

/*app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html')
});*/

app.get("/isasearch", function (req, res) {
    res.sendFile(__dirname + '/views/isasearch.html')
});

app.get("/arcsearch", function (req, res) {
    res.sendFile(__dirname + '/views/arcsearch.html')
});

app.get("/logs", function (req, res) {
    res.sendFile(__dirname + '/views/logs.html')
});

app.get("/getARCs", function (req, res) {
    let path = '/api/v0/registry/arcs';
    responseHandler(path, req, res);
});

app.get("/getSpecificARC", function (req, res) {
    let path = '/api/v0/registry/arcs/' + encodeURIComponent(req.query.gitLabHost) + '/' + req.query.arcID + '/' + req.query.arcVersion;
    Object.keys(req.query).forEach((key) => {
        delete req.query[key];
    });
    responseHandler(path, req, res);
});

app.get("/getInvestigations", function (req, res) {
    let path = '/api/v0/registry/investigations';
    responseHandler(path, req, res);
});

app.get("/getInvestigation", function (req, res) {
    let path = '/api/v0/registry/arcs/' + encodeURIComponent(req.query.gitLabHost) + '/' + req.query.arcID + '/' + req.query.arcVersion + '/investigation';
    Object.keys(req.query).forEach((key) => {
        delete req.query[key];
    });
    responseHandler(path, req, res);
});

app.post("/postQuery", function (req, res) {
    let path = '/api/v0/registry/query';
    postResponseHandler(path, req, res);
});

app.get("/getPublications", function (req, res) {
    let path = '/api/v0/registry/publications';
    responseHandler(path, req, res);
});

app.get("/getLogs", function (req, res) {
    let path = '/api/v0/registry/logs';
    responseHandler(path, req, res);
});

app.get("/getAllParams", function (req, res) {
    let path = '/api/v0/registry/params';
    responseHandler(path, req, res);
});

app.get("/getParameter", function (req, res) {
    let path = '/api/v0/registry/params/' + encodeURIComponent(req.query.gitLabHost) + '/' + req.query.arcID + '/' + req.query.arcVersion + '/' + req.query.type;
    responseHandler(path, req, res);
});

https.createServer(certOptions, app).listen(8080, () => console.info("Webserver started!"));