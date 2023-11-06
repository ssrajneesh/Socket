var app = require('express')();
var http = require('http').Server(app);
// var io = require('socket.io')(http);
const io = require('socket.io')(4000,{
   cors:{
     origin:'*' //http://localhost:5001
   }
});
arr1 = []
io.on('connection', client => { 
   console.log("Connection Open!",client.id)
   arr1.push(client.id)
   console.log(arr1)
   // client.on('event', data =>{
   //    io.emit('emit', data, () => {
   //       console.log(arr1[0],data)
   //    })
   // })
   client.on('event', data =>{
      // io.to(arr1[0]).emit('emit', data, () => {
         client.broadcast.emit('emit', data, () => {
         console.log(arr1[1],data)
      })
   })
   client.on('disconnect',data => {
      console.log("Connection disconnected!",client.id)
      arr1.splice(arr1.indexOf(client.id), 1);
      console.log(arr1)
   })
});



// io.on('connection', client => { 
//    console.log("Connection Open!",client.id)
//    arr1.push(client.id)
//    client.on('event', data =>{
//       console.log(data)
//       io.emit('emit', data, () => {

//       })
//    })
//    io.to(arr1[0]).emit('emit', "Pankaj Bhai Biryani Kuch bachna nahin chahiye!", () => {
//       console.log(arr1[0])
//    })
   // setInterval(() => { 
   //    io.to(arr1[0]).emit('emit', "Pankaj Bhai Biryani Kuch bachna nahin chahiye!", () => {
   //       console.log(arr1[0])
   //    })
   // }, 10000);

//  });


app.get('/chat', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

//Socket init
   
// var clients = 0;

// io.on('connection', function(socket){
//    clients++;
//    console.log("User Connected!")
//    io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
//    socket.on('disconnect', function () {
//       console.log("disconnected")
//       clients--;
//       io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
//    });
// });

http.listen(3000, function(){
   console.log('listening on localhost:3000');
});