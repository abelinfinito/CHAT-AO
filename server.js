// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Usa a variável de ambiente definida na Render
const apiKey = process.env.OPENAI_API_KEY;

app.post("/api/perguntar", async (req, res) => {
  const { mensagens } = req.body;

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: mensagens
      })
    });

    const dados = await resposta.json();
    res.json(dados);
  } catch (erro) {
    console.error("Erro ao contactar a OpenAI:", erro);
    res.status(500).json({ erro: "Erro interno ao processar a requisição." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor no ar na porta ${PORT}`));
