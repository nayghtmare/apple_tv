// Utilidades seletoras
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

const upNextBtn = $("#upNextBtn");
const playerSelector = $("#playerSelector");
const ytContainer = $("#ytContainer");
const vimeoContainer = $("#vimeoContainer");
const hlsVideo = $("#hlsVideo");
const ytFrame = $("#ytFrame");
const vimeoFrame = $("#vimeoFrame");

// IDs/URLs editáveis
const YT_ID = "1Vnghdsjmd0";          // Midsommar | Official Trailer HD | A24
const VIMEO_ID = "362969402";          // Exemplo - substitua por um ID válido do trailer
const HLS_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // Exemplo

let currentSrc = "youtube";
let playing = false;

const playBtn = $("#playBtn");

playBtn.addEventListener("click", async () => {
  try {
    if (!playing) {
      startPlayer(currentSrc);
      playing = true;
      playBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pausar';
    } else {
      pauseAll();
      playing = false;
      playBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Reproduzir';
    }
  } catch (e) {
    console.warn(e);
  }
});

function startPlayer(src) {
  hideAll();
  if (src === "youtube") {
    ytContainer.style.display = "block";
    ytFrame.src = `https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0`;
  } else if (src === "vimeo") {
    vimeoContainer.style.display = "block";
    vimeoFrame.src = `https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1`;
  } else if (src === "hls") {
    hlsVideo.style.display = "block";
    ensureHls(HLS_URL);
    hlsVideo.play().catch(() => {});
  }
}

function pauseAll() {
  // YouTube & Vimeo: reset src para pausar
  ytFrame.src = "";
  vimeoFrame.src = "";
  if (window.hls) {
    window.hls.stopLoad?.();
  }
  hlsVideo.pause();
}

function hideAll() {
  ytContainer.style.display = "none";
  vimeoContainer.style.display = "none";
  hlsVideo.style.display = "none";
}

function ensureHls(url) {
  if (hlsVideo.canPlayType("application/vnd.apple.mpegurl")) {
    hlsVideo.src = url;
    return;
  }
  if (!window.Hls) {
    console.warn("hls.js não carregado (veja import no index.html)");
    return;
  }
  if (window.hls) {
    window.hls.destroy();
  }
  window.hls = new Hls();
  window.hls.loadSource(url);
  window.hls.attachMedia(hlsVideo);
}

// Troca de fonte
$$("#playerSelector button").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$("#playerSelector button").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    currentSrc = btn.dataset.src;
    if (playing) startPlayer(currentSrc);
  });
});

// Compartilhar (Web Share API)
$("#shareBtn").addEventListener("click", async () => {
  const data = { title: "Midsommar (2019)", text: "Confira trailer e informações.", url: location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(data.url);
      alert("Link copiado para a área de transferência!");
    }
  } catch (e) {
    console.warn(e);
  }
});

// Up Next
upNextBtn.addEventListener("click", () => {
  const pressed = upNextBtn.getAttribute("aria-pressed") === "true";
  upNextBtn.setAttribute("aria-pressed", String(!pressed));
  upNextBtn.innerHTML = pressed
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg> Adicionar à Fila'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z"/></svg> Adicionado';
});

// Elenco / Equipe (dados)
const elenco = [
  { nome: "Florence Pugh", papel: "Dani", foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Jack Reynor", papel: "Christian", foto: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Vilhelm Blomgren", papel: "Pelle", foto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "William Jackson Harper", papel: "Josh", foto: "https://images.unsplash.com/photo-1549388604-817d15aa0110?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Will Poulter", papel: "Mark", foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Ari Aster", papel: "Direção", crew: true, foto: "https://images.unsplash.com/photo-1545996124-0501ebae84d5?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Patrick Andersson", papel: "Produção", crew: true, foto: "https://images.unsplash.com/photo-1531123414780-f742024376ef?q=80&w=400&h=400&auto=format&fit=crop" },
  { nome: "Pawel Pogorzelski", papel: "Fotografia", crew: true, foto: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&h=400&auto=format&fit=crop" }
];

function renderPessoas(tipo = "cast") {
  const grid = $("#castGrid");
  grid.innerHTML = "";
  const items = elenco.filter((p) => (tipo === "cast" ? !p.crew : !!p.crew));
  for (const p of items) {
    const el = document.createElement("div");
    el.className = "person";
    el.setAttribute("role", "listitem");
    el.innerHTML = `
      <div class="avatar"><img alt="${p.nome}" src="${p.foto}"/></div>
      <div>
        <h4>${p.nome}</h4>
        <p>${p.papel}</p>
      </div>
    `;
    grid.appendChild(el);
  }
}
renderPessoas("cast");

// Toggle elenco/equipe
$$(".segmented button").forEach((btn) => {
  if (btn.dataset.filter) {
    btn.addEventListener("click", () => {
      $$(".segmented button").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      renderPessoas(btn.dataset.filter);
    });
  }
});

// Autoplay quando visível
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !playing) {
        startPlayer(currentSrc);
        playing = true;
        playBtn.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pausar';
      }
    }
  },
  { threshold: 0.6 }
);
io.observe($(".hero"));
