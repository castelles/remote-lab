const User = require('../models/user');
const verify = require('../utils/verify');
const createError = require('http-errors');
const {redisClient} = require('../loaders/redis');
const authPermTypes = {
  NO_SESSION: -1,
  INSUFFICIENT: 0,
  PERMITTED: 1
};

function isAuth(session){
  return session && session.userId ? true : false;
}

async function checkAuthPermission(session, reqRole){
  if(!isAuth(session)) return authPermTypes.NO_SESSION; 
  if(!reqRole) return authPermTypes.PERMITTED;

  reqRole = verify.roleToNumber(reqRole);
  if(!reqRole) throw createError(500, 'Bad auth role check');

  const curRole = parseInt(await redisClient.get(session.userId));
  if(reqRole < curRole) return authPermTypes.INSUFFICIENT;
  return authPermTypes.PERMITTED;
}

async function matchCredentials(payload){
  if(typeof payload.loginId != 'string') throw createError(400, 'Bad loginId');
  if(typeof payload.password != 'string') throw createError(400, 'Bad password');

  const loginId = payload.loginId.trim(), {password} = payload;

  if(verify.isUsername(loginId)) return await User.findOne({username:loginId.trim(), password}, '_id');
  else if(verify.isEmail(loginId)) return await User.findOne({email:loginId.trim(), password}, '_id');
  return null;
}

module.exports = {isAuth, authPermTypes, checkAuthPermission, matchCredentials};