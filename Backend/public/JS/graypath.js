/* ID's */
  const params = new URLSearchParams(window.location.search);
  const discordId = params.get("id");

  console.log("ID logado:", discordId);

  /* Mapa de destinos por ID */
  const DESTINOS = {
  "914172777802653726": "spiralum.html",
  "604660661661728798": "Teste2.html",
  "987654321098765432": "void.html"
  };

  function getDestinoById(id){
  return DESTINOS[id] || null;
  }

/* Funções auxiliares para normalização */
    function normalizeText(s){
      try{
        return s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[\u0300-\u036f]/g,'');
      }catch(e){
        // fallback se o ambiente não suportar a propriedade Unicode em regex
        return s.trim().toLowerCase();
      }
    }

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
    location.reload();
    }
  });

    const expected = normalizeText('sob o juramento do todo sombrio');

    const pwInput = document.getElementById('pw');
    const panel = document.getElementById('panel');
    const next = document.getElementById('next');
    const form = document.getElementById('pwform');

    function checkPassword(){
      const v = normalizeText(pwInput.value || '');
      if(v === expected){
        showNext();
      }else{
        triggerFail();
      }
    }

    form.addEventListener('submit',(e)=>{ e.preventDefault(); checkPassword(); });

    // garantir suporte a Enter em mobile e desktop
    pwInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.keyCode === 13){ e.preventDefault(); checkPassword(); } });


  function showNext(){
  const destino = getDestinoById(discordId);

  if(!destino){
    document.body.innerHTML = "ACCESS DENIED";
    return;
  }

  const fadeDuration = 4500; // 4.5s
  panel.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
  panel.style.opacity = 0;
  panel.style.transform = 'translateY(-20px)';

  setTimeout(()=>{
  panel.style.display = 'none';

  const final = document.createElement('div');
  final.id = 'finalMessage';
  Object.assign(final.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    pointerEvents: 'none',
    fontFamily: 'inherit',
    color: '#bfbfbf',
    fontSize: '34px',
    textAlign: 'center',
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(1px)'
  });

    final.textContent = 'Relembre, me liberte';
    document.body.appendChild(final);

    setTimeout(()=>{
      window.location.href = destino;
    }, 2000);

  }, fadeDuration);
}

    function triggerFail(){
      // overlay agora usa imagem externa
      const overlay = document.createElement('div');overlay.className='fail-overlay';
      overlay.innerHTML = `\n        <img src="../img/corpse.png" alt="rosto vermelho" style="width:70vh;max-width:800px;opacity:0.95;filter:contrast(1.4) saturate(1.6) drop-shadow(0 12px 40px rgba(120,0,0,0.6));"/>\n      `;
      document.body.appendChild(overlay);

      // tornar tudo intensamente vermelho
      const prevBg = document.body.style.background;
      document.documentElement.style.background = '#300000';
      document.body.style.transition='filter .2s ease, background .15s ease';
      document.body.style.filter='grayscale(0) contrast(1.4) saturate(1.6)';

      // tocar arquivo de áudio externo
      try{
        const audio = new Audio('../audio/BLINK.mp3');
        audio.volume = 1.0;
        audio.play().catch(()=>{});
      }catch(e){console.warn('Audio failed',e)}

      // Após 1s, redirecionar para um site inexistente chamado "relembre" (gera 404)
      setTimeout(()=>{
        window.location.href = 'https://relembre.invalid';
      },1000);
    }

    /* ********** fundo com ruído ********** */
    const noiseCanvas = document.querySelector('canvas.bgNoise');
    const pCanvas = document.querySelector('canvas.particles');
    const nctx = noiseCanvas.getContext('2d');
    const pct = pCanvas.getContext('2d');

    function resize(){
      // trabalhar em CSS pixels — imageData usa largura/altura em CSS pixels
      const w = innerWidth;
      const h = innerHeight;
      noiseCanvas.width = w * devicePixelRatio;
      noiseCanvas.height = h * devicePixelRatio;
      noiseCanvas.style.width = w + 'px';
      noiseCanvas.style.height = h + 'px';
      pCanvas.width = w * devicePixelRatio;
      pCanvas.height = h * devicePixelRatio;
      pCanvas.style.width = w + 'px';
      pCanvas.style.height = h + 'px';
      nctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
      pct.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    }
    addEventListener('resize', ()=>{resize();});
    resize();

    // desenhar ruído sutil em movimento
    let noiseOffset = 0;
    function drawNoise(){
      const w = innerWidth;
      const h = innerHeight;
      // criar imageData no tamanho CSS (não em device pixels) para evitar uso excessivo de memória
      const imgData = nctx.createImageData(w, h);
      const data = imgData.data;
      for(let i=0;i<w*h;i++){
        const v = (Math.random()*40 - 10) | 0; // ruído sutil
        const base = 20 + v + Math.sin((i+noiseOffset)/1000)*8;
        const idx = i*4;
        data[idx] = base; data[idx+1] = base; data[idx+2] = base; data[idx+3] = 18; // muito transparente
      }
      // desenhar imageData escalado automaticamente pelo transform aplicado
      nctx.putImageData(imgData,0,0);
      noiseOffset += 1;
    }

    /* Partículas */
    const particles = [];
    function initParticles(){
      particles.length = 0;
      for(let i=0;i<180;i++){
        particles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight, r:Math.random()*1.8+0.6, s:Math.random()*0.6+0.15});
      }
    }
    initParticles();

    function updateParticles(){
      pct.clearRect(0,0,innerWidth,innerHeight);
      pct.globalAlpha = 0.95;
      for(const p of particles){
        p.y += p.s; p.x += Math.sin(p.y*0.01 + p.x*0.01)*0.25;
        if(p.y > innerHeight + 20){ p.y = -10; p.x = Math.random()*innerWidth }
        pct.beginPath(); pct.arc(p.x, p.y, p.r, 0, Math.PI*2); pct.fillStyle = 'rgba(240,240,240,0.12)'; pct.fill();
      }
    }

    /* Loop de animação */
    let raf;
    function tick(){
      drawNoise();
      updateParticles();
      raf = requestAnimationFrame(tick);
    }
    tick();

    // fallback de performance caso a aba fique oculta
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){ cancelAnimationFrame(raf); } else { tick(); }
    });

    pwInput.placeholder = '// ??? //';