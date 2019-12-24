const functions = require('firebase-functions')
const express = require('express')
const basicAuth = require('basic-auth-connect')
const app = express()

const USERNAME = 'UZRA'
const PASSWORD = 'Qt1LRplNSQ'
app.all('/*', basicAuth(function(user, password) {
  return user === USERNAME && password === PASSWORD;
}));

app.use(express.static(__dirname + '/dist/'))

exports.app = functions.https.onRequest(app)