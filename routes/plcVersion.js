const router = require('express').Router();
const {noEmptyQuery} = require('./controllers/middles');
const plcVerCont = require('./controllers/plcVersion');

module.exports = ()=>{
  router.get('/plc/version/many', plcVerCont.readMany);
  router.get('/plc/version', noEmptyQuery(), plcVerCont.readOne);

  router.post('/plc/version', plcVerCont.create);

  router.put('/plc/version/many', plcVerCont.updateMany);
  router.put('/plc/version', noEmptyQuery(), plcVerCont.updateOne);

  router.delete('/plc/version**', plcVerCont.setDelDependents);
  router.delete('/plc/version/many', plcVerCont.deleteMany);
  router.delete('/plc/version', noEmptyQuery(), plcVerCont.deleteOne);

  return router;
};