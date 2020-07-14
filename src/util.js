var contentTypeToACEMode = {
    'application/json': 'json',
    'text/xml': 'xml'
};

export function processRawRequest($form, $auth, $protocol, $ssl, $certificate) {
    var contentType;
    var editor = $form['ed1'];
    var processedHeaders = {};
    var option = { headers: {} };
    let req = editor.getSession().doc.getAllLines();
    let lineNo = 0;
    for (let line of req) {
        if (line) {
            if (lineNo == 0) {
                let parts = line.split(/\s+/);
                option.method = parts[0];
                option.headers.path = parts[1];
                option.url = parts[1];
                lineNo++;
            } else {
                let parts = line.split(/:\s/);
                if (!processedHeaders[parts[0]] && parts[0].length > 0) {
                    if (parts[0] == 'Host') {
                        option.url = $protocol + '://' + parts[1].trim() + option.url;
                    }
                    if (parts[0] === 'Content-Type') {
                        contentType = contentTypeToACEMode[parts[1]];
                    }
                    option.headers[parts[0]] = parts[1].trim();
                    processedHeaders[parts[0]] = '0xCB';
                }
            }
        }
    }
    option.auth = $auth;
    option.ssl = $ssl;
    option._cert = $certificate;
    $form.httpReqOpt = option;
    return contentType;
}

export async function postData(url, data) {
    var localReq = isLocalReq(data);
    if (data.method === 'GET') {
        updateURLForGET(data);
    }
    try {
        const response = await (localReq ?
            fetch(data.url, toLocalRequest(data)) :
            fetch(url, toPostData(data))
        );
        var isJSON = /json/i.test(response.headers.get('content-type'));
        var resBody = await (await isJSON ? response.json() : response.text());
        if (localReq) {
            var hdrs = {};
            response.headers.forEach(function (value, name) {
                hdrs[name] = value;
            });
            resBody = toAPIResponse(hdrs, resBody,
                { code: response.status, msg: response.statusText });
        }
        return resBody;
    } catch (e) {
        return toAPIResponse(undefined, e, { code: 600, msg: '' });
    }
}

function toPostData(data) {
    return {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    };
}

function toAPIResponse(hdrs, body, status) {
    return {
        body,
        status,
        headers: hdrs ? hdrs : { 'content-type': 'text/plain' }
    };
}

function isLocalReq({ url }) {
    return /^http:\/\/localhost:\d+/.test(url);
}

function toLocalRequest(data) {
    if (data.method === 'GET') {
        delete data.body;
    }
    return data;
}


function updateURLForGET(data) {
    if (data.body.length > 0) {
        data.url = data.url.split('?')[0] + '?' + data.body.split('\n').join('&');
    }
}

export async function postLocalData(data) {
    const response = await fetch(data.url, data);
    var isJSON = /json/i.test(response.headers.get('content-type'));
    return await isJSON ? response.json() : response.text();
}

export async function getData(url) {
    const response = await fetch(url);
    return await response.json();
}

export async function postPlainData(url, data) {
    const response = await fetch(url, {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        }
    });
    return response.json();
}

export async function postFormData(url, form) {
    const response = await fetch(url, {
        method: "POST",
        body: form
    });
    return response.json();
}



export async function syncS3Files($form) {
    var reqBody = interpolateVariables($form.output);
    delete reqBody["type"];
    $form.s3Files = await postData('/api/s3-file-list', reqBody);
    if (!$form.s3Syncd) {
        $form.s3Syncd = true;
    }
    return toS3FileMap($form.s3Files);
}


function interpolateVariables(s3Param) {
    var trgt = Object.assign({}, s3Param);
    var varPattern = /(\$(\w+){([A-Za-z-]+)})/;
    if (varPattern.test(trgt.Prefix)) {
        var parts = varPattern.exec(trgt.Prefix);
        if (parts[2] === 'date') {
            trgt.Prefix = trgt.Prefix.replace(parts[0], moment().format(parts[3].toUpperCase()));
        }
    }
    return trgt;
}

function toS3FileMap(res) {
    var newFiles = [];
    var files = res.Contents;
    if (s3Files.size != files.length) {
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (!s3Files[f.Key]) {
                s3Files[f.Key] = '0xcafebabe';
                s3Files.size++;
                newFiles.push({
                    Bucket: res.Name,
                    Key: f.Key,
                    cd: f.LastModified
                });
            }
        }
    }
    return newFiles;
}

var s3Files = {
    size: 0
};

export async function readHistory(team = window.sessionStorage.team) {
    var testSuits = [];
    var items = await getData('/api/teams/' + team + '/testsuites/');
    if (items != null) {
        testSuits = items.keys.map((t) => t.replace(team + '::', ''));
    }
    return testSuits;
}


export function parseSFRFileContent(content) {
    var tc = {
        ip: null,
        title: null,
        validation: null,
        mode: null,
        validator: null
    };

    var validatorMap = {
        rjql: 0,
        text: 1,
        regex: 2
    };

    var blockRegex = /^([A-Z]+):/;
    try {
        var parts = content.split(/__SimplifyR__/).slice(1);
        for (var part of parts) {
            part = part.trim();
            var block = blockRegex.exec(part)[1];
            var type = block[0];
            block = block.substr(1);
            switch (type) {
                case 'I':
                    tc.mode = block.toLocaleLowerCase();
                    tc.ip = value(part);
                    break;
                case 'T':
                    tc.title = value(part);
                    break;
                case 'V':
                    tc.validator = validatorMap[block.toLocaleLowerCase()];
                    tc.validation = value(part);
                    break;
            }
        }
    } catch (err) {
        console.log(err);
        return null;
    }

    return tc;

    function value(part) {
        return part.replace(blockRegex, '').trim();
    }
}


export function getChartData(stat, labelType) {
    var chartData = {
        labels: getLabels(),
        series: [
            { value: stat.passed, className: "light-green" },
            { value: stat.failed, className: "light-red" }
        ]
    };

    if (stat.passed == 0) {
        chartData.labels = [chartData.labels[1]];
        chartData.series = [chartData.series[1]];
    }

    if (stat.failed == 0) {
        chartData.labels = [chartData.labels[0]];
        chartData.series = [chartData.series[0]];
    }

    return chartData;


    function getLabels() {
        return [
            ["Passed", "Failed"],
            [`${stat.passed}%`, `${stat.failed}%`]
        ][labelType];
    }
}

export function toRedisKey(urlDate) {
    var p = window.location.pathname.split('/');
    return [p[1], p[3], p[5], urlDate].join('::');
};


export function parseAutomationResult(raw) {
    raw = JSON.parse(raw);
    if (typeof raw.data === 'string') {
        raw.data = JSON.parse(raw.data);
    }
    return raw;
}