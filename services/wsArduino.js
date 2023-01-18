const { flattenObj } = require('../utils/transform');
const plcSrv = require('./plc');
const arduinoTranslate = require('./arduinoTranslate');
const {env} = require('../utils/env');

const msgCodes=Object.freeze({
  IDENTIFICATION: 0,  //PLC identification
  EMBED: 1,           //Ladder code Embed in PLC
  CONTROL: 2          //Control PLC
});

const onlinePlcs = []; //array of online PLC wsClients

function isPlcOnline(plcRef){
  return onlinePlcs.some(el => el.plcRef==plcRef);
}

function findPlcWsClient(plcRef){
  return onlinePlcs.find(el => el.plcRef==plcRef);
}

async function arduinoLogin(wsClient, plc){
  if(isPlcOnline(plc.reference)) throw new Error('PLC already online');

  const {reference, version} = plc;

  if(!(await plcSrv.exists({reference}))) //is it a new PLC?
    await plcSrv.create(reference, flattenObj(version)); //creating new PLC

  wsClient.plcRef = reference; //PLC reference on wsClient
  onlinePlcs.push(wsClient); //Saving online PLC
}

function wsSendMessageToPlc(plcRef, msg){
  const wsClient = findPlcWsClient(plcRef);
  wsClient.send(msg);
}

async function wsReceiveMessage(data){
  if(!(data instanceof Buffer)) return this.send('ERROR: Non binary received');

  if(data.length<1) return this.send('ERROR: Invalid Message (Empty)');
  const code = data[0];

  try{
    switch(code){
      case msgCodes.IDENTIFICATION:
        const plc = arduinoTranslate.plcDetails(data, 1);
        await arduinoLogin(this, plc);
        this.send('Successful login');
        break;
      default:
        this.send('ERROR: Invalid Message Code');
    }
  } catch(err){
    const errMsg = `${err.message}`;
    if(env.NODE_ENV=='development') console.log(errMsg);
    this.send(errMsg);
  }
}

function wsClose(){
  onlinePlcs.splice(onlinePlcs.findIndex(el => el.plcRef==this.plcRef), 1);
}

module.exports = {msgCodes, isPlcOnline, wsSendMessageToPlc, wsReceiveMessage, wsClose};