const {env} = require('../utils/env');
const expressWs = require('express-ws');

function heartbeat() {
  this.isAlive = true;
}

function configWssPingIsAlive(wss){
  wss.on('connection', function connection(ws){
    ws.isAlive = true;
    ws.on('pong', heartbeat);
  });
  
  const interval = setInterval(()=>{
    wss.clients.forEach((ws)=>{
      if(ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, env.WS_PING_TIME);
  
  wss.on('close', function close(){
    clearInterval(interval);
  });

  wss.on('error', (err)=>{
    console.log('==========WS Server ERROR==========');
    console.log(err);
  });
}

function expressWsLoad(app, wsServer){
  const wssInstance = expressWs(app, wsServer);
  configWssPingIsAlive(wssInstance.getWss());
  return wssInstance;
}

module.exports = expressWsLoad;