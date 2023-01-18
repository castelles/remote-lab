const router = require('express').Router();
const {noEmptyQuery} = require('./controllers/middles');
const plcDevCont = require('./controllers/plcDevice');

module.exports = ()=>{
  router.post('/plc/devices/:io/:type', noEmptyQuery(), plcDevCont.addOneDevice); //push 1 device to array
  router.delete('/plc/devices/:io/:type', noEmptyQuery(), plcDevCont.deleteDevices); //delete devices from array
  return router;
};