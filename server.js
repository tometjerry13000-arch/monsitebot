const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "web")));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const BASE_URL = process.env.BASE_URL;

let userCommands = {};

function sendTelegramMessage(text, keyboard) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    }),
  });
}

app.post("/visit", async (req, res) => {
  const { visitorId, page } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🏠 Accueil", callback_data: `index_${visitorId}` },
        { text: "ℹ️ Info", callback_data: `info_${visitorId}` },
        { text: "📞 Contact", callback_data: `contact_${visitorId}` },
        { text: "👀 Visite", callback_data: `visite_${visitorId}` }
      ],
    ],
  };

  const message = `👤 <b>Nouveau visiteur</b>\n🆔 ID: ${visitorId}\n🌍 IP: ${ip}\n📄 Page: ${page}`;
  await sendTelegramMessage(message, keyboard);

  res.json({ success: true });
});

app.get("/get-command", (req, res) => {
  const { visitorId } = req.query;
  const command = userCommands[visitorId];
  if (command) delete userCommands[visitorId];
  res.json({ command });
});

app.post("/webhook", async (req, res) => {
  const cb = req.body.callback_query;
  if (!cb) return res.sendStatus(200);
  const [page, visitorId] = cb.data.split("_");
  userCommands[visitorId] = page;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: cb.id, text: `➡️ ${page}` }),
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur actif sur le port ${PORT}`));
