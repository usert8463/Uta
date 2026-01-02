const express = require("express");
const axios = require("axios");
const app = express();

const messageCache = {};

app.get("/incoming", (req, res) => {
  const { user_id, text } = req.query;
  if (!user_id || !text) return res.json({ status: 400, error: "user_id ou text manquant" });

  if (!messageCache[user_id]) messageCache[user_id] = [];
  messageCache[user_id].push({
    text,
    timestamp: Date.now()
  });

  res.json({ status: 200 });
});

app.get("/response", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.json({ status: 400, error: "user_id manquant" });

  const now = Date.now();

  for (const uid in messageCache) {
    messageCache[uid] = messageCache[uid].filter(msg => now - msg.timestamp <= 5 * 60 * 1000);
    if (messageCache[uid].length === 0) delete messageCache[uid];
  }

  if (messageCache[user_id] && messageCache[user_id].length > 0) {
    const message = messageCache[user_id].pop();
    if (messageCache[user_id].length === 0) delete messageCache[user_id];
    return res.json({ text: message.text });
  } else {
    return res.json({ text: null });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "API is online" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("API online on port " + PORT);

  setInterval(() => {
    console.log("Ping! Server alive at " + new Date().toLocaleTimeString());
  }, 30000);
});
