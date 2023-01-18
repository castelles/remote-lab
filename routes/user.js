const router = require('express').Router();
const authCont = require('./controllers/auth');
const userCont = require('./controllers/user');

module.exports = ()=>{
  router.get('/user', userCont.readAll);
  router.get('/user/session', authCont.checkAuthPermission(), userCont.readBySession);
  router.get('/user/:id', userCont.readById);

  router.post('/user', /*authCont.checkAuthRole('MASTER'),*/ userCont.create);

  router.put('/user/:id', /*authCont.checkAuthPermission('MASTER'),*/ userCont.update);

  router.delete('/user/:id', /*authCont.checkAuthPermission(),*/ userCont.remove);

  return router;
};