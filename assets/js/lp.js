(function () {
  // ---------------------------------------------------------------------
  // CONFIGURAÇÃO — endereço que recebe os pedidos de orçamento
  // (o link do "App da Web" da planilha do Google que guarda os pedidos).
  // Enquanto estiver vazio, o pedido NÃO é guardado em lugar nenhum: só aparece o aviso.
  // ---------------------------------------------------------------------
  var ENVIO_URL = 'https://script.google.com/macros/s/AKfycbxuXwSTQSP7l-v_CMx8txySmOZbxL3GRo3Xfw1ueAXDfXBwC6wS35nRop93Gj3Z2mtBzQ/exec';
  var EMAIL = 'comercial@frutvibes.com';

  var CHAVE = 'fv_maior_idade';
  var raiz = document.documentElement;

  // Entrada do site: confirmação de maioridade
  var portao = document.getElementById('idade');
  var confirmado = false;
  try { confirmado = localStorage.getItem(CHAVE) === '1'; } catch (e) {}
  if (portao && !confirmado) {
    portao.hidden = false;
    raiz.classList.add('trava');
    var sim = portao.querySelector('[data-idade="sim"]');
    if (sim) sim.focus();
    portao.addEventListener('click', function (ev) {
      var botao = ev.target.closest('[data-idade]');
      if (!botao) return;
      if (botao.getAttribute('data-idade') === 'sim') {
        try { localStorage.setItem(CHAVE, '1'); } catch (e) {}
        portao.hidden = true;
        raiz.classList.remove('trava');
      } else {
        portao.querySelector('.idade__acoes').hidden = true;
        portao.querySelector('.idade__nao').hidden = false;
      }
    });
  }

  // Topo sólido depois que a página rola
  var topo = document.querySelector('.topo');
  var atualizaTopo = function () { if (topo) topo.classList.toggle('solido', window.scrollY > 40); };
  atualizaTopo();
  window.addEventListener('scroll', atualizaTopo, { passive: true });

  // Botão fixo do celular some no topo da página e quando o formulário está na tela
  var barra = document.querySelector('.barra-cta');
  var hero = document.querySelector('.hero');
  var orcamento = document.getElementById('orcamento');
  if (barra && 'IntersectionObserver' in window) {
    var visiveis = { hero: true, orcamento: false };
    var atualizaBarra = function () { barra.classList.toggle('oculta', visiveis.hero || visiveis.orcamento); };
    new IntersectionObserver(function (itens) {
      itens.forEach(function (i) { visiveis[i.target === hero ? 'hero' : 'orcamento'] = i.isIntersecting; });
      atualizaBarra();
    }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(function (itens) {
      itens.forEach(function (i) { visiveis.orcamento = i.isIntersecting; });
      atualizaBarra();
    }, { threshold: 0.1 }).observe(orcamento);
    atualizaBarra();
  }

  // Animações de entrada (padrão do editor visual): data-lp-anim aparece ao entrar na tela,
  // com data-lp-anim-duracao / data-lp-anim-atraso opcionais (segundos)
  var blocos = document.querySelectorAll('[data-lp-anim]');
  blocos.forEach(function (b) {
    var d = parseFloat(b.getAttribute('data-lp-anim-duracao')), a = parseFloat(b.getAttribute('data-lp-anim-atraso'));
    if (d) b.style.transitionDuration = d + 's';
    if (a) b.style.transitionDelay = a + 's';
  });
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (item.isIntersecting) { item.target.classList.add('lp-visivel'); obs.unobserve(item.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    blocos.forEach(function (b) { obs.observe(b); });
  } else {
    blocos.forEach(function (b) { b.classList.add('lp-visivel'); });
  }

  // Sabores em órbita 3D ao redor da logo.
  // Movimento contínuo que desacelera quando um sabor chega na frente (e nunca para de vez),
  // profundidade com tamanho, desfoque e cor; arrastar com inércia; setas, pontos e clique no copo.
  var orbita = document.querySelector('[data-orbita]');
  if (orbita) {
    var palco = orbita.querySelector('.orbita__palco');
    var logo = orbita.querySelector('.orbita__logo');
    var foco = orbita.querySelector('.orbita__foco');
    var nome = orbita.querySelector('.orbita__nome');
    var pontosBox = orbita.querySelector('.orbita__pontos');
    var itens = Array.prototype.slice.call(orbita.querySelectorAll('.sabores li'));
    var cores = itens.map(function (li) { return li.style.getPropertyValue('--c').trim(); });
    var titulos = itens.map(function (li) { return li.querySelector('h3').textContent; });
    var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TEMPO = 3.4;     // segundos, em média, para cada sabor passar pela frente
    var LENTO = 0.06;    // quanto desacelera na frente (0 = para, 1 = velocidade constante)
    var VMAX = 1 / (TEMPO * Math.sqrt(LENTO)); // passos por segundo no meio do caminho
    var passo = 2 * Math.PI / itens.length;
    var DOIS_PI = 2 * Math.PI;
    var rot = 0, vel = 0, anim = null, inercia = false, frente = -1;
    var rx = 0, ry = 0, h = 0, estreito = false, sobre = false, naTela = false, laco = 0, ultimo = 0, arraste = null;

    orbita.classList.add('ativa');

    var trazer;
    var pontos = titulos.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'orbita__ponto';
      b.style.setProperty('--c', cores[i]);
      b.setAttribute('aria-label', 'Ver ' + t);
      b.addEventListener('click', function () { trazer(i); });
      pontosBox.appendChild(b);
      return b;
    });

    var medir = function () {
      var w = palco.clientWidth;
      var lh = logo.offsetWidth * 263 / 1000;
      h = itens[0].offsetHeight;
      estreito = w < 600;
      rx = Math.min(w * (estreito ? 0.38 : 0.46), 540);
      // órbita achatada (perspectiva de quem vê o anel quase de lado), copos centralizados na linha.
      // A logo fica de pé no centro do anel: o sabor da frente passa na frente dela
      // (a boca do copo logo abaixo da logo, o splash por cima das letras) e os de trás passam por trás.
      var meio = h * 1.05 / 2;
      ry = rx * (estreito ? 0.2 : 0.16);
      var logoY = Math.min(0, ry - 0.4 * meio + 4 - lh / 2);
      var topo = Math.min(logoY - lh / 2, -ry - 0.22 * h, ry - meio - 12);
      var cy = -topo + 10;
      palco.style.height = Math.round(cy + ry + meio + 26) + 'px';
      palco.style.setProperty('--cy', cy + 'px');
      palco.style.setProperty('--rx', rx + 'px');
      palco.style.setProperty('--ry', ry + 'px');
      palco.style.setProperty('--logo-y', (cy + logoY) + 'px');
      palco.style.setProperty('--foco-y', (cy + ry + meio * 0.92) + 'px');
      palco.style.setProperty('--cy-brilho', (cy + logoY) + 'px');
    };

    var suaveF = function (x) { return x * x * (3 - 2 * x); };
    var desenhar = function (agora) {
      var melhor = -2, indice = 0, fMax = 0;
      var bob = calmo ? 0 : Math.sin((agora || 0) / 650);
      itens.forEach(function (li, i) {
        var a = rot + i * passo;
        var z = Math.cos(a);
        var t = (z + 1) / 2;                                   // 0 atrás, 1 na frente
        var d = Math.abs(Math.atan2(Math.sin(a), z));          // distância angular da frente
        var f = suaveF(Math.max(0, 1 - d / (passo * 0.85)));   // destaque: só o da frente
        var s = 0.36 + 0.26 * t + 0.43 * f;
        var x = Math.sin(a) * rx;
        var y = z * ry - f * (4 + bob * 5);
        var giro = f * bob * 2.5;
        li.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + giro.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        li.style.zIndex = Math.round(100 + z * 80 + f * 15) + (z > 0 ? 1 : -1);
        var desfoque = (1 - f) * (1 + 3.2 * (1 - t));
        li.style.filter = 'blur(' + desfoque.toFixed(2) + 'px) brightness(' + (0.38 + 0.32 * t + 0.3 * f).toFixed(2) + ') saturate(' + (0.55 + 0.45 * f).toFixed(2) + ')';
        li.style.opacity = (0.5 + 0.5 * Math.max(t * 0.8, f)).toFixed(2);
        if (z > melhor) { melhor = z; indice = i; }
        if (f > fMax) fMax = f;
      });
      foco.style.opacity = fMax.toFixed(2);
      foco.style.transform = 'translate(-50%, -50%) scale(' + (0.6 + 0.4 * fMax).toFixed(3) + ')';
      if (indice !== frente) {
        if (frente >= 0) pontos[frente].removeAttribute('aria-current');
        frente = indice;
        pontos[indice].setAttribute('aria-current', 'true');
        orbita.style.setProperty('--c-ativa', cores[indice]);
        nome.textContent = titulos[indice];
        if (!calmo && nome.animate) nome.animate([{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    };

    var suave = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
    var encaixe = function (r) { return Math.round(r / passo) * passo; };
    var irPara = function (r) {
      var dist = Math.abs(r - rot) / passo;
      anim = { de: rot, para: r, t0: performance.now(), dur: calmo ? 0 : 650 + 350 * Math.min(dist, 2.5) };
      vel = 0;
      ligar();
    };
    var passar = function (dir) { irPara((anim ? anim.para : encaixe(rot)) - dir * passo); };
    trazer = function (i) {
      var d = (-i * passo - rot) % DOIS_PI;
      if (d > Math.PI) d -= DOIS_PI;
      if (d < -Math.PI) d += DOIS_PI;
      irPara(rot + d);
    };

    var quadro = function (agora) {
      var dt = Math.min(0.05, ((agora - (ultimo || agora)) / 1000));
      ultimo = agora;
      if (arraste) {
        // a posição vem do ponteiro
      } else if (anim) {
        var p = anim.dur ? Math.min(1, (agora - anim.t0) / anim.dur) : 1;
        rot = anim.de + (anim.para - anim.de) * suave(p);
        if (p >= 1) anim = null;
      } else if (calmo) {
        vel = 0;
      } else if (sobre) {
        // mouse em cima: desliza até o sabor mais próximo e espera
        vel = 0;
        rot += (encaixe(rot) - rot) * Math.min(1, dt * 4);
      } else {
        var u = ((rot / passo) % 1 + 1) % 1;
        var sn = Math.sin(Math.PI * u);
        var alvo = -passo * VMAX * (LENTO + (1 - LENTO) * sn * sn);
        vel += (alvo - vel) * Math.min(1, dt * (inercia ? 1.6 : 7));
        if (inercia && Math.abs(alvo - vel) < passo * 0.05) inercia = false;
        rot += vel * dt;
      }
      desenhar(agora);
      laco = naTela && !document.hidden ? requestAnimationFrame(quadro) : 0;
    };
    var ligar = function () { if (!laco && naTela && !document.hidden) { ultimo = 0; laco = requestAnimationFrame(quadro); } };

    orbita.querySelectorAll('[data-passo]').forEach(function (b) {
      b.addEventListener('click', function () { passar(+b.getAttribute('data-passo')); });
    });

    palco.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') sobre = true; });
    palco.addEventListener('pointerleave', function () { sobre = false; });
    palco.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      arraste = { x: e.clientX, rot: rot, ultX: e.clientX, ultT: performance.now(), v: 0, mexeu: false, alvo: e.target.closest('.sabores li') };
      anim = null;
    });
    palco.addEventListener('pointermove', function (e) {
      if (!arraste) return;
      var dx = e.clientX - arraste.x;
      if (!arraste.mexeu && Math.abs(dx) > 6) {
        arraste.mexeu = true;
        palco.classList.add('arrastando');
        try { palco.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (!arraste.mexeu) return;
      var agora = performance.now();
      var dtm = Math.max(1, agora - arraste.ultT) / 1000;
      var vInst = (e.clientX - arraste.ultX) / rx / dtm;
      arraste.v = arraste.v * 0.6 + vInst * 0.4;
      arraste.ultX = e.clientX; arraste.ultT = agora;
      rot = arraste.rot + dx / rx;
      if (!laco) desenhar(agora);
    });
    var soltar = function () {
      if (!arraste) return;
      if (arraste.mexeu) {
        var parado = performance.now() - arraste.ultT > 120;
        vel = parado ? 0 : Math.max(-6, Math.min(6, arraste.v));
        inercia = true;
        if (calmo) irPara(encaixe(rot));
      } else if (arraste.alvo) {
        trazer(itens.indexOf(arraste.alvo));
      }
      arraste = null;
      palco.classList.remove('arrastando');
    };
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', soltar);

    var ajustar = function () { medir(); desenhar(performance.now()); };
    window.addEventListener('resize', ajustar);
    ajustar();
    if (!logo.complete) logo.addEventListener('load', ajustar, { once: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { naTela = e[0].isIntersecting; ligar(); }, { threshold: 0.1 }).observe(orbita);
    } else { naTela = true; ligar(); }
    document.addEventListener('visibilitychange', ligar);
  }

  // Efeito gaseificado: bolhinhas subindo atrás do conteúdo de cada seção (bem discreto).
  // A camada .gas já vem no HTML, dentro do fundo de cada seção; aqui só nascem as bolhinhas.
  // Com "reduzir movimento" ligado no sistema elas continuam aparecendo, só que paradas (ver --y no CSS).
  {
    var camadasGas = document.querySelectorAll('.gas');
    var obsGas = 'IntersectionObserver' in window ? new IntersectionObserver(function (itens) {
      itens.forEach(function (i) { i.target.classList.toggle('gas--parado', !i.isIntersecting); });
    }) : null;
    var acaso = function (min, max) { return min + Math.random() * (max - min); };
    camadasGas.forEach(function (camada) {
      var secao = camada.closest('section, footer') || camada.parentNode;
      var largura = secao.clientWidth || window.innerWidth;
      var total = Math.max(9, Math.min(30, Math.round(largura / 60)));
      for (var k = 0; k < total; k++) {
        var b = document.createElement('i');
        var tam = Math.random() < 0.75 ? acaso(4, 9) : acaso(10, 18);   // maioria pequenas, algumas maiores
        var dur = acaso(11, 22);
        b.style.cssText = '--x:' + acaso(1, 99).toFixed(1) + '%;--t:' + tam.toFixed(1) + 'px;--d:' + dur.toFixed(1) + 's;--atraso:' + (-acaso(0, dur)).toFixed(1) + 's;--o:' + acaso(0.45, 0.9).toFixed(2) + ';--b:' + acaso(4, 12).toFixed(1) + 'px;--db:' + acaso(2.2, 4.2).toFixed(1) + 's;--y:' + acaso(3, 92).toFixed(1) + '%';
        b.appendChild(document.createElement('b'));   // o brilho da bolha (balança de lado enquanto o <i> sobe)
        camada.appendChild(b);
      }
      var mede = function () { camada.style.setProperty('--sobe', (secao.offsetHeight + 40) + 'px'); };
      mede();
      if ('ResizeObserver' in window) new ResizeObserver(mede).observe(secao);
      if (obsGas) obsGas.observe(secao);
    });
  }

  // Fotos das festas: faixa que passa devagar, em loop sem emenda.
  // As fotos do HTML são a série original (com nome, editáveis); aqui só nascem cópias sem nome, quantas forem
  // precisas para cobrir a tela, e o trilho anda exatamente uma série por volta. Velocidade em px por segundo.
  var fila = document.querySelector('.polaroids__fila');
  var trilho = fila && fila.querySelector('.polaroids__trilho');
  var calmoFotos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (trilho && !calmoFotos) {
    var VELOCIDADE = 28;
    var originais = Array.prototype.slice.call(trilho.children);
    var montarFotos = function () {
      trilho.querySelectorAll('.polaroid--copia').forEach(function (c) { c.remove(); });
      fila.classList.add('rolando');
      var serie = originais.reduce(function (soma, f) { var cs = getComputedStyle(f); return soma + parseFloat(cs.width) + parseFloat(cs.marginRight); }, 0);
      if (!serie) return;
      var copias = Math.ceil(fila.clientWidth / serie) + 1;
      for (var n = 0; n < copias; n++) originais.forEach(function (f) {
        var c = f.cloneNode(true);
        c.classList.add('polaroid--copia');
        c.removeAttribute('data-lp-id');
        c.querySelectorAll('[data-lp-id]').forEach(function (d) { d.removeAttribute('data-lp-id'); });
        c.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; });
        trilho.appendChild(c);
      });
      trilho.style.setProperty('--volta', serie + 'px');
      trilho.style.setProperty('--tempo', (serie / VELOCIDADE).toFixed(1) + 's');
    };
    var esperaFotos, larguraFotos = window.innerWidth;
    montarFotos();
    // só remonta quando a largura muda (no celular a barra do navegador muda a altura ao rolar)
    window.addEventListener('resize', function () {
      if (window.innerWidth === larguraFotos) return;
      larguraFotos = window.innerWidth;
      clearTimeout(esperaFotos); esperaFotos = setTimeout(montarFotos, 200);
    });
  }

  // Rodapé: contato
  var contato = document.querySelector('[data-contato]');
  if (contato && EMAIL) contato.innerHTML = '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>';

  // Data mínima = hoje
  var campoData = document.getElementById('f-data');
  if (campoData) {
    var hoje = new Date();
    hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    campoData.min = hoje.toISOString().slice(0, 10);
  }

  // Formulário de orçamento -> guarda o pedido na planilha e avisa que a equipe vai chamar no WhatsApp
  var form = document.getElementById('form-orcamento');
  if (!form) return;
  var erro = form.querySelector('.form__erro');
  var campoWhats = document.getElementById('f-whats');
  var aviso = document.getElementById('aviso-enviado');
  var MSG_CAMPOS = erro.textContent;
  var MSG_FALHA = 'Não conseguimos enviar agora. Confira sua internet e tente de novo.';

  // WhatsApp: só números com DDD (10 ou 11 dígitos), mostrado como (31) 99999-9999
  var numeroWhats = function () {
    var n = campoWhats.value.replace(/\D/g, '');
    if (n.length > 11 && n.indexOf('55') === 0) n = n.slice(2);
    return n.slice(0, 11);
  };
  var formataWhats = function (n) {
    if (n.length < 3) return n ? '(' + n : '';
    var meio = n.length > 10 ? 7 : 6;
    return '(' + n.slice(0, 2) + ') ' + n.slice(2, meio) + (n.length > meio ? '-' + n.slice(meio) : '');
  };
  var confereWhats = function () {
    campoWhats.setCustomValidity(/^[1-9]{2}(9\d{8}|[2-9]\d{7})$/.test(numeroWhats()) ? '' : 'Informe o WhatsApp com DDD');
  };
  campoWhats.addEventListener('input', function () {
    if (campoWhats.selectionStart === campoWhats.value.length) campoWhats.value = formataWhats(numeroWhats());
    confereWhats();
  });
  campoWhats.addEventListener('blur', function () { campoWhats.value = formataWhats(numeroWhats()); confereWhats(); });
  confereWhats();

  // Aviso de pedido recebido
  var focoAntes;
  var fechaAviso = function () {
    aviso.hidden = true;
    raiz.classList.remove('trava');
    if (focoAntes) focoAntes.focus();
  };
  var mostraAviso = function (numero) {
    var alvo = aviso.querySelector('[data-aviso-whats]');
    if (alvo) alvo.textContent = numero;
    focoAntes = document.activeElement;
    aviso.hidden = false;
    raiz.classList.add('trava');
    aviso.querySelector('[data-aviso-fechar]').focus();
  };
  aviso.addEventListener('click', function (ev) {
    if (ev.target === aviso || ev.target.closest('[data-aviso-fechar]')) fechaAviso();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !aviso.hidden) fechaAviso();
  });

  var enviando = false;
  var botaoEnviar = form.querySelector('[type="submit"]');
  var marcaEnviando = function (sim) {
    enviando = sim;
    form.classList.toggle('enviando', sim);
    botaoEnviar.setAttribute('aria-busy', sim ? 'true' : 'false');
    var aviso = botaoEnviar.querySelector('.btn__enviando');
    if (aviso) aviso.remove();
    if (sim) {
      aviso = document.createElement('span');
      aviso.className = 'btn__enviando';
      aviso.innerHTML = 'Enviando<i>.</i><i>.</i><i>.</i>';
      botaoEnviar.appendChild(aviso);
    }
  };
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (enviando) return;
    confereWhats();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (c) {
      var valido = c.value.trim() !== '' && c.checkValidity();
      c.closest('.campo').classList.toggle('erro', !valido);
      if (!valido && ok) { ok = false; c.focus(); }
    });
    erro.textContent = MSG_CAMPOS;
    erro.hidden = ok;
    if (!ok) return;

    var v = function (n) { return form.elements[n].value.trim(); };
    var whats = numeroWhats();
    var data = v('data').split('-').reverse().join('/');
    var sabores = Array.prototype.slice.call(form.querySelectorAll('[name="sabores"]:checked')).map(function (c) { return c.value; });
    var saudacao = 'Olá, ' + v('nome').split(' ')[0] + '! Aqui é da FrutVibes. Recebemos seu pedido de orçamento para ' +
      v('tipo').toLowerCase() + ' em ' + v('cidade') + ' no dia ' + data + '.';
    var dados = new URLSearchParams({
      nome: v('nome'),
      whatsapp: formataWhats(whats),
      cidade: v('cidade'),
      data: data,
      tipo: v('tipo'),
      convidados: v('convidados'),
      sabores: sabores.length ? sabores.join(', ') : 'quer ajuda para escolher',
      chamar: 'https://wa.me/55' + whats + '?text=' + encodeURIComponent(saudacao),
      origem: window.location.search.slice(1)
    });

    marcaEnviando(true);
    var envio = ENVIO_URL
      ? fetch(ENVIO_URL, { method: 'POST', mode: 'no-cors', body: dados })
      : Promise.resolve(console.warn('FrutVibes: ENVIO_URL vazio, o pedido não foi guardado.', Object.fromEntries(dados)));
    envio.then(function () {
      form.reset();
      confereWhats();
      mostraAviso(formataWhats(whats));
    }, function () {
      erro.textContent = MSG_FALHA;
      erro.hidden = false;
    }).then(function () {
      marcaEnviando(false);
    });
  });

  form.addEventListener('input', function (ev) {
    var campo = ev.target.closest('.campo');
    if (campo && campo.classList.contains('erro') && ev.target.checkValidity() && ev.target.value.trim() !== '') campo.classList.remove('erro');
  });
})();
