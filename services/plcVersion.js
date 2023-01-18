const {PlcVersion} = require('../models/plcVersion');
const Plc = require('../models/plc');
const {mongoose} = require('../loaders/mongo');
const _isEmpty = require('lodash/isEmpty');
const {flattenObj} = require('../utils/transform');
const createError = require('http-errors');

function sanitizeUpdate(updatedPlcVer){
  delete updatedPlcVer._id; //removing update on _id
  delete updatedPlcVer.createdAt; //removing update on createdAt
  return updatedPlcVer;
}

function verToPlcFilter(verFilter){
  if(verFilter instanceof mongoose.Document) verFilter = verFilter.toObject();
  return _isEmpty(verFilter) ? {} : flattenObj({version: verFilter});
}

//Handles update PLC version dependents
async function updateDependents(verFilter, updatedPlcVer){
  const plcFilter = verToPlcFilter(verFilter);
  const updatedPlc = flattenObj({version: updatedPlcVer});
  return await Plc.updateMany(plcFilter, updatedPlc);
}

//Handles delete PLC version dependents
async function deleteDependentHandler(verFilter, delDependents){
  const plcFilter = verToPlcFilter(verFilter);
  const existPlc = await Plc.exists(plcFilter);

  if(!existPlc) return {deletedCount: 0}; //don't exist any dependent plc
  if(!delDependents) //dependent deletion not permitted
    throw createError(409, 'Dependency error: there is some PLC dependent on the specified version(s).');

  return await Plc.deleteMany(plcFilter); //deleting dependents under permission
}

async function readMany(filter, projection){
  return await PlcVersion.find(filter, projection);
}

async function readOne(filter, projection){
  if(_isEmpty(filter)) return null;
  return await PlcVersion.findOne(filter, projection);
}

async function create(plcVersion){
  plcVersion.createdAt = new Date();
  await PlcVersion.create(plcVersion);
}

async function updateMany(filter, updatedPlcVer){
  updatedPlcVer = sanitizeUpdate(updatedPlcVer);

  const result = {};
  result.primary = await PlcVersion.updateMany(filter, updatedPlcVer);
  result.dependents = 
    (!result.primary.acknowledged)
      ? {acknowledged:false, matchedCount:0, modifiedCount:0, upsertedCount:0}
      : (result.primary.modifiedCount>0)
        ? await updateDependents(filter, updatedPlcVer)
        : {acknowledged:true, matchedCount:0, modifiedCount:0, upsertedCount:0};

  return result;
}

async function updateOne(filter, updatedPlcVer){
  updatedPlcVer = sanitizeUpdate(updatedPlcVer);

  const plcVer = await PlcVersion.findOne(filter, '_id');
  if(!plcVer){  //don't exist any plcVer matching the filter
    const neutralRes = {acknowledged:true, matchedCount:0, modifiedCount:0, upsertedCount:0};
    return {primary:neutralRes, dependents:neutralRes};
  }

  const result = {};
  result.primary = await PlcVersion.updateOne(plcVer, updatedPlcVer);
  result.dependents = 
    (!result.primary.acknowledged)
      ? {acknowledged:false, matchedCount:0, modifiedCount:0, upsertedCount:0}
      : (result.primary.modifiedCount>0)
        ? await updateDependents(plcVer, updatedPlcVer)
        : {acknowledged:true, matchedCount:0, modifiedCount:0, upsertedCount:0};

  return result;
}

async function deleteMany(filter, delDependents){
  const result={};
  result.dependents = await deleteDependentHandler(filter, delDependents);
  result.primary = await PlcVersion.deleteMany(filter);
  
  return result;
}

async function deleteOne(filter, delDependents){
  const plcVer = await PlcVersion.findOne(filter, '_id');
  if(!plcVer){ //don't exist any plcVer matching the filter
    const neutralRes = {deletedCount: 0};
    return {primary: neutralRes, dependents: neutralRes};
  }

  const result={};
  result.dependents = await deleteDependentHandler(plcVer, delDependents);
  result.primary = await PlcVersion.deleteOne(plcVer);
  
  return result;
}

module.exports = {readMany, readOne, create, updateMany, updateOne, deleteMany, deleteOne};