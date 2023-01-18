const plcProgSrv = require('../../services/plcProgram');

async function launchToArduino(req, res){
  const plcFilter = req.query, clientProtocol = req.body;
  const msg = await plcProgSrv.launchToArduino(plcFilter, clientProtocol)
  res.status(200).json(msg);
}

async function controlArduino(req, res){
  const plcFilter = req.query, {control}=req.body;
  await plcProgSrv.controlArduino(plcFilter, control)
  res.status(204).end();
}

module.exports = {launchToArduino, controlArduino};