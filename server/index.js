const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"../public/index.html"));
});

const words=["cat","dog","car","tree","apple"];

let rooms={};

io.on("connection",socket=>{

socket.on("createRoom",username=>{
  const code=Math.random().toString(36).substring(2,7).toUpperCase();
  rooms[code]={players:[{id:socket.id,username,score:0}],drawer:0,word:"",round:1};
  socket.join(code);
  socket.emit("roomCreated",code);
});

socket.on("joinRoom",({room,username})=>{
  if(!rooms[room]) return;
  rooms[room].players.push({id:socket.id,username,score:0});
  socket.join(room);
  socket.emit("roomJoined",room);
});

socket.on("start",room=>{
  startRound(room);
});

socket.on("draw",d=>{
  socket.to(d.room).emit("draw",d);
});

socket.on("clear",room=>{
  io.to(room).emit("clear");
});

socket.on("guess",d=>{
  const r=rooms[d.room];
  if(!r) return;

  if(d.msg.toLowerCase()===r.word){
    r.players.find(p=>p.id===socket.id).score+=100;
    io.to(d.room).emit("correct",{username:d.username,points:100});
    io.to(d.room).emit("scores",r.players);
    r.drawer=(r.drawer+1)%r.players.length;
    r.round++;
    startRound(d.room);
  }else{
    io.to(d.room).emit("chat",d);
  }
});

});

function startRound(room){
  const r=rooms[room];
  if(!r) return;

  r.word=words[Math.floor(Math.random()*words.length)];
  const drawer=r.players[r.drawer];

  io.to(room).emit("round",{drawer:drawer.username,round:r.round});
  io.to(drawer.id).emit("yourTurn",r.word);
}

server.listen(3000,()=>console.log("Running http://localhost:3000"));
