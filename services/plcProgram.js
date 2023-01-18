const Plc = require('../models/plc');
const arduinoTranslate = require('./arduinoTranslate');
const wsArduinoSrv = require('./wsArduino');
const createError = require('http-errors');

async function getOnlinePlc(plcFilter){
  const plc = plcFilter ? await Plc.findOne(plcFilter) : null;
  if(!plc) throw createError(404, 'PLC not found');

  if(!wsArduinoSrv.isPlcOnline(plc.reference)) throw createError(400, 'Error: PLC is offline.');
  return plc;
}

async function launchToArduino(plcFilter, clientProtocol){
  const plc = await getOnlinePlc(plcFilter);

  const arduinoMsg = arduinoTranslate.clientToArduinoEmbed(plc.toObject(), clientProtocol, wsArduinoSrv.msgCodes.EMBED);
  wsArduinoSrv.wsSendMessageToPlc(plc.reference, arduinoMsg);
}

async function controlArduino(plcFilter, control){
  const plc = await getOnlinePlc(plcFilter);
  const arduinoMsg = arduinoTranslate.clientControlToArduino(control, wsArduinoSrv.msgCodes.CONTROL);
  wsArduinoSrv.wsSendMessageToPlc(plc.reference, arduinoMsg);
}

module.exports = {launchToArduino, controlArduino};