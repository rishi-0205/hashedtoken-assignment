const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
const port = 3000;

let counter = 0;
let randomString = "";
let activeConnections = 0;
let intervalId = null;

app.get("/data", (req, res) => {
  res.json({ counter, randomString });
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function updateData() {
  counter++;
  randomString = generateRandomString(10);
  const data = JSON.stringify({ counter, randomString });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws) => {
  activeConnections++;
  console.log(`New client connected. Active connections: ${activeConnections}`);

  if (activeConnections === 1) {
    // Start the interval when the first connection is established
    intervalId = setInterval(updateData, 2000); // Update every 2 seconds
  }

  ws.on("close", () => {
    activeConnections--;
    console.log(
      `Client disconnected. Active connections: ${activeConnections}`
    );

    if (activeConnections === 0) {
      // Stop the interval when no connections are active
      clearInterval(intervalId);
      intervalId = null;
      counter = 0; // Reset counter when all connections are closed
    }
  });
});
