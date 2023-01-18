const {startServer} = require('./loaders/server');
const {env} = require('./utils/env')

async function start(){
  try{
    console.log(`Initializing server in |${env.NODE_ENV}| mode.`);
    await startServer();
  } catch(err){
    console.log('Error while initializing server!');
    console.dir(err);
  }
}

start();