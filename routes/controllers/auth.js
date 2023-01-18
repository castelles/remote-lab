const createError = require('http-errors');
const authSrv = require('../../services/auth');
const {env} = require('../../utils/env');

function checkAuthPermission(reqRole){
  return (async (req, res, next)=>{
    const result = await authSrv.checkAuthPermission(req.session, reqRole),
      resTypes = authSrv.authPermTypes;
    switch(result){
      case resTypes.NO_SESSION: return next(createError(401, 'Unauthorized: no session ongoing'));
      case resTypes.INSUFFICIENT: return next(createError(403, 'Forbidden: insufficient permission'));
      default: return next();
    }
  });
}

function checkNotAuth(req, res, next){
  if(authSrv.isAuth(req.session)) throw createError(403, 'Forbidden: session ongoing');
  return next();
}

function isAuth(req, res){
  res.json({isAuth: authSrv.isAuth(req.session)});
}

async function login(req, res){
  const user = await authSrv.matchCredentials(req.body);
  if(!user) throw createError(401, 'Wrong login credentials');

  req.session.userId = user._id.toString();
  res.status(200).end();
}

async function logout(req, res){
  req.session.destroy(err=>{
    if(err) throw err;
    res.clearCookie(env.SESSION_NAME);
    res.status(200).end();
  });
}

module.exports = {checkAuthPermission, checkNotAuth, isAuth, login, logout};