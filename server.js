const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let rooms = {}; // Håller reda på aktiva rum

server.on("connection", (socket) => {
  console.log("En klient anslöt");

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.action) {
      case "create":
        const roomCode = data.roomCode;
        if (!rooms[roomCode]) {
          rooms[roomCode] = [];
          socket.roomId = roomCode; // Track creator's room
          socket.username = data.username || "Anonym"; // Store creator's username
          rooms[roomCode].push(socket); // Add creator to room
          socket.send(
            JSON.stringify({
              message: `Rum ${roomCode} har skapats!`,
              users: [socket.username],
            })
          );
        } else {
          socket.send(
            JSON.stringify({ error: `Rum ${roomCode} finns redan.` })
          );
        }
        break;

      case "join":
        const codeToJoin = data.roomCode;
        const username = data.username || "Anonym";
        if (rooms[codeToJoin]) {
          socket.username = username;
          socket.roomId = codeToJoin;
          rooms[codeToJoin].push(socket);

          const userList = rooms[codeToJoin].map((s) => s.username || "Anonym");

          // Notify ALL users in room including creator
          rooms[codeToJoin].forEach((client) => {
            client.send(
              JSON.stringify({
                message:
                  client === socket
                    ? `Du har gått med i rum ${codeToJoin} som ${username}`
                    : `${username} har anslutit sig till rummet`,
                type: "notification",
                users: userList,
                joined: username,
              })
            );
          });
        } else {
          socket.send(
            JSON.stringify({ error: `Rum ${codeToJoin} finns inte.` })
          );
        }
        break;

      default:
        socket.send(JSON.stringify({ error: "Okänd åtgärd" }));
    }
  });

  socket.on("close", () => {
    console.log("En klient kopplade bort");
    // Ta bort socket från alla rum
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((client) => client !== socket);
    }
  });
});

console.log("WebSocket-server körs på ws://localhost:8080");
