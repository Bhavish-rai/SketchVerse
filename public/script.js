const usernameInput = document.getElementById("username");


const socket=io();
let room="",username="",isDrawer=false;

const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
let drawing=false;

document.getElementById("createRoom").onclick=()=>{
 username=usernameInput.value;
 socket.emit("createRoom",username);
};

document.getElementById("join").onclick=()=>{
 username=usernameInput.value;
 room=roomInput.value.toUpperCase();
 socket.emit("joinRoom",{room,username});
};

socket.on("roomCreated", c => {
  room = c;
  document.getElementById("roomDisplay").innerText = "Room Code: " + c;
  socket.emit("start", room);
});


socket.on("round",d=>{
 drawer.innerText=d.drawer;
 round.innerText=d.round;
 isDrawer=d.drawer===username;
});

socket.on("yourTurn",w=>word.innerText=w);

canvas.onmousedown=()=>isDrawer&&(drawing=true);
canvas.onmouseup=()=>drawing=false;

canvas.onmousemove=e=>{
 if(!drawing||!isDrawer)return;
 const r=canvas.getBoundingClientRect();
 const data={
   room,
   x:e.clientX-r.left,
   y:e.clientY-r.top,
   color:colorPicker.value,
   size:brushSize.value
 };
 draw(data);
 socket.emit("draw",data);
};

socket.on("draw",draw);

function draw(d){
 ctx.strokeStyle=d.color;
 ctx.lineWidth=d.size;
 ctx.lineCap="round";
 ctx.lineTo(d.x,d.y);
 ctx.stroke();
 ctx.beginPath();
 ctx.moveTo(d.x,d.y);
}

clearCanvas.onclick=()=>{
 ctx.clearRect(0,0,canvas.width,canvas.height);
 socket.emit("clear",room);
};

socket.on("clear",()=>ctx.clearRect(0,0,canvas.width,canvas.height));

send.onclick=()=>{
 socket.emit("guess",{room,msg:guess.value,username});
 guess.value="";
};

socket.on("chat",d=>messages.innerHTML+=`<li>${d.username}:${d.msg}</li>`);

socket.on("correct",d=>messages.innerHTML+=`<li>${d.username}+${d.points}</li>`);

socket.on("scores",p=>{
 scores.innerHTML="";
 p.forEach(x=>scores.innerHTML+=`<li>${x.username}:${x.score}</li>`);
});
