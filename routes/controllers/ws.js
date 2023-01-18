const wsArduinoSrv = require('../../services/wsArduino');

function arduinoPlc(ws, req){
  ws.on('message', wsArduinoSrv.wsReceiveMessage);
  ws.on('close', wsArduinoSrv.wsClose);
  ws.on('error', (err)=>{console.log(err)});
}

module.exports = {arduinoPlc};