const {roles} = require('./env');


//regexr.com/3cg7r (Instagram username - 1->30 characters long)
const usernameReg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/i;

//regexr.com/2rhq7 (RFC2822 Email Validation - case insensitive)
const emailReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

//regexr.com/3bfsi (Password Validation - 8->72 characters long)
const passReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,72}$/;

const {mongoose} = require('../loaders/mongo');

function isUsername(username){
  if(typeof username != "string") return false;
  const matches = username.match(usernameReg);
  return matches && matches.length==1;
}

function isEmail(email){
  if(typeof email != "string") return false;
  const matches = email.match(emailReg);
  return matches && matches.length==1;
}

function usernameOrEmail(loginId){
  if(isUsername(loginId)) return 1; //1 -> username
  if(isEmail(loginId)) return 2; //2 -> email
  return 0; //0 -> nothing
}

function isObjectId(id){
  return mongoose.isValidObjectId(id);
}

function roleToNumber(role){
  if(typeof role == 'string') role = roles.indexOf(role.trim().toUpperCase());
  if(typeof role != 'number' || role<0 || role>=roles.length) return undefined;
  return role;
}

module.exports={isUsername, isEmail, usernameOrEmail, isObjectId, emailReg, usernameReg, passReg, roleToNumber};