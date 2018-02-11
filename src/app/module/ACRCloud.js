var url = require('url');
var fs = require('fs');
var crypto = require('crypto');
var request = require('request');

var defaultOptions = {
  host: 'cn-north-1.api.acrcloud.com',
  endpoint: '/v1/identify',
  signature_version: '1',
  data_type:'audio',
  secure: true,
  access_key: 'cc9b5b612e2c7197a8cd81f5bc278881',
  access_secret: '0LoDYBBoq8TeYpRHgMQnSABXqmajPAUAJhAEfFHj'
};

function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

function sign(signString, accessSecret) {
  return crypto.createHmac('sha1', accessSecret)
    .update(new Buffer(signString, 'utf-8'))
    .digest().toString('base64');
}

/**
 * Identifies a sample of bytes
 */
function identify(data, cb) {
  var current_data = new Date();
  var timestamp = current_data.getTime()/1000;

  var stringToSign = buildStringToSign('POST',
    defaultOptions.endpoint,
    defaultOptions.access_key,
    defaultOptions.data_type,
    defaultOptions.signature_version,
    timestamp);

  var signature = sign(stringToSign, defaultOptions.access_secret);

  var formData = {
    sample: data,
    access_key:defaultOptions.access_key,
    data_type:defaultOptions.data_type,
    signature_version:defaultOptions.signature_version,
    signature:signature,
    sample_bytes:data.length,
    timestamp:timestamp,
  }
  request.post({
    url: "http://"+defaultOptions.host + defaultOptions.endpoint,
    method: 'POST',
    formData: formData
  }, cb);
}

exports.identify = identify;