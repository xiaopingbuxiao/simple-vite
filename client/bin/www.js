#!/usr/bin/env node



const app = require('../app')
const findPort = require('../util/findPort')

findPort(3000).then(port=>{
  app.listen(port);
})



