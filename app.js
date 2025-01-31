const socket = new WebSocket("ws://localhost:8080"); // Anslut till servern

// Funktion för att logga meddelanden på skärmen
function logMessage(message, alignment = "left") {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.className = `message ${alignment}`;
  document.getElementById("messages").appendChild(messageDiv);
}

// Lyssna på meddelanden från servern
socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.message) {
    if (msg.type === "notification") {
      // Show join message on both sides
      if (msg.joined) {
        logMessage(`${msg.joined} har anslutit sig till rummet`, "right");
      }
      logMessage(msg.message, "left");
    } else {
      logMessage(msg.message, "left");
    }

    // Show user list if available
    if (msg.users) {
      logMessage(`Aktiva användare: ${msg.users.join(", ")}`, "left");
    }
  }
  if (msg.error) {
    logMessage(`Fel: ${msg.error}`, "left");
  }
};

// Hantera rumsskapande
document.getElementById("createRoom").addEventListener("click", () => {
  const roomCode = Math.random().toString(36).substring(2, 8); // Generera en rumskod
  socket.send(JSON.stringify({ action: "create", roomCode }));
});

// Hantera rumgåenden
document.getElementById("joinRoom").addEventListener("click", () => {
  const roomCode = document.getElementById("roomCode").value;
  const username = document.getElementById("username").value || "Anonym";
  socket.send(
    JSON.stringify({
      action: "join",
      roomCode,
      username,
    })
  );
});

// Lägg till ett avsnitt för att visa meddelanden
const messagesContainer = document.createElement("div");
messagesContainer.id = "messages";
document.getElementById("app").appendChild(messagesContainer);
