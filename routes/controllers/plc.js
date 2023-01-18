const plcSrv = require('../../services/plc');
const createError = require('http-errors');
const {flattenObj} = require('../../utils/transform');

async function readMany(req, res){
  const filter = req.query, {projection} = req.queryAdvanced;
  const plcArr = await plcSrv.readMany(filter, projection);
  res.status(200).json(plcArr);
}

async function readOne(req, res){
  const filter = req.query, {projection} = req.queryAdvanced;
  const plcVer = await plcSrv.readOne(filter, projection);
  if(!plcVer) throw createError(404, 'PLC not found');
  res.status(200).json(plcVer);
}

//Development Only
async function create(req, res){
  const {reference, version} = req.body;
  await plcSrv.create(reference, flattenObj(version));
  res.status(200).end();
}

async function updateMany(req, res){
  const filter = req.query, updatedPlcVer = req.bodyFlat;
  const result = await plcSrv.updateMany(filter, updatedPlcVer);

  if(!result.acknowledged) throw createError(400, 'Bad PLC Updating');

  res.status(204).end();
}

async function updateOne(req, res){
  const filter = req.query, updatedPlcVer = req.bodyFlat;
  const result = await plcSrv.updateOne(filter, updatedPlcVer);

  if(!result.acknowledged) throw createError(400, 'Bad PLC Updating');
  if(result.matchedCount<1) throw createError(404, 'PLC not found');

  res.status(204).end();
}

async function deleteMany(req, res){
  const filter = req.query;
  await plcSrv.deleteMany(filter);
  res.status(204).end();
}

async function deleteOne(req, res){
  const filter = req.query;
  const {deletedCount} = await plcSrv.deleteOne(filter);
  if(deletedCount<1) throw createError(404, 'PLC not found');
  res.status(204).end();
}

module.exports = {readMany, readOne, create, updateMany, updateOne, deleteMany, deleteOne};
