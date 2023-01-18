const _isEmpty = require('lodash/isEmpty');
const createError = require('http-errors');
const {flattenObj} = require('../../utils/transform');

//advanced: projection, sort(future)
function setQueryAdvanced(req, res, next){
  const {query} = req;
  req.queryAdvanced = {
    projection: query.projection
    //sort: query.sort //future...
  };
  delete query.projection;
  //delete query.sort; //future...
  return next();
}

function blockEmptyQuery(req, res, next){
  if(_isEmpty(req.query)) return next(createError(400, 'Empty query string not allowed'));
  return next();
}

function setBodyFlat(req, res, next){
  req.bodyFlat = flattenObj(req.body);  
  return next();
}

module.exports={
  advancedQuery: ()=>setQueryAdvanced,
  noEmptyQuery: ()=>blockEmptyQuery,
  flattenBody: ()=>setBodyFlat
};