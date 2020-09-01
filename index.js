const AWS = require('aws-sdk');
const og = require('open-graph');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Check request contents
exports.handler = function (event, context, callback) {
    console.log('Received request: ', event)
    if (event.url === undefined || event.url === '') {
        callback(null, {
            errorCode: '500 url-is-not-valid',
            errorDescription: 'URL is not valid'
        });
    } else {
        linkify(event, callback);
    }
};

// Autocomplete url
function fixUrl (url) {
    console.log('Fixing url: ', url)
    if (!!url && !/^https?:\/\//i.test(url)) {
        return 'http://' + url;
    } else {
        return url;
    }
}

// Generate Link preview
function linkify(event, callback) {
    og(event.url, function(err, meta){
        console.log(meta);
        callback(null, meta)
    })
}
