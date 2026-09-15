(function () {
  var CHAVE = 'fv_maior_idade';
  var raiz = document.documentElement;

  // Confirmação de maioridade (o conteúdo continua no HTML para os buscadores)
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

  // Menu mobile
  var botaoMenu = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', function () {
      var aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
      botaoMenu.setAttribute('aria-expanded', String(!aberto));
      menu.classList.toggle('aberto', !aberto);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.classList.contains('aberto')) {
        botaoMenu.setAttribute('aria-expanded', 'false');
        menu.classList.remove('aberto');
        botaoMenu.focus();
      }
    });
  }
})();
