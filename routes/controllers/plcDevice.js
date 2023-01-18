const plcDevSrv = require('../../services/plcDevice');
const createError = require('http-errors');

async function addOneDevice(req, res){ //push 1 device to array
  const plcFilter = req.query, {io, type} = req.params, newDev = req.body;
  await plcDevSrv.addOneDevice(plcFilter, io, type, newDev);
  res.status(200).end();
}

async function deleteDevices(req, res){ //delete devices from array
  const {query} = req, {io, type} = req.params;
  const {ports} = query; delete query.ports;

  const result = await plcDevSrv.deleteDevices(query, io, type, ports);
  
  if(!result.acknowledged) throw createError(400, 'Bad PLC device Delete');
  if(result.matchedCount<1) throw createError(404, 'PLC not found');

  res.status(200).end(); 
}

module.exports = {addOneDevice, deleteDevices};