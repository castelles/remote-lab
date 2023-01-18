const router = require('express').Router();
const wsCont = require('./controllers/ws');
const expressWs = require('../loaders/expressWs');

module.exports = (app, wsServer)=>{
  expressWs(app, wsServer);  //setting WebSocket server, and app.ws method
  router.ws('/arduino', wsCont.arduinoPlc);
  return router;
};