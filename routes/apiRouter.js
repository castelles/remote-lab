const router = require('express').Router();
const authRouter = require('./auth'),
  userRouter = require('./user'),
  plcRouter = require('./plc'),
  plcVerRouter = require('./plcVersion'),
  plcDevRouter = require('./plcDevice'),
  plcProgRouter = require('./plcProgram');
const {advancedQuery, flattenBody} = require('./controllers/middles');

module.exports = ()=>{
  router.use(authRouter());
  router.use(userRouter());
  router.get('*', advancedQuery()); //sets req.advanced for advanced GET queries (projection, 'sort'...))
  router.put('*', flattenBody());   //flats req.body of PUT requests
  router.use(plcRouter());
  router.use(plcVerRouter());
  router.use(plcDevRouter());
  router.use(plcProgRouter());

  return router;
};