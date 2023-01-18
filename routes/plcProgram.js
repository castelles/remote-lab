const router = require('express').Router();
const {noEmptyQuery} = require('./controllers/middles');
const plcProgCont = require('./controllers/plcProgram');

module.exports = ()=>{
  router.post('/plc/program', noEmptyQuery(), plcProgCont.launchToArduino);
  router.post('/plc/program/control', noEmptyQuery(), plcProgCont.controlArduino);

  return router;
};