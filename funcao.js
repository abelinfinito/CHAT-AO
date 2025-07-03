let conversas = JSON.parse(localStorage.getItem("conversas")) || [{ nome: "Conversa 1", mensagens: [] }];
let conversaAtual = JSON.parse(localStorage.getItem("conversaAtual")) || 0;

function salvarConversas() {
  localStorage.setItem("conversas", JSON.stringify(conversas));
  localStorage.setItem("conversaAtual", JSON.stringify(conversaAtual));
}

function novaConversa() {
  conversas.push({ nome: `Nova conversa`, mensagens: [] });
  conversaAtual = conversas.length - 1;
  document.getElementById("mensagens").innerHTML = "";
  salvarConversas();
  atualizarListaConversas();
}

function renomearConversa(index) {
  let novoNome = prompt("Digite o novo nome da conversa:");
  if (novoNome) {
    conversas[index].nome = novoNome;
    salvarConversas();
    atualizarListaConversas();
  }
}

function excluirConversa(index) {
  if (confirm(`Deseja excluir "${conversas[index].nome}"?`)) {
    conversas.splice(index, 1);
    if (conversas.length === 0) novaConversa();
    conversaAtual = Math.max(conversaAtual - 1, 0);
    salvarConversas();
    atualizarListaConversas();
    carregarConversa(conversaAtual);
  }
}

async function enviarMensagem() {
  const input = document.getElementById("entrada");
  const texto = input.value.trim();
  if (texto === "") return;

  input.value = "";

  const mensagens = document.getElementById("mensagens");
  mensagens.innerHTML += `<div class="mensagem user">${texto}</div>`;

  try {
    const resposta = await chamarOpenAI(texto);
    mensagens.innerHTML += `<div class="mensagem bot">${resposta}</div>`;

    conversas[conversaAtual].mensagens.push({ user: texto, bot: resposta });
    salvarConversas();
    atualizarListaConversas();
  } catch (erro) {
    mensagens.innerHTML += `<div class="mensagem bot erro">Erro ao contactar o servidor.</div>`;
    console.error("Erro ao enviar mensagem:", erro);
  }
}

async function chamarOpenAI(texto) {
  const contextoNegocio = {
    role: "system",
    content: "Tu és um assistente virtual da empresa AGT que está localizado em Angola. Responde tudo sobre esta empresa. SEU NOME É JÉSSICA."
  };

  const historico = conversas[conversaAtual].mensagens.flatMap(m => [
    { role: "user", content: m.user },
    { role: "assistant", content: m.bot }
  ]);

  const mensagens = [contextoNegocio, ...historico, { role: "user", content: texto }];

  const resposta = await fetch("https://chatbot-ao.onrender.com/api/perguntar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagens })
  });

  const dados = await resposta.json();
  return dados.choices[0].message.content;
}

function enviarImagem() {
  const inputImagem = document.getElementById("imagem-upload");
  const ficheiro = inputImagem.files[0];

  if (ficheiro) {
    const leitor = new FileReader();
    leitor.onload = function(e) {
      const mensagens = document.getElementById("mensagens");
      mensagens.innerHTML += `<div class="mensagem user"><img src="${e.target.result}" alt="Imagem enviada" style="max-width: 200px; border-radius: 8px;"></div>`;
      conversas[conversaAtual].mensagens.push({
        user: "[Imagem enviada]",
        bot: "(O envio de imagens ainda não é suportado como entrada para resposta)"
      });
      mensagens.innerHTML += `<div class="mensagem bot">(Ainda não consigo responder a imagens, o meu criador Abel Quilengue Antonio está a trabalhar nisso!)</div>`;
      salvarConversas();
      atualizarListaConversas();
    };
    leitor.readAsDataURL(ficheiro);
  }
}

function atualizarListaConversas() {
  const lista = document.getElementById("listaConversas");
  lista.innerHTML = "";
  conversas.forEach((conv, index) => {
    let item = document.createElement("li");
    item.innerHTML = `<span>${conv.nome}</span> 
      <span class="edit-btn" onclick="renomearConversa(${index})">✏️</span> 
      <span class="delete-btn" onclick="excluirConversa(${index})">🗑️</span>`;
    item.onclick = () => carregarConversa(index);
    item.className = index === conversaAtual ? "active" : "";
    lista.appendChild(item);
  });
}

function carregarConversa(index) {
  conversaAtual = index;
  const mensagens = document.getElementById("mensagens");
  mensagens.innerHTML = "";
  conversas[index].mensagens.forEach(msg => {
    mensagens.innerHTML += `<div class="mensagem user">${msg.user}</div>`;
    mensagens.innerHTML += `<div class="mensagem bot">${msg.bot}</div>`;
  });
  salvarConversas();
  atualizarListaConversas();
}

function alternarSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("mostrar");
}

// Inicialização
atualizarListaConversas();
carregarConversa(conversaAtual);
