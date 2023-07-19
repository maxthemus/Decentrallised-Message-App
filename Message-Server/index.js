//Setting up web socket server
const WebSocket = require("ws");

require("dotenv").config();
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const IP_ADDR = process.env.IP;

const socketServer = new WebSocket.Server({ port: 3000 });

//Const auth user
const user = {
    username: USERNAME,
    password: PASSWORD,
}

const AUTH_SOCKETS = new Map();

const messages = [];



socketServer.on("connection", (socket) => {
    console.log("Client has connected");
    
    socket.on("message", (message) => {
        const json = JSON.parse(message);
        console.log(json);
        if(AUTH_SOCKETS.has(socket)) {
            if("type" in json) {
                switch(json.type) {
                    case "UPDATE":
                        handleUpdateMessages(json); 
                        break;
                }
            }
        } else {
            if("type" in json) {
                switch(json.type) {
                    case "AUTH":
                        if(authSocket(json.username, json.password)) {
                            AUTH_SOCKETS.set(socket, true);
                        } else {
                            socket.close();
                        }
                        break;
                    case "message":
                        handleIncommingMessage(json);  
                        break;
                }
            }
        }
    });

    socket.on("close", () => {
        console.log("socket disconnected");
    });

});


//Handles incomming messages
function handleIncommingMessage(payload) {
   //Adding message to DB 
    messages.push({
        from: payload.from,
        message: payload.message
    });

    //Now we want to forward message to all connected clients
    AUTH_SOCKETS.forEach((key, value) => {
        key.send(JSON.stringify({
            from: payload.from,
            to: IP_ADDR,
            message: payload.message
        }));
    });
}

function handleUpdateMessages(payload) {
    messages.push({
        from: IP_ADDR,
        to: payload.to,
        message: payload.message
    });
}


function authSocket(username, password) {
    if(user.username == username) {
        if(user.password == password) {
            return true;
        }
    }
    return false;
}

