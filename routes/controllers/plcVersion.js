const plcVerSrv = require('../../services/plcVersion');
const createError = require('http-errors');

async function readMany(req, res){
  const filter = req.query, {projection} = req.queryAdvanced;
  const plcVerArr = await plcVerSrv.readMany(filter, projection);
  res.status(200).json(plcVerArr);
}

async function readOne(req, res){
  const filter = req.query, {projection} = req.queryAdvanced;
  const plcVer = await plcVerSrv.readOne(filter, projection);
  if(!plcVer) throw createError(404, 'PLC version not found');
  res.status(200).json(plcVer);
}

async function create(req, res){
  await plcVerSrv.create(req.body);
  res.status(200).end();
}

function updateResultHandler(result){
  const msg = "Bad PLC version Updating:";
  if(!result.primary || !result.primary.acknowledged)
    throw createError(400, `${msg} error while updating version`);
  if(!result.dependents || !result.dependents.acknowledged)
    throw createError(400, `${msg} error while updating version dependents`);
}

async function updateMany(req, res){
  const filter = req.query, updatedPlcVer = req.bodyFlat;
  const result = await plcVerSrv.updateMany(filter, updatedPlcVer);
  updateResultHandler(result);

  res.status(204).end();
}

async function updateOne(req, res){
  const filter = req.query, updatedPlcVer = req.bodyFlat;
  const result = await plcVerSrv.updateOne(filter, updatedPlcVer);
  updateResultHandler(result);
  if(result.primary.matchedCount<1) throw createError(404, 'PLC version not found');

  res.status(204).end();
}

function setDelDependents(req, res, next){
  req.delDependents = (req.query.delDependents==='true');
  delete req.query.delDependents;
  next();
}

async function deleteMany(req, res){
  const {query: filter, delDependents} = req;
  await plcVerSrv.deleteMany(filter, delDependents);

  res.status(204).end();
}

async function deleteOne(req, res){
  const {query: filter, delDependents} = req;
  const result = await plcVerSrv.deleteOne(filter, delDependents);
  if(result.primary.deletedCount<1) throw createError(404, 'PLC version not found');

  res.status(204).end();
}

module.exports = {readMany, readOne, create, updateMany, deleteMany, setDelDependents, updateOne, deleteOne};