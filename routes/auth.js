const router = require('express').Router();
const authCont = require('./controllers/auth');

module.exports = ()=>{
  router.get('/auth', authCont.isAuth);
  router.get('/auth/logout', authCont.checkAuthPermission(), authCont.logout);

  router.post('/auth/login', authCont.checkNotAuth, authCont.login);
  return router;
};