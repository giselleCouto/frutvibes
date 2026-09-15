// Gerador do site FrutVibes (HTML estático, sem dependências).
// Uso: node build.mjs  ->  gera a pasta public/ pronta para publicar.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public');

// ---------------------------------------------------------------------------
// CONFIGURAÇÃO — preencha antes de publicar
// ---------------------------------------------------------------------------
const SITE = {
  url: 'https://www.frutvibes.com', // domínio definitivo, sem barra no final
  nome: 'FrutVibes',
  slogan: 'Drinks gaseificados',
  empresa: 'Gama Rei do Chopp', // quem produz (aparece no rodapé e nos dados estruturados)
  email: '', // ex.: contato@frutvibes.com
  whatsapp: '', // só números, com 55 + DDD. ex.: 5531999999999
  instagram: '', // usuário sem @. ex.: frutvibes
  cidade: '', // ex.: Belo Horizonte
  estado: '', // ex.: MG
  googleSiteVerification: '', // código da meta tag do Google Search Console (opcional se verificar por DNS)
};

const HOJE = new Date().toISOString().slice(0, 10);
const VERSAO = Date.now().toString(36);

const SABORES = [
  {
    slug: 'maca-verde',
    nome: 'Maçã Verde',
    base: 'Vodka + fruta',
    cor: '#3F9A2B', texto: '#FFF9E8', escuro: false,
    titulo: 'FrutVibes Maçã Verde: drink de vodka gaseificado',
    meta: 'Conheça o FrutVibes Maçã Verde: drink gaseificado à base de vodka com sabor de maçã verde, refrescante e servido gelado direto do barril.',
    resumo: 'Azedinho na medida, aromático e muito refrescante.',
    paragrafos: [
      'O FrutVibes Maçã Verde junta a base neutra da vodka ao sabor vibrante da maçã verde, com gás fino que deixa cada gole leve e refrescante.',
      'É o sabor para quem gosta de drink cítrico sem ser ácido demais: vai bem no calor, no happy hour e em qualquer festa em que a fila do bar precisa andar rápido.',
    ],
    perfil: ['Aroma fresco de maçã verde', 'Equilíbrio entre doce e azedinho', 'Gás fino e final limpo'],
    combina: 'Petiscos, frituras, frutos do mar e fim de tarde ao ar livre.',
  },
  {
    slug: 'limao',
    nome: 'Limão',
    base: 'Vodka + fruta',
    cor: '#B4D236', texto: '#10231F', escuro: true,
    titulo: 'FrutVibes Limão: drink de vodka com limão gaseificado',
    meta: 'FrutVibes Limão é o drink gaseificado de vodka com limão: cítrico, leve e refrescante, servido gelado direto do barril em bares, festas e eventos.',
    resumo: 'Cítrico, leve e daquele jeito que todo mundo gosta.',
    paragrafos: [
      'Clássico brasileiro não tem erro: o FrutVibes Limão traz a acidez e o perfume do limão com base de vodka e gás na medida certa.',
      'É o sabor coringa do barril: agrada a quase todo mundo e acompanha do churrasco à balada.',
    ],
    perfil: ['Perfume cítrico de limão', 'Acidez refrescante', 'Leve, gelado e fácil de beber'],
    combina: 'Churrasco, comida de boteco, feijoada e dias quentes.',
  },
  {
    slug: 'abacaxi',
    nome: 'Abacaxi',
    base: 'Vodka + fruta',
    cor: '#F2C31C', texto: '#10231F', escuro: true,
    titulo: 'FrutVibes Abacaxi: drink de vodka com abacaxi gaseificado',
    meta: 'FrutVibes Abacaxi: drink gaseificado à base de vodka com sabor tropical de abacaxi, docinho e refrescante, servido gelado direto do barril.',
    resumo: 'Tropical, docinho e com cara de verão.',
    paragrafos: [
      'O FrutVibes Abacaxi é puro clima de praia: o sabor doce e tropical do abacaxi encontra a vodka e ganha borbulhas que deixam tudo mais leve.',
      'Perfeito para festas ao ar livre, pool party, luau e para quem prefere um drink mais frutado.',
    ],
    perfil: ['Sabor tropical de abacaxi', 'Doçura equilibrada', 'Refrescância de verão'],
    combina: 'Churrasco, comida agridoce, petiscos salgados e festas na piscina.',
  },
  {
    slug: 'frutas-vermelhas',
    nome: 'Frutas Vermelhas',
    base: 'Vodka + fruta',
    cor: '#C4174E', texto: '#FFF9E8', escuro: false,
    titulo: 'FrutVibes Frutas Vermelhas: drink de vodka gaseificado',
    meta: 'FrutVibes Frutas Vermelhas: drink gaseificado de vodka com sabor intenso de frutas vermelhas, cor vibrante e servido gelado direto do barril.',
    resumo: 'Intenso, frutado e com a cor mais bonita da festa.',
    paragrafos: [
      'O FrutVibes Frutas Vermelhas tem sabor marcante e frutado, com a base de vodka e o gás fino que são a assinatura da marca.',
      'Chama atenção no copo e nas fotos: é o queridinho de aniversários, formaturas, casamentos e baladas.',
    ],
    perfil: ['Sabor intenso de frutas vermelhas', 'Cor vibrante no copo', 'Doce na medida, final refrescante'],
    combina: 'Doces, tábuas de frios, pizza e comemorações à noite.',
  },
  {
    slug: 'caipirinha',
    nome: 'Caipirinha',
    base: 'Caipirinha gaseificada',
    cor: '#135C4D', texto: '#FFF9E8', escuro: false,
    titulo: 'Caipirinha gaseificada em barril | FrutVibes',
    meta: 'Caipirinha FrutVibes: a caipirinha brasileira em versão gaseificada, pronta e gelada, servida direto do barril em bares, festas e eventos.',
    resumo: 'O clássico brasileiro, pronto, gelado e com gás.',
    paragrafos: [
      'A caipirinha é o drink mais brasileiro que existe, e na FrutVibes ela ganhou uma versão gaseificada, padronizada e pronta para servir direto do barril.',
      'Sem cortar limão, sem macerar e sem fila: o mesmo sabor em todo copo, do primeiro ao último convidado.',
    ],
    perfil: ['Limão em destaque', 'Doce e ácido equilibrados', 'Gás que deixa o clássico mais leve'],
    combina: 'Feijoada, churrasco, festa junina, carnaval e roda de samba.',
  },
];

const FAQ = [
  ['O que é FrutVibes?', 'FrutVibes é uma linha de drinks alcoólicos gaseificados à base de vodka com sabor de fruta, além de uma caipirinha gaseificada. Tudo é produzido e servido em barril, gelado e com gás, como um chopp.'],
  ['Quais são os sabores?', 'Maçã Verde, Limão, Abacaxi e Frutas Vermelhas, todos à base de vodka, e a Caipirinha gaseificada.'],
  ['FrutVibes é um chopp de vodka?', 'É servido do mesmo jeito que um chopp, na chopeira e direto do barril, mas é um drink: base de vodka, sabor de fruta e gaseificação na medida. Muita gente chama de "chopp de vodka" ou "chopp de drink".'],
  ['Vocês atendem festas e eventos?', 'Sim. Levamos FrutVibes em barril para bares, restaurantes, casamentos, formaturas, festas universitárias, festas juninas, shows e eventos corporativos. Fale com a gente informando a data, a cidade e o número de convidados.'],
  ['Precisa de chopeira para servir?', 'Sim, o FrutVibes em barril é servido em chopeira, como o chopp. Na hora do pedido, conte para a gente como é a estrutura do seu bar ou evento para combinarmos o serviço.'],
  ['Como servir FrutVibes do jeito certo?', 'Bem gelado, em copo limpo e direto do barril. Mantenha o barril refrigerado e longe do sol para preservar o gás e o sabor.'],
  ['Vai ter FrutVibes em lata?', 'Vai! Estamos trabalhando para levar os sabores FrutVibes para a lata. Siga a gente para saber primeiro do lançamento.'],
  ['Menores de idade podem comprar?', 'Não. FrutVibes é uma bebida alcoólica e a venda é proibida para menores de 18 anos. Beba com moderação e, se beber, não dirija.'],
];

const OCASIOES = ['Bares e restaurantes', 'Casamentos', 'Formaturas', 'Festas universitárias', 'Festas juninas', 'Shows e festivais', 'Aniversários', 'Eventos corporativos', 'Carnaval', 'Churrascos'];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE.url + p;
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...obj }).replace(/</g, '\\u003c')}</script>`;
const LOGO_W = 1000, LOGO_H = 263;

const linkWhats = (msg) => (SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}` : '/contato/');
const ctaPedido = (msg, classe = 'btn') =>
  SITE.whatsapp
    ? `<a class="${classe}" href="${linkWhats(msg)}" target="_blank" rel="noopener">Pedir pelo WhatsApp</a>`
    : `<a class="${classe}" href="/contato/">Fale com a gente</a>`;

const sameAs = [SITE.instagram && `https://www.instagram.com/${SITE.instagram}/`].filter(Boolean);

const ORGANIZACAO = {
  '@type': 'Organization',
  '@id': abs('/#organizacao'),
  name: SITE.nome,
  url: abs('/'),
  logo: abs('/assets/img/logo-preta.png'),
  image: abs('/assets/img/og-home.jpg'),
  slogan: SITE.slogan,
  description: 'Marca de drinks alcoólicos gaseificados à base de vodka e de caipirinha gaseificada, servidos em barril.',
  ...(SITE.empresa && { parentOrganization: { '@type': 'Organization', name: SITE.empresa } }),
  ...(sameAs.length && { sameAs }),
  ...(SITE.email && { email: SITE.email }),
  ...((SITE.whatsapp || SITE.email) && {
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
      ...(SITE.whatsapp && { telephone: `+${SITE.whatsapp}` }),
      ...(SITE.email && { email: SITE.email }),
    },
  }),
  ...(SITE.cidade && {
    address: { '@type': 'PostalAddress', addressLocality: SITE.cidade, addressRegion: SITE.estado, addressCountry: 'BR' },
  }),
};

const ICONES = {
  copo: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l-1.6 17.2a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8z"/><path d="M6.6 9h10.8"/></svg>',
  bolhas: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="15" r="5"/><circle cx="17" cy="7" r="3"/><circle cx="18.5" cy="16" r="1.5"/></svg>',
  barril: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10c1.6 3 1.6 15 0 18H7C5.4 18 5.4 6 7 3z"/><path d="M5.9 8.5h12.2M5.9 15.5h12.2"/></svg>',
  lata: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 3h9l1.5 2.5v13L16.5 21h-9L6 18.5v-13z"/><path d="M6 7h12M6 17h12"/></svg>',
};

const onda = (cor = 'var(--creme)') =>
  `<svg class="onda" style="color:${cor}" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46c160 40 320 44 480 18S820-6 980 18s300 60 460 28v44H0z" fill="currentColor"/></svg>`;

const bolhas = '<span class="bolhas" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';

const estiloSabor = (s) => `--c:${s.cor};--ct:${s.texto};--cf:${s.escuro ? 'rgba(16,35,31,.08)' : 'rgba(255,249,232,.12)'}`;

const imgLata = (s, { lazy = true, classe = '' } = {}) =>
  `<img class="${classe}" src="/assets/img/lata-${s.slug}.webp" width="360" height="932" alt="Lata FrutVibes ${esc(s.nome)} — ${esc(s.base.toLowerCase())}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;

const cardSabor = (s, nivel = 3) => `
      <a class="card" href="/sabores/${s.slug}/" style="${estiloSabor(s)}">
        <span class="card__img">${imgLata(s)}</span>
        <span class="card__base">${esc(s.base)}</span>
        <h${nivel} class="card__titulo">${esc(s.nome)}</h${nivel}>
        <span class="card__texto">${esc(s.resumo)}</span>
        <span class="card__link">Conhecer o sabor <span aria-hidden="true">→</span></span>
      </a>`;

function migalhas(itens) {
  const html = `<nav class="migalhas" aria-label="Você está em"><ol>${itens
    .map(([nome, url], i) => (i === itens.length - 1 ? `<li aria-current="page">${esc(nome)}</li>` : `<li><a href="${url}">${esc(nome)}</a></li>`))
    .join('')}</ol></nav>`;
  const dados = ld({
    '@type': 'BreadcrumbList',
    itemListElement: itens.map(([nome, url], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: abs(url) })),
  });
  return { html, dados };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const NAV = [
  ['/sabores/', 'Sabores'],
  ['/barril-para-eventos/', 'Barril para eventos'],
  ['/sobre/', 'Sobre'],
  ['/perguntas-frequentes/', 'Dúvidas'],
];

function layout({ caminho, titulo, descricao, og = 'og-home.jpg', ogAlt = 'Barril e latas FrutVibes nos sabores maçã verde, limão, abacaxi, frutas vermelhas e caipirinha', dados = [], corpo, preload = '', noindex = false }) {
  const url = abs(caminho);
  const navHtml = NAV.map(([href, nome]) => `<li><a href="${href}"${caminho.startsWith(href) ? ' aria-current="page"' : ''}>${nome}</a></li>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : `<meta name="robots" content="index, follow, max-image-preview:large">\n<link rel="canonical" href="${url}">`}
${SITE.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(SITE.googleSiteVerification)}">` : ''}
<meta name="theme-color" content="#0E4F45">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="FrutVibes">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs('/assets/img/' + og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/img/favicon-96.png" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/style.css?v=${VERSAO}">
${preload}
${dados.join('\n')}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="wrap topo__in">
    <a class="topo__logo" href="/" aria-label="FrutVibes — página inicial"><img src="/assets/img/logo-creme.webp" width="${LOGO_W}" height="${LOGO_H}" alt="FrutVibes"></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav id="menu" class="nav" aria-label="Menu principal">
      <ul>${navHtml}<li><a class="btn btn--sm" href="/contato/">Contato</a></li></ul>
    </nav>
  </div>
</header>
<main id="conteudo">
${corpo}
</main>
<div class="faixa-sabores" aria-hidden="true"></div>
<footer class="rodape">
  <div class="wrap">
    <div class="rodape__grid">
      <div>
        <img src="/assets/img/logo-creme.webp" width="${LOGO_W}" height="${LOGO_H}" alt="FrutVibes" loading="lazy">
        <p>Drinks gaseificados à base de vodka e caipirinha gaseificada, direto do barril.${SITE.empresa ? ` Uma marca ${esc(SITE.empresa)}.` : ''}</p>
      </div>
      <div>
        <h2>Sabores</h2>
        <ul>${SABORES.map((s) => `<li><a href="/sabores/${s.slug}/">${esc(s.nome)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2>FrutVibes</h2>
        <ul>
          <li><a href="/barril-para-eventos/">Barril para eventos</a></li>
          <li><a href="/sobre/">Sobre a marca</a></li>
          <li><a href="/perguntas-frequentes/">Perguntas frequentes</a></li>
          <li><a href="/contato/">Contato</a></li>
          ${SITE.instagram ? `<li><a href="https://www.instagram.com/${SITE.instagram}/" target="_blank" rel="noopener">Instagram @${esc(SITE.instagram)}</a></li>` : ''}
          <li><a href="/privacidade/">Privacidade</a></li>
        </ul>
      </div>
    </div>
    <div class="legal">
      <p><strong>Beba com moderação.</strong> Venda proibida para menores de 18 anos. Se beber, não dirija.</p>
      <p>© ${new Date().getFullYear()} FrutVibes</p>
    </div>
  </div>
</footer>
<div class="idade" id="idade" role="dialog" aria-modal="true" aria-labelledby="idade-titulo" hidden>
  <div class="idade__caixa">
    <img src="/assets/img/logo-creme.webp" width="${LOGO_W}" height="${LOGO_H}" alt="FrutVibes">
    <p class="idade__titulo" id="idade-titulo">Você tem 18 anos ou mais?</p>
    <p>Este site fala de bebida alcoólica e é destinado a maiores de idade.</p>
    <div class="idade__acoes">
      <button class="btn" type="button" data-idade="sim">Sim, tenho 18+</button>
      <button class="btn btn--linha" type="button" data-idade="nao">Não</button>
    </div>
    <p class="idade__nao" hidden>Então ainda não é a sua vez. Volte quando fizer 18!</p>
    <small>Beba com moderação. Se beber, não dirija.</small>
  </div>
</div>
<script src="/assets/js/main.js?v=${VERSAO}" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------------
const paginas = [];
const add = (p) => paginas.push(p);

// Home ----------------------------------------------------------------------
add({
  caminho: '/',
  prioridade: '1.0',
  titulo: 'FrutVibes | Drink de vodka gaseificado em barril',
  descricao: 'Drinks gaseificados de vodka nos sabores maçã verde, limão, abacaxi e frutas vermelhas, além de caipirinha. Em barril para bares, festas e eventos.',
  preload: '<link rel="preload" as="image" href="/assets/img/linha-frutvibes.webp" imagesrcset="/assets/img/linha-frutvibes-768.webp 768w, /assets/img/linha-frutvibes.webp 1536w" imagesizes="(max-width: 1180px) 100vw, 1100px" fetchpriority="high">',
  dados: [
    ld({ '@type': 'WebSite', '@id': abs('/#site'), name: 'FrutVibes', alternateName: 'Frut Vibes', url: abs('/'), inLanguage: 'pt-BR', publisher: { '@id': abs('/#organizacao') } }),
    ld(ORGANIZACAO),
    ld({
      '@type': 'ItemList',
      name: 'Sabores FrutVibes',
      itemListElement: SABORES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: `FrutVibes ${s.nome}`, url: abs(`/sabores/${s.slug}/`) })),
    }),
  ],
  corpo: `
<section class="hero">
  ${bolhas}
  <div class="wrap hero__in">
    <img class="hero__logo" src="/assets/img/logo-creme.webp" width="${LOGO_W}" height="${LOGO_H}" alt="FrutVibes" fetchpriority="high">
    <p class="eyebrow">Drinks gaseificados</p>
    <h1>Drink de vodka com fruta, gaseificado e direto do barril</h1>
    <p class="hero__lead">Maçã Verde, Limão, Abacaxi, Frutas Vermelhas e Caipirinha. Gelado, com gás na medida e servido como chopp no seu bar, festa ou evento.</p>
    <div class="acoes">
      <a class="btn" href="/sabores/">Conheça os sabores</a>
      <a class="btn btn--linha" href="/barril-para-eventos/">Barril para o seu evento</a>
    </div>
    <img class="hero__img" src="/assets/img/linha-frutvibes.webp" srcset="/assets/img/linha-frutvibes-768.webp 768w, /assets/img/linha-frutvibes.webp 1536w" sizes="(max-width: 1180px) 100vw, 1100px" width="1536" height="590" alt="Barril FrutVibes ao lado das latas nos sabores maçã verde, limão, abacaxi, frutas vermelhas e caipirinha">
  </div>
  ${onda()}
</section>

<section class="secao" aria-labelledby="t-sabores">
  <div class="wrap">
    <div class="secao__topo secao__topo--centro">
      <p class="eyebrow">Escolha a sua vibe</p>
      <h2 id="t-sabores">Cinco sabores, um barril cheio de gás</h2>
      <p>Quatro drinks à base de vodka com sabor de fruta e a caipirinha gaseificada, o clássico brasileiro pronto para servir.</p>
    </div>
    <div class="cards">${SABORES.map((s) => cardSabor(s)).join('')}
    </div>
  </div>
</section>

<section class="secao secao--teal" aria-labelledby="t-porque">
  ${bolhas}
  <div class="wrap">
    <div class="secao__topo">
      <p class="eyebrow">Por que FrutVibes</p>
      <h2 id="t-porque">A praticidade do chopp com o sabor de um drink</h2>
    </div>
    <div class="vantagens">
      <div class="vantagem"><span class="vantagem__icone">${ICONES.copo}</span><h3>Base de vodka</h3><p>Drink de verdade, com base de vodka e sabor de fruta em cada gole.</p></div>
      <div class="vantagem"><span class="vantagem__icone">${ICONES.bolhas}</span><h3>Gaseificado</h3><p>Borbulhas finas que deixam o drink leve, refrescante e fácil de beber.</p></div>
      <div class="vantagem"><span class="vantagem__icone">${ICONES.barril}</span><h3>Direto do barril</h3><p>Servido na chopeira: gelado, rápido e com o mesmo sabor em todo copo.</p></div>
      <div class="vantagem"><span class="vantagem__icone">${ICONES.lata}</span><h3>Em breve em lata</h3><p>Estamos preparando a FrutVibes para ir com você a qualquer lugar.</p></div>
    </div>
  </div>
</section>

<section class="secao" aria-labelledby="t-eventos">
  <div class="wrap split">
    <div class="split__img">
      <img src="/assets/img/barril-frutvibes.webp" width="666" height="870" alt="Barril de drink gaseificado FrutVibes" loading="lazy" decoding="async">
    </div>
    <div>
      <p class="eyebrow">Para bares e eventos</p>
      <h2 id="t-eventos">Drink em barril: a fila anda e a festa não para</h2>
      <p>Com FrutVibes em barril, o drink sai pronto da chopeira. Sem cortar fruta, sem medir dose e sem fila no bar. Ideal para quem quer servir drink para muita gente com agilidade.</p>
      <ul class="lista">
        <li>Pronto para servir, padronizado do primeiro ao último copo</li>
        <li>Mais agilidade no atendimento do bar</li>
        <li>Cinco sabores para montar o cardápio do seu jeito</li>
      </ul>
      <div class="acoes">
        <a class="btn btn--escuro" href="/barril-para-eventos/">Ver como funciona</a>
        ${ctaPedido('Olá! Quero FrutVibes em barril para o meu evento.', 'btn btn--linha')}
      </div>
    </div>
  </div>
</section>

<section class="secao secao--creme2" aria-labelledby="t-faq">
  <div class="wrap">
    <div class="secao__topo secao__topo--centro">
      <p class="eyebrow">Dúvidas</p>
      <h2 id="t-faq">Perguntas frequentes</h2>
    </div>
    <div class="faq">${FAQ.slice(0, 4).map(([p, r]) => `<details><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('')}</div>
    <p class="centro"><a class="link-forte" href="/perguntas-frequentes/">Ver todas as perguntas <span aria-hidden="true">→</span></a></p>
  </div>
</section>`,
});

// Sabores (listagem) ---------------------------------------------------------
{
  const m = migalhas([['Início', '/'], ['Sabores', '/sabores/']]);
  add({
    caminho: '/sabores/',
    prioridade: '0.9',
    titulo: 'Sabores FrutVibes: drinks de vodka e caipirinha gaseificados',
    descricao: 'Conheça todos os sabores FrutVibes: Maçã Verde, Limão, Abacaxi e Frutas Vermelhas à base de vodka, e a Caipirinha gaseificada em barril.',
    dados: [m.dados],
    corpo: `
<section class="cabecalho">
  ${bolhas}
  <div class="wrap">
    ${m.html}
    <p class="eyebrow">Drinks gaseificados</p>
    <h1>Sabores FrutVibes</h1>
    <p class="cabecalho__lead">Quatro drinks à base de vodka com sabor de fruta e uma caipirinha gaseificada. Todos gelados, com gás na medida e servidos direto do barril.</p>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo">
  <div class="wrap">
    <div class="cards">${SABORES.map((s) => cardSabor(s, 2)).join('')}
    </div>
  </div>
</section>`,
  });
}

// Página de cada sabor --------------------------------------------------------
for (const s of SABORES) {
  const caminho = `/sabores/${s.slug}/`;
  const m = migalhas([['Início', '/'], ['Sabores', '/sabores/'], [s.nome, caminho]]);
  const outros = SABORES.filter((o) => o.slug !== s.slug);
  add({
    caminho,
    prioridade: '0.8',
    titulo: s.titulo,
    descricao: s.meta,
    og: `og-${s.slug}.jpg`,
    ogAlt: `Lata FrutVibes ${s.nome}`,
    preload: `<link rel="preload" as="image" href="/assets/img/lata-${s.slug}.webp" fetchpriority="high">`,
    dados: [
      m.dados,
      ld({
        '@type': 'Product',
        '@id': abs(caminho + '#produto'),
        name: `FrutVibes ${s.nome}`,
        description: s.meta,
        url: abs(caminho),
        image: [abs(`/assets/img/lata-${s.slug}.webp`), abs(`/assets/img/og-${s.slug}.jpg`)],
        brand: { '@type': 'Brand', name: 'FrutVibes' },
        manufacturer: { '@type': 'Organization', name: SITE.empresa || 'FrutVibes', url: abs('/') },
        category: 'Bebidas alcoólicas > Drinks prontos gaseificados',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Tipo', value: s.base },
          { '@type': 'PropertyValue', name: 'Embalagem', value: 'Barril' },
        ],
      }),
    ],
    corpo: `
<section class="sabor-hero" style="${estiloSabor(s)}">
  ${bolhas}
  <div class="wrap">
    ${m.html}
    <div class="sabor-hero__grid">
      <div class="sabor-hero__img">${imgLata(s, { lazy: false })}</div>
      <div>
        <p class="eyebrow">${esc(s.base)}</p>
        <h1>FrutVibes ${esc(s.nome)}</h1>
        <p class="sabor-hero__resumo">${esc(s.resumo)}</p>
        ${s.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <div class="ficha">
          <div><h2>Perfil</h2><ul class="lista">${s.perfil.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><h2>Combina com</h2><p>${esc(s.combina)}</p><h2>Como servir</h2><p>Bem gelado, direto do barril na chopeira.</p></div>
        </div>
        <div class="acoes">
          ${ctaPedido(`Olá! Quero saber mais sobre o FrutVibes ${s.nome} em barril.`)}
          <a class="btn btn--linha" href="/barril-para-eventos/">Barril para eventos</a>
        </div>
      </div>
    </div>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo" aria-labelledby="t-outros">
  <div class="wrap">
    <div class="secao__topo">
      <h2 id="t-outros">Prove também</h2>
    </div>
    <div class="cards cards--4">${outros.map((o) => cardSabor(o)).join('')}
    </div>
  </div>
</section>`,
  });
}

// Barril para eventos --------------------------------------------------------
{
  const caminho = '/barril-para-eventos/';
  const m = migalhas([['Início', '/'], ['Barril para eventos', caminho]]);
  const faqEventos = [FAQ[3], FAQ[4], FAQ[5], FAQ[2]];
  add({
    caminho,
    prioridade: '0.9',
    titulo: 'Drink em barril para bares e eventos | FrutVibes',
    descricao: 'Chopp de drink para festas, casamentos, formaturas e bares: FrutVibes em barril, com drinks de vodka gaseificados e caipirinha prontos para servir.',
    og: 'og-barril.jpg',
    ogAlt: 'Barril FrutVibes para bares e eventos',
    dados: [
      m.dados,
      ld({
        '@type': 'Service',
        name: 'FrutVibes em barril para bares e eventos',
        serviceType: 'Fornecimento de drinks gaseificados em barril',
        provider: { '@id': abs('/#organizacao'), '@type': 'Organization', name: 'FrutVibes', url: abs('/') },
        areaServed: SITE.cidade ? { '@type': 'City', name: SITE.cidade } : { '@type': 'Country', name: 'Brasil' },
        url: abs(caminho),
      }),
    ],
    corpo: `
<section class="cabecalho">
  ${bolhas}
  <div class="wrap split">
    <div>
      ${m.html}
      <p class="eyebrow">Para bares e eventos</p>
      <h1>Drink gaseificado em barril para o seu bar ou evento</h1>
      <p class="cabecalho__lead">FrutVibes é o chopp de drink: vodka com fruta ou caipirinha, gaseificados e prontos para sair gelados da chopeira. Mais agilidade no bar e o mesmo sabor em todo copo.</p>
      <div class="acoes">
        ${ctaPedido('Olá! Quero um orçamento de FrutVibes em barril.')}
        <a class="btn btn--linha" href="/sabores/">Ver sabores</a>
      </div>
    </div>
    <div class="split__img split__img--escuro">
      <img src="/assets/img/barril-frutvibes.webp" width="666" height="870" alt="Barril FrutVibes de drink gaseificado" fetchpriority="high">
    </div>
  </div>
  ${onda()}
</section>

<section class="secao secao--sem-topo" aria-labelledby="t-vantagens">
  <div class="wrap">
    <div class="secao__topo">
      <h2 id="t-vantagens">Por que servir drink em barril</h2>
      <p>Drink preparado na hora é gostoso, mas trava o bar quando o evento enche. Com FrutVibes, o drink já vem pronto e gaseificado no barril.</p>
    </div>
    <div class="vantagens vantagens--claro">
      <div class="vantagem"><span class="vantagem__icone">${ICONES.barril}</span><h3>Pronto para servir</h3><p>É só engatar na chopeira e servir. Sem preparo, sem cortar fruta e sem medir dose.</p></div>
      <div class="vantagem"><span class="vantagem__icone">${ICONES.copo}</span><h3>Padrão em todo copo</h3><p>O mesmo sabor e o mesmo gás do primeiro ao último convidado.</p></div>
      <div class="vantagem"><span class="vantagem__icone">${ICONES.bolhas}</span><h3>Fila andando</h3><p>Servir drink na velocidade do chopp deixa o bar mais ágil nos horários de pico.</p></div>
    </div>
  </div>
</section>

<section class="secao secao--creme2" aria-labelledby="t-ocasioes">
  <div class="wrap">
    <div class="secao__topo">
      <h2 id="t-ocasioes">Onde FrutVibes combina</h2>
    </div>
    <ul class="tags">${OCASIOES.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
  </div>
</section>

<section class="secao" aria-labelledby="t-passos">
  <div class="wrap">
    <div class="secao__topo">
      <h2 id="t-passos">Como pedir</h2>
    </div>
    <ol class="passos">
      <li><h3>Escolha os sabores</h3><p>Maçã Verde, Limão, Abacaxi, Frutas Vermelhas e Caipirinha. Dá para misturar.</p></li>
      <li><h3>Fale com a gente</h3><p>Conte a data, a cidade, o número de convidados e como é a estrutura do bar.</p></li>
      <li><h3>Sirva bem gelado</h3><p>Barril refrigerado, chopeira pronta e drink saindo com gás na medida.</p></li>
    </ol>
    <div class="acoes">${ctaPedido('Olá! Quero FrutVibes em barril. Data: / Cidade: / Convidados: ', 'btn btn--escuro')}</div>
  </div>
</section>

<section class="secao secao--creme2" aria-labelledby="t-faq-eventos">
  <div class="wrap">
    <div class="secao__topo secao__topo--centro"><h2 id="t-faq-eventos">Dúvidas sobre o barril</h2></div>
    <div class="faq">${faqEventos.map(([p, r]) => `<details><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('')}</div>
  </div>
</section>`,
  });
}

// Sobre -----------------------------------------------------------------------
{
  const caminho = '/sobre/';
  const m = migalhas([['Início', '/'], ['Sobre', caminho]]);
  add({
    caminho,
    prioridade: '0.6',
    titulo: 'Sobre a FrutVibes | Drinks gaseificados em barril',
    descricao: 'A FrutVibes nasceu para servir drink de verdade com a praticidade do chopp: vodka com fruta e caipirinha, gaseificados e direto do barril.',
    dados: [m.dados, ld({ '@type': 'AboutPage', name: 'Sobre a FrutVibes', url: abs(caminho), about: ORGANIZACAO })],
    corpo: `
<section class="cabecalho">
  ${bolhas}
  <div class="wrap">
    ${m.html}
    <p class="eyebrow">Sobre a marca</p>
    <h1>Drink de verdade, na velocidade do chopp</h1>
    <p class="cabecalho__lead">A FrutVibes nasceu de quem vive o dia a dia de bares e eventos e queria servir drink para muita gente sem perder sabor nem tempo.</p>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo">
  <div class="wrap split">
    <div class="texto">
      <h2>Do barril para o copo</h2>
      <p>A ideia é simples: pegar os sabores que o brasileiro ama, como maçã verde, limão, abacaxi, frutas vermelhas e a nossa caipirinha, e transformar em drinks gaseificados, prontos para sair gelados da chopeira.</p>
      <p>Cada sabor é produzido em barril, com base de vodka e gás na medida, para que o último copo da festa seja tão bom quanto o primeiro.</p>
      <h2>Próxima parada: a lata</h2>
      <p>O barril é só o começo. Estamos trabalhando para levar a FrutVibes para a lata e deixar a vibe da fruta ainda mais perto de você.</p>
      ${SITE.empresa ? `<p>FrutVibes é uma marca ${esc(SITE.empresa)}.</p>` : ''}
      <div class="acoes"><a class="btn btn--escuro" href="/sabores/">Conheça os sabores</a></div>
    </div>
    <div class="split__img">
      <img src="/assets/img/linha-frutvibes-768.webp" width="768" height="295" alt="Linha de produtos FrutVibes em barril e lata" loading="lazy" decoding="async">
    </div>
  </div>
</section>`,
  });
}

// Perguntas frequentes ----------------------------------------------------------
{
  const caminho = '/perguntas-frequentes/';
  const m = migalhas([['Início', '/'], ['Perguntas frequentes', caminho]]);
  add({
    caminho,
    prioridade: '0.7',
    titulo: 'Perguntas frequentes sobre FrutVibes',
    descricao: 'Tire suas dúvidas sobre FrutVibes: sabores, drink de vodka em barril, chopeira, eventos, lançamento em lata e venda para maiores de 18 anos.',
    dados: [
      m.dados,
      ld({
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([p, r]) => ({ '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r } })),
      }),
    ],
    corpo: `
<section class="cabecalho">
  ${bolhas}
  <div class="wrap">
    ${m.html}
    <p class="eyebrow">Dúvidas</p>
    <h1>Perguntas frequentes</h1>
    <p class="cabecalho__lead">Tudo o que você precisa saber sobre os drinks gaseificados FrutVibes.</p>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo">
  <div class="wrap">
    <div class="faq">${FAQ.map(([p, r], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('')}</div>
    <p class="centro">Não achou sua dúvida? <a class="link-forte" href="/contato/">Fale com a gente</a></p>
  </div>
</section>`,
  });
}

// Contato -------------------------------------------------------------------------
{
  const caminho = '/contato/';
  const m = migalhas([['Início', '/'], ['Contato', caminho]]);
  const canais = [
    SITE.whatsapp && `<a class="contato" href="${linkWhats('Olá! Vim pelo site da FrutVibes.')}" target="_blank" rel="noopener"><span class="eyebrow">WhatsApp</span><strong>Pedidos e orçamentos</strong><span>Resposta rápida pelo celular</span></a>`,
    SITE.email && `<a class="contato" href="mailto:${esc(SITE.email)}"><span class="eyebrow">E-mail</span><strong>${esc(SITE.email)}</strong><span>Parcerias, bares e distribuidores</span></a>`,
    SITE.instagram && `<a class="contato" href="https://www.instagram.com/${SITE.instagram}/" target="_blank" rel="noopener"><span class="eyebrow">Instagram</span><strong>@${esc(SITE.instagram)}</strong><span>Novidades e lançamentos</span></a>`,
  ].filter(Boolean);
  add({
    caminho,
    prioridade: '0.7',
    titulo: 'Contato | FrutVibes drinks gaseificados em barril',
    descricao: 'Fale com a FrutVibes para pedir drinks gaseificados em barril para bares, festas e eventos, ou para ser um parceiro de distribuição.',
    dados: [m.dados, ld({ '@type': 'ContactPage', name: 'Contato FrutVibes', url: abs(caminho), about: ORGANIZACAO })],
    corpo: `
<section class="cabecalho">
  ${bolhas}
  <div class="wrap">
    ${m.html}
    <p class="eyebrow">Contato</p>
    <h1>Bora levar FrutVibes para o seu bar ou evento?</h1>
    <p class="cabecalho__lead">Pedidos de barril, orçamentos para eventos, parcerias e distribuição.</p>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo">
  <div class="wrap">
    ${canais.length ? `<div class="contatos">${canais.join('')}</div>` : '<p class="aviso">Nossos canais de atendimento estão sendo atualizados. Volte em breve!</p>'}
    <div class="dica">
      <h2>Para agilizar seu orçamento, conte para a gente:</h2>
      <ul class="lista">
        <li>Data e cidade do evento</li>
        <li>Número aproximado de convidados</li>
        <li>Sabores que você quer servir</li>
        <li>Se o local já tem chopeira e refrigeração</li>
      </ul>
    </div>
  </div>
</section>`,
  });
}

// Privacidade ----------------------------------------------------------------------
{
  const caminho = '/privacidade/';
  add({
    caminho,
    prioridade: '0.2',
    titulo: 'Política de privacidade | FrutVibes',
    descricao: 'Saiba como o site da FrutVibes trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).',
    corpo: `
<section class="cabecalho cabecalho--curto">
  <div class="wrap">
    <p class="eyebrow">Institucional</p>
    <h1>Política de privacidade</h1>
  </div>
  ${onda()}
</section>
<section class="secao secao--sem-topo">
  <div class="wrap texto">
    <p>Atualizada em ${HOJE.split('-').reverse().join('/')}.</p>
    <h2>Quais dados coletamos</h2>
    <p>Este site não tem formulários nem cadastro. Guardamos no seu navegador (armazenamento local) apenas a confirmação de que você tem 18 anos ou mais, para não perguntar de novo a cada visita. Essa informação não é enviada para nós.</p>
    <h2>Serviços de terceiros</h2>
    <p>Usamos fontes do Google Fonts, que recebem o endereço IP do seu dispositivo para entregar os arquivos. Ao clicar nos links de WhatsApp, Instagram ou e-mail, você passa a usar esses serviços, que têm políticas de privacidade próprias.</p>
    <h2>Contato sobre privacidade</h2>
    <p>Para dúvidas sobre seus dados pessoais e os direitos garantidos pela LGPD (Lei nº 13.709/2018), fale com a gente pela página de <a href="/contato/">contato</a>.</p>
    <h2>Bebida alcoólica</h2>
    <p>O conteúdo deste site é destinado a maiores de 18 anos. Beba com moderação e, se beber, não dirija.</p>
  </div>
</section>`,
  });
}

// 404 -------------------------------------------------------------------------------
add({
  caminho: '/404.html',
  arquivo: '404.html',
  noindex: true,
  titulo: 'Página não encontrada | FrutVibes',
  descricao: 'A página que você procurou não existe. Conheça os sabores FrutVibes.',
  corpo: `
<section class="cabecalho cabecalho--404">
  ${bolhas}
  <div class="wrap centro">
    <p class="eyebrow">Erro 404</p>
    <h1>Essa página evaporou junto com o gás</h1>
    <p class="cabecalho__lead">O endereço que você acessou não existe ou mudou de lugar.</p>
    <div class="acoes acoes--centro"><a class="btn" href="/">Ir para o início</a><a class="btn btn--linha" href="/sabores/">Ver sabores</a></div>
  </div>
  ${onda()}
</section>`,
});

// ---------------------------------------------------------------------------
// Escrita dos arquivos
// ---------------------------------------------------------------------------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'static'), OUT, { recursive: true });

for (const p of paginas) {
  const destino = join(OUT, p.arquivo || join(p.caminho, 'index.html'));
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, layout(p));
}

const indexaveis = paginas.filter((p) => !p.noindex);
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexaveis.map((p) => `  <url><loc>${abs(p.caminho)}</loc><lastmod>${HOJE}</lastmod><priority>${p.prioridade}</priority></url>`).join('\n')}
</urlset>
`,
);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
writeFileSync(
  join(OUT, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'FrutVibes — Drinks gaseificados',
      short_name: 'FrutVibes',
      lang: 'pt-BR',
      start_url: '/',
      display: 'standalone',
      background_color: '#0E4F45',
      theme_color: '#0E4F45',
      icons: [
        { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
);

console.log(`✔ ${paginas.length} páginas geradas em public/ (${indexaveis.length} no sitemap)`);
const faltando = ['email', 'whatsapp', 'instagram', 'cidade'].filter((k) => !SITE[k]);
if (faltando.length) console.warn(`⚠ Preencha em SITE (build.mjs): ${faltando.join(', ')}`);
