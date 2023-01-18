const userSrv = require('../../services/user');
const createError = require('http-errors');

async function readAll(req, res){
  const usersArr = await userSrv.readAll();
  res.status(200).json(usersArr);
}

async function readById(req, res){
  const id = req.params.id;
  const user = await userSrv.readById(id);
  if(!user) throw createError(404, 'User not found');
  res.status(200).json(user);
}

async function readBySession(req, res){
  const id = req.session.userId;
  const user = await userSrv.readById(id);
  if(!user) throw createError(404, 'User not found');
  res.status(200).json(user);
}

async function create(req, res){
  await userSrv.create(req.body);
  res.status(200).end();
}

async function update(req, res){
  const id = req.params.id, user = req.body;
  const result = await userSrv.updateById(id, user);

  if(!result.acknowledged) throw createError(400, 'Bad User Updating');
  if(result.matchedCount<1) throw createError(404, 'User not found');

  res.status(200).end();
}

async function remove(req, res){
  const delCount = await userSrv.removeById(req.params.id);
  if(delCount<1) throw createError(404, 'User not found');
  res.status(200).end();
}

module.exports = {readAll, readById, readBySession, create, update, remove};