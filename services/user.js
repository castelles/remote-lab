const User = require('../models/user');
const {redisClient} = require('../loaders/redis');
const createError = require('http-errors');
const verify = require('../utils/verify');

function resolveProjection(projection){
  if(typeof projection == 'string') return projection;
  if(Array.isArray(projection)) return projection.join(' ');
  return null;
}

async function readAll(){ //remove in future updates!!!
  const usersArr = await User.find();
  return usersArr;
}

async function readMany(userFilter, projection){
  if(!userFilter) throw createError(400, 'Bad user filter');
  if(projection){
    projection = resolveProjection(projection);
    if(!projection) throw createErro(400, 'Bad projection');
  }
  return await User.find(userFilter, projection);
}

async function readOne(userFilter, projection){
  if(!userFilter) throw createError(400, 'Bad user filter');
  if(projection){
    projection = resolveProjection(projection);
    if(!projection) throw createErro(400, 'Bad projection');
  }
  return await User.findOne(userFilter, projection);
}

async function readById(id, projection){
  //if(!verify.isObjectId(id)) throw createError(400, 'Bad user id');
  if(projection){
    projection = resolveProjection(projection);
    if(!projection) throw createErro(400, 'Bad projection');
  }
  return await User.findById(id, projection);
}

async function create(user){
  user.createdAt = new Date().toISOString();
  user.id = (await User.create(user))._id.toString();
  await redisClient.set(user.id, verify.roleToNumber(user.role));
}

async function updateById(id, updatedUser){
  delete updatedUser._id; //removing update on _id
  delete updatedUser.createdAt; //removing update on createdAt
  const result = await User.updateOne({_id:id}, updatedUser, {runValidators: true});
  if(result.modifiedCount>0 && updatedUser.role)
    await redisClient.set(id, verify.roleToNumber(updatedUser.role));
  return result;
}

async function removeById(id){
  const {deletedCount} = await User.deleteOne({_id: id});
  if(deletedCount>=1) await redisClient.del(id);

  return deletedCount;
}

module.exports = {create, readAll, readMany, readOne, readById, updateById, removeById};