const Plc = require('../models/plc'); 
const plcVerSrv = require('./plcVersion');
const _isEmpty = require('lodash/isEmpty');
const {mongoose} = require('../loaders/mongo');
const createError = require('http-errors');
const {flattenObj} = require('../utils/transform');

async function readMany(filter, projection){
  return await Plc.find(filter, projection);
}

async function readOne(filter, projection){
  if(_isEmpty(filter)) return null;
  return await Plc.findOne(filter, projection);
}

async function exists(filter){
  if(_isEmpty(filter)) return false;
  return await Plc.exists(filter);
}

async function existsVersion(verFilter){
  if(_isEmpty(verFilter) && await Plc.exists({})) return true;
  const plcFilter = flattenObj({version: verFilter});
  return await Plc.exists(plcFilter);
}

async function create(reference, plcVerFilter){
  let plcVer = await plcVerSrv.readOne(plcVerFilter);

  if(!plcVer) throw createError(404, 'PLC version not found');
  else if(!(plcVer instanceof mongoose.Document)) throw (500, 'Unexpected error while searching PLC version');
  else plcVer = plcVer.toObject();

  const plc = {
    reference: reference,
    name: reference,
    version: plcVer,
    createdAt: new Date()
  };

  await Plc.create(plc);
}

async function updateMany(filter, updatedPlc){
  updatedPlc = {name: updatedPlc.name}; //Can only Update Name
  return await Plc.updateMany(filter, updatedPlc);
}

async function updateOne(filter, updatedPlc){
  updatedPlc = {name: updatedPlc.name}; //Can only Update Name
  return await Plc.updateOne(filter, updatedPlc);
}

async function deleteMany(filter){
  return await Plc.deleteMany(filter);
}

async function deleteOne(filter){
  return await Plc.deleteOne(filter);
}

module.exports = {readMany, readOne, exists, existsVersion, create, updateMany, updateOne, deleteMany, deleteOne};