const _sortedIndexBy = require('lodash/sortedIndexBy');
const _has = require ('lodash/has');
const createError = require('http-errors');
const {env, IOs, types, IOTypeModels, getIOTypeModel, diagElements} = require('../utils/env');
const {diagSymbols, diagRelays} = diagElements;
const {endianesses, uintToArrayBytes, binStrToArrayBytes, intQtDigits} = require('../utils/transform');

//==========From PLC to server==========
function plcDetails(data, iStart){
  if(typeof iStart!='number') iStart=0;
  if(!(iStart+2<data.length)) throw createError(404, 'ERROR: Invalid version (Insufficient Bytes)');
  else if(!(iStart+3<data.length)) throw createError(404, 'ERROR: Invalid reference (Empty)');

  const release = `${data[iStart]}.${data[iStart+1]}.${data[iStart+2]}`;
  const version = {release};

  let reference = "";
  for(let i=iStart+3;i<data.length;i++)
    reference += data[i].toString(16).padStart(2, '0');

  return {reference, version};
}
//======================================

//==========From server to PLC==========
function genDevWithVars(devices, devVars, qtVars){
  let totalDevices=0, totalDevVars=0;
  const checkVarID={};

  for(const io of IOs){
    for(const type of types){
      if(!_has(devVars, [io,type])){
        delete devices[io][type]; continue;
      }
      
      //based on current io-type:
      const deviceArr = devices[io][type]; //devices array
      const varArr = devVars[io][type];    //variables array
      
      for(const v of varArr){ //iterating over variables array
        if(!(v.id>=0 && v.id<qtVars)) throw createError(404, `invalid variable ID: expected variable id in [0,${qtVars-1}], but received ${v.id}, inside of ${type} ${io}.`);
        if(checkVarID[v.id]) throw createError(404, `ERROR: duplicated id (${v.id}).`);
        else checkVarID[v.id]=true;

        const iDev = _sortedIndexBy(deviceArr, v, (val)=>val.port); //searching for device on port
        if(!(iDev<deviceArr.length && deviceArr[iDev].port==v.port))
          throw createError(404, `ERROR: invalid ${type} ${io} port (${v.port}) in variable with id ${v.id}`);

        const dev = deviceArr[iDev]; //getting device on target port
        if(!dev.IOTypeModel || !Array.isArray(dev.varArr)){ //first variable added
          dev.IOTypeModel = getIOTypeModel(io, type, dev.model); //setting IOTypeModel
          dev.varArr = []; //creating variables array
          totalDevices++; //incrementing total os used devices
        }
        dev.varArr.push(v); totalDevVars++;
      }

      devices[io][type] = deviceArr.filter(dev=>(dev.IOTypeModel && Array.isArray(dev.varArr)));
    }
  }

  return {totalDevices, totalDevVars, devWithVars: devices};
}

function parseVarIO_IN_AL_GEN(v){
  const res=[];
  const {id, extras} = v;
  const checkDiv={};
  
  res.push(id);

  const qtDivs = extras.divs.length;
  res.push(...uintToArrayBytes(qtDivs, endianesses.LITTLE, 2));
  
  let maxDiv=-1;
  for(const div of extras.divs){
    if(checkDiv[div])
      throw createError(404, `ERROR: duplicate analog divisor (${div}) in variable ${id}`);
    else checkDiv[div]=true;
    if(div<maxDiv)
      throw createError(404, 'ERROR: divisor values must be in crescent order');
    res.push(...uintToArrayBytes(div, endianesses.LITTLE, 2));
    maxDiv=div;
  }

  res.push(...binStrToArrayBytes(extras.zones));
  res.push(...binStrToArrayBytes(extras.dominances));

  return res;
}

function parseVar(IOTpMdCode, v){
  switch(IOTpMdCode){
    case IOTypeModels.IO_IN_AL_GEN:
      return parseVarIO_IN_AL_GEN(v);
    default:
      return [v.id];
  }
}

function parseDevWithVars(devWithVars){
  const devVarArr=[];

  for(const io of IOs){
    for(const type of types){
      if(!_has(devWithVars, [io,type])) continue;
      for(const dev of devWithVars[io][type]){
        const IOTpMdCode = dev.IOTypeModel.code;
        
        devVarArr.push(IOTpMdCode, dev.port, dev.varArr.length);
        for(const v of dev.varArr)
          devVarArr.push(...parseVar(IOTpMdCode, v));
      }
    }
  }
  
  return devVarArr;
}

function parseDiagram(diagram, qtVars){
  if(typeof diagram!='string')
    throw createError(404, 'ERROR: diagram must be a string');
  
  diagram.replace(' ', ''); //removing all spaces
  diagram.toUpperCase();    //Diagram toUpperCase

  const res=[];
  const maxVarChars = intQtDigits(qtVars, true)+1;

  for(let i=0, toJump=0;i<diagram.length;i+=toJump, toJump=0){
    for(const symbol in diagSymbols){
      if(diagram.startsWith(symbol, i)){
        res.push(diagSymbols[symbol]);
        toJump = symbol.length;
        break;
      }
    }
    if(toJump>0) continue;
    
    for(const relay in diagRelays){
      if(diagram.startsWith(relay, i)){
        res.push(diagRelays[relay]);
        toJump = relay.length;

        const numberI = i+toJump;
        const vId = parseInt(diagram.substring(numberI, numberI+maxVarChars));
        if(isNaN(vId))
          throw createError(404, `ERROR: invalid variable ID (${vId}) after relay, at index (${numberI})`);
        if(!(vId>=0 && vId<qtVars))
          throw createError(404, `Invalid variable ID: expected a number in [0,${qtVars-1}], but received (${vId}) on diagram at index (${numberI})`);
        
        res.push(vId);
        toJump += intQtDigits(vId);

        break;
      }
    }

    if(!(toJump>0))
      throw createError(404, `ERROR: can\'t parse diagram char (${diagram[i]}) at index (${i}).`);
  }

  return res;
}

function handleAtStart(atStart){
  if(Array.isArray(atStart))
    atStart = atStart.filter(val=>(typeof val == 'number'));
  else
    atStart = (typeof atStart=='number') ? [atStart] : [];
  return atStart;
}

function clientToArduinoEmbed(plc, clientProtocol, atStart){
  atStart = handleAtStart(atStart);

  const {qtVars, devVars, diagram} = clientProtocol;

  if(!(typeof qtVars=='number' && qtVars>=0 && qtVars<=env.PLC_MAX_VARS))
    throw createError(404, `Invalid qtVars: expected qtVars as a number in [0,${env.PLC_MAX_VARS}], but received (${qtVars}).`);

  const {totalDevices, totalDevVars, devWithVars} = genDevWithVars(plc.devices, devVars, qtVars);
  const devVarArr = parseDevWithVars(devWithVars);
  const parsedDiagram = parseDiagram(diagram, qtVars);
  const ptcSz = 2 + devVarArr.length + parsedDiagram.length;

  return new Uint8Array([...atStart, ...uintToArrayBytes(ptcSz, endianesses.LITTLE, 2),
     totalDevices, qtVars, ...devVarArr, ...parsedDiagram]);
}

const controls=Object.freeze({
  PAUSE: 0,
  RESUME: 1,
  RESET: 2
});
function clientControlToArduino(control, atStart){
  if(typeof control=='string') control=controls[control.trim().toUpperCase()];
  else if(typeof control=='number')
    if(!(Number.isInteger(control) && Object.values(controls).indexOf(control)!=-1))
      control=undefined;
  else control=undefined;

  atStart = handleAtStart(atStart);

  if(control==undefined) throw createError(400, 'ERROR: Invalid Control Command.');

  return new Uint8Array([...atStart, control]);
}

module.exports = {plcDetails, clientToArduinoEmbed, clientControlToArduino};