const http = require('http');

const startServer = (app)=>{
       const server = http.createServer(app);

        server.listen(process.env.REST_PORT);

        server.on('listening',()=>{
            console.log(`server listening on port : ${server.address().port}`);
        });

        server.on('error',(err)=>{
            console.log(`${err}`);
        });
}

module.exports = {
    startServer : startServer
}