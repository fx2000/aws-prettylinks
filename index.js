const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const getLinkPreview = require('link-preview-js');

// Check request contents
exports.handler = function (event, context, callback) {
    if (event.accessToken === undefined || event.accessToken === '') {
        callback(null, {
            errorCode: '500 accessToken-not-valid',
            errorDescription: 'Invalid Access token'
        });
    } else if (event.url === undefined || event.url === '') {
        callback(null, {
            errorCode: '500 url-is-not-valid',
            errorDescription: 'URL is not valid'
        });
    } else {
        validateToken(event, callback);
    }
};

// Validate access token
function validateToken(event, callback) {
    var params = {
        TableName: 'Session',
        ProjectionExpression: 'session_id, session_user_id',
        FilterExpression: '#sesid = :sesid',
        ExpressionAttributeNames: {
            '#sesid': 'session_id'
        },
        ExpressionAttributeValues: {
            ':sesid': event.accessToken
        }
    };

    dynamodb.scan(params, function (err, data) {
        if (err) {
            console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
        } else {
            if (data.Items.length > 0) {
                var uid = data.Items[0].session_user_id;
                findUser(event, uid, callback);
            } else {
                callback(null, {
                    errorCode: 'accessToken-notvalid',
                    errorDescription: 'Invalid AccessToken'
                });
            }
        }
    });
}

// Find user in database
function findUser(event, uid, callback) {
    let params = {
        TableName: 'User',
        FilterExpression: 'user_id = :uid',
        ExpressionAttributeValues: {
            ':uid': uid
        }
    };

    dynamodb.scan(params, function (err, data) {
        if (err) {
            console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
        }
        else {
            if (data.Items.length > 0) {
                const user = data.Items[0]
                linkify(event, user, callback)
            } else {
                callback(null, {
                    errorCode: '500 wrong-user-id',
                    errorDescription: 'User id could not be found'
                });
            }
        }
    });
}

// Generate Link preview
function linkify(event, user, calllback) {
    getLinkPreview(event.url, {
        'user-agent': 'googlebot',
        'Accept-Language': language
    }).then(data => {console.log(data)});
}
