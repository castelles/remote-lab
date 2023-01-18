const {env} = require('../utils/env');
const express = require('express');
require('express-async-errors');
const {loadDb, loadApp} = require('./load');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require("path");

function httpsCreds(){
  const creds = {
    key: fs.readFileSync(path.resolve(`${env.SSL_PATH}/private.key`)),
    cert: fs.readFileSync(path.resolve(`${env.SSL_PATH}/certificate.crt`))
  };
  if(fs.existsSync(path.resolve(`${env.SSL_PATH}/ca_bundle.crt`)))
    creds.ca = fs.readFileSync(path.resolve(`${env.SSL_PATH}/ca_bundle.crt`));

  return creds;
}

async function loadAll(app){
  await loadDb(); //Loading database connections
  await loadApp(app); //load App (DB, routes, auth, etc...)
}

async function startServer(){
  const app = express();
  // const httpServer = http.createServer(); //Used for WebSocket Server
  // const httpsServer = https.createServer(httpsCreds(), app); //Used for Rest API

  await loadAll(app);
  app.listen(3000, () => {
    console.log("connected on port " + 3000)
  })
  
  // httpServer.listen(env.HTTP_PORT, ()=>{console.log(`HTTP Server listening at port ${env.HTTP_PORT}`);});
  // httpsServer.listen(env.HTTPS_PORT, ()=>{console.log(`HTTPS Server listening at port ${env.HTTPS_PORT}`);});
}

module.exports = {startServer};
