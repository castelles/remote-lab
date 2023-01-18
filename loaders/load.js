const {mongoCon, mongoSanitize} = require('./mongo'); //initializing mongo connection with mongoose
const {redisCon, redisClient} = require('./redis');
const cors = require('./cors');
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const session = require('./session'); //Session middleware configuration
const router = require('../routes/apiRouter');
const error = require('./error');
const wsRouter = require('../routes/wsRouter');

async function loadDb(){
  await mongoCon(); //connecting to MongoDB
  // await redisCon(); //connecting to Redis
}

async function loadApp(app){
  // app.use(wsRouter(app, wsServer)); //First handling websocket connections

  //If not websocket, handle HTTPS requests normally:
  app.use(cors()); //Cross-origin resource sharing (CORS) configuration
  app.use(compression()); //compression middleware
  app.use(helmet()); //setting helmet
  app.use(express.json()); //parse application/json body
  // app.use(session(redisClient)); //setting session middleware with redisClient for storage
  app.use(mongoSanitize()); //sanitizing req params/query/body from xss on MongoDB actions
  app.use(router()); //setting all routes
  app.use(error()); //errors handler
}

module.exports = {loadDb, loadApp};