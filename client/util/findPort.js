const net = require('net')
const findPort = function(port){
  const server = net.createServer().listen(port)
  return new Promise((resolve,reject)=>{
    server.on('listening',function(){
      console.log(`server is runing on port ${port}.........`)
      server.close()
      return resolve(port)
    })
    server.on('error',function(err){
      if(err.code==='EADDRINUSE'){
        return resolve(findPort(port+1))
      }else{
        console.log(err)
        return reject(err)
      }
    })
  })
}
module.exports = findPort