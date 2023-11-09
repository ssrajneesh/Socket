const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors())

function connectToDatabase() {
   mongoose.connect("mongodb://127.0.0.1:27017/chatapp", {
   useNewUrlParser: true,
   useUnifiedTopology: true,
      });

   const db = mongoose.connection;
 
   db.on('error', (err) => {
     console.error('MongoDB connection error:', err);
   });
 
   db.once('open', () => {
     console.log('Connected to MongoDB database');
   });
 
   db.on('disconnected', () => {
     console.log('MongoDB disconnected');
   });
   return db;
 }
connectToDatabase();

const chatUserSchema = new mongoose.Schema({
   email: {
      type: String,
      unique: true,
      required: true,
    },
  password: String,
});
const ChatUser = mongoose.model("chatuser", chatUserSchema);
const sessionSchema = new mongoose.Schema({
   id: String,
   email: {
      type: String,
      unique: true,
      required: true,
    },
   jwt: String,
   expiresAt: Date,
 });
const Session = mongoose.model("Session", sessionSchema);

app.post('/register', async function (req, res) {
  const { email, password } = req.body;
  console.log(email, password)

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new ChatUser({
      email,
      password: hashedPassword,
    });
    console.log(email, hashedPassword)
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log({ response: "json", port_no: 3002 });
});


app.post('/login', async function (req, res) {
   const { email, password } = req.body;
   try {
     const user = await ChatUser.findOne({ email });
     if (!user) {
       return res.status(401).json({ error: 'Invalid email or password' });
     }
     const passwordMatch = await bcrypt.compare(password, user.password);
     if (!passwordMatch) {
       return res.status(401).json({ error: 'Invalid email or password' });
     }
     let token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });
     try {
      const newsession = Session({id:'',email:email,jwt:token});
      await newsession.save();
     } catch (err) {
      const token_user = await Session.findOne({ email });
      let token = token_user.jwt;
      console.log("2nd:",token)
     }
     res.status(200).json({ email:email,token: token });
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 });

app.get('/logout', async (req, res) => {
   const { email } = req.query;
   try {
     const deletedSession = await Session.findOneAndDelete({ email: email });
     if (deletedSession) {
       res.status(200).json({ message: 'Logged out successfully' });
     } else {
       res.status(401).json({ message: 'Invalid or expired token' });
     }
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
});

app.get('/users', async (req, res) =>{
   try {
      const alluser = await Session.find()
      res.status(200).json({"data" : alluser})
   }catch{
      res.status(401).json({ data: 'No users Found' });
   }
})

// var app = require('express')();
// var http = require('http').Server(app);

// var io = require('socket.io')(http);
const io = require('socket.io')(4000,{
   cors:{
     origin:'*' //http://localhost:5001
   }
});
const userSockets = {};
io.on('connection', async client => {
   const userEmail = client.handshake.query.userEmail;
   userSockets[userEmail] = client.id
   console.log(userSockets)
   // try {
   //    const updatedDocument = await Session.findOneAndUpdate(
   //       { email: userEmail },
   //       { id: client.id },
   //       { new: false }
   //    );

   //    if (updatedDocument) {
   //       console.log('Updated document:', updatedDocument);
   //    } else {
   //       console.log('No document found with the specified email.');
   //    }
   // } catch (err) {
   //    console.error('Error updating document:', err);
   // }
   client.on("room", room => {
      client.join(room)
   })

   client.on('event', async ({ message, userDeviceId, selectedEmail }) => {
      const deviceidtoemit = await userSockets[selectedEmail]
      console.log(userDeviceId,selectedEmail,deviceidtoemit,message)
      client.to(deviceidtoemit).emit('emit', { message, userDeviceId, selectedEmail });
    });

   client.on('disconnect', data => {
      console.log("Connection disconnected!", client.id);
   });
});


// io.on('connection', client => {
//    const userEmail = client.handshake.query.userEmail;
//    console.log("Connection Open!",client.id,userEmail)
//    Session.findOneAndUpdate(
//       { email: userEmail },
//       { id: client.id },
//       { new: false },
//       (err, updatedDocument) => {
//          if (err) {
//             console.error('Error updating document:', err);
//          } else {
//             if (updatedDocument) {
//             console.log('Updated document:', updatedDocument);
//             } else {
//             console.log('No document found with the specified email.');
//             }
//          }
//       }
//     );
   // console.log(`User with email "${userEmail}" and device ID "${client.id}" connected.`);
   // client.on('event', data =>{
   //    io.emit('emit', data, () => {
   //       console.log(arr1[0],data)
   //    })
   // })
//    client.on('event', data =>{
//       io.to(arr1[0]).emit('emit', data, () => {
//          client.broadcast.emit('emit', data, () => {
//          console.log(arr1[1],data)
//       })
//    })
//    client.on('disconnect',data => {
//       console.log("Connection disconnected!",client.id)
//    })
// });



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

// app.get('/chat', function(req, res){
//    res.sendFile(__dirname + '/index.html');
// });

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

// http.listen(3000, function(){
//    console.log('listening on localhost:3000');
// });