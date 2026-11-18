// Gera a proposta comercial em PDF (para produtoras de eventos, bares e casas de festa).
// Uso: node tools/gerar_proposta.mjs
// Precisa do Chrome ou do Edge instalado (usado só para imprimir o HTML em PDF).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const IMG = join(ROOT, 'static', 'assets', 'img');
const SAIDA = join(ROOT, 'comercial');
const SITE = JSON.parse(readFileSync(join(ROOT, 'conteudo', 'config.json'), 'utf8'));

const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

// As imagens são reduzidas ao tamanho de impressão (deixa o PDF leve) e viram data: URI
const CACHE = join(SAIDA, '.img');
const LARGURAS = { 'linha-frutvibes.webp': 1150, 'logo-creme.png': 700, 'logo-preta.png': 420 };
const reduzir = (arquivos) => {
  mkdirSync(CACHE, { recursive: true });
  const py = `
import os
from PIL import Image
for arq, larg in ${JSON.stringify(arquivos.map((a) => [a, LARGURAS[a] || 300]))}:
    o = os.path.join(r"${IMG}", arq); d = os.path.join(r"${CACHE}", arq)
    im = Image.open(o)
    if arq == 'linha-frutvibes.webp':  # tira a faixa escura e a legenda do topo
        im = im.crop((0, round(im.height * 0.2), im.width, im.height))
    if im.width > larg:
        im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
    im.save(d, quality=88, method=6) if arq.endswith('.webp') else im.save(d, optimize=True)
`;
  try {
    execFileSync('python', ['-c', py], { stdio: 'pipe' });
    return true;
  } catch {
    console.warn('Pillow indisponível: usando as imagens no tamanho original.');
    return false;
  }
};

const tipos = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg' };
let reduzidas = false;
const emb = (arquivo) => {
  const ext = arquivo.split('.').pop();
  const caminho = reduzidas && existsSync(join(CACHE, arquivo)) ? join(CACHE, arquivo) : join(IMG, arquivo);
  return `data:${tipos[ext]};base64,${readFileSync(caminho).toString('base64')}`;
};

const tel = SITE.whatsapp
  ? `(${SITE.whatsapp.slice(2, 4)}) ${SITE.whatsapp.slice(4, 9)}-${SITE.whatsapp.slice(9)}`
  : '';
const zap = SITE.whatsapp
  ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Olá! Quero um orçamento de FrutVibes em barril para um evento.')}`
  : 'https://www.frutvibes.com/contato/';

const SABORES = [
  { nome: 'Maçã Verde', img: 'lata-maca-verde.webp', cor: '#3F9A2B', nota: 'Azedinho e refrescante' },
  { nome: 'Limão', img: 'lata-limao.webp', cor: '#B4D236', nota: 'O coringa que agrada todo mundo' },
  { nome: 'Abacaxi', img: 'lata-abacaxi.webp', cor: '#F2C31C', nota: 'Tropical e docinho' },
  { nome: 'Frutas Vermelhas', img: 'lata-frutas-vermelhas.webp', cor: '#C4174E', nota: 'Intenso e muito fotogênico' },
  { nome: 'Caipirinha', img: 'lata-caipirinha.webp', cor: '#135C4D', nota: 'O clássico brasileiro, com gás' },
];

mkdirSync(SAIDA, { recursive: true });
reduzidas = reduzir([...SABORES.map((s) => s.img), 'linha-frutvibes.webp', 'logo-creme.png', 'logo-preta.png']);

const bolha = (x, y, r, op = 0.22) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FFF9E8" stroke-opacity="${op}" stroke-width="3"/>`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>FrutVibes — Barril para eventos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap">
<style>
  :root {
    --teal: #0E4F45; --teal-esc: #0A3A33; --teal-claro: #2F8F7C;
    --creme: #FFF9E8; --creme2: #F4EBD5; --tinta: #10231F; --tinta2: #445954;
    --moldura: #D6CCB6; --borda: #E6DAC0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
  body { font-family: 'Outfit', 'Segoe UI', sans-serif; color: var(--tinta); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pag { position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; }
  .pag:last-child { page-break-after: auto; }
  h1, h2, h3 { line-height: 1.05; letter-spacing: -.02em; }
  .olho { font-size: 9pt; font-weight: 600; letter-spacing: .3em; text-transform: uppercase; }

  /* ---------- Capa ---------- */
  .capa { background: var(--teal); color: var(--creme); display: flex; flex-direction: column; }
  .capa__brilho { position: absolute; inset: 0; background:
      radial-gradient(45% 35% at 20% 72%, #2F8F7C66, transparent 70%),
      radial-gradient(45% 35% at 85% 55%, #1D6E6099, transparent 70%); }
  .capa__bolhas { position: absolute; inset: 0; }
  .capa__in { position: relative; padding: 24mm 18mm 0; text-align: center; }
  .capa__logo { width: 112mm; margin: 0 auto 7mm; display: block; }
  .capa h1 { font-size: 30pt; font-weight: 800; max-width: 165mm; margin: 4mm auto 5mm; }
  .capa__lead { font-size: 12.5pt; line-height: 1.55; max-width: 150mm; margin: 0 auto; opacity: .94; }
  .capa__selos { position: relative; display: flex; justify-content: center; gap: 3mm; margin-top: 9mm; }
  .capa__selos span { border: 1.5px solid #FFF9E866; border-radius: 999px; padding: 2.6mm 6mm; font-size: 10pt; font-weight: 600; }
  .capa__foto { position: absolute; left: 0; right: 0; bottom: 19mm; }
  .capa__foto img { width: 100%; display: block; }
  .capa__foto::after { content: ''; position: absolute; inset: auto 0 0; height: 14mm;
    background: linear-gradient(to bottom, transparent, #0A3A33); }
  .capa__rodape { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 7mm 18mm 8mm;
    display: flex; justify-content: space-between; align-items: center; gap: 6mm;
    background: linear-gradient(to top, #0A3A33 70%, transparent); font-size: 10.5pt; font-weight: 600; }
  .capa__rodape span { display: flex; align-items: center; gap: 2mm; }

  /* ---------- Páginas claras ---------- */
  .claro { background: var(--creme); padding: 16mm 16mm 14mm; }
  .cab { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--borda); padding-bottom: 4mm; margin-bottom: 9mm; }
  .cab img { height: 9mm; }
  .cab .olho { color: var(--teal-claro); }
  h2 { font-size: 20pt; font-weight: 800; color: var(--teal); margin-bottom: 3mm; }
  .sub { font-size: 11pt; color: var(--tinta2); line-height: 1.5; max-width: 160mm; }

  .sabores { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3.5mm; margin: 8mm 0 10mm; }
  .sabor { border-radius: 5mm; overflow: hidden; background: var(--c); color: #fff; text-align: center; padding-bottom: 3.5mm; }
  .sabor__foto { background: var(--moldura); height: 46mm; display: flex; align-items: center; justify-content: center; padding: 2.5mm; }
  .sabor__foto img { height: 100%; width: auto; }
  .sabor__nome { font-size: 10.5pt; font-weight: 700; margin: 3mm 2mm 1mm; line-height: 1.15; }
  .sabor__nota { font-size: 7.8pt; opacity: .92; padding: 0 2.5mm; line-height: 1.3; }
  .extra { background: var(--creme2); border-radius: 4mm; padding: 4mm 6mm; font-size: 10.5pt; color: var(--tinta2); margin-bottom: 9mm; }
  .extra strong { color: var(--tinta); }

  .vantagens { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-bottom: 9mm; }
  .vant { background: #fff; border: 1px solid var(--borda); border-radius: 4mm; padding: 5mm; }
  .vant__ic { width: 11mm; height: 11mm; border-radius: 50%; background: var(--teal); color: var(--creme);
    display: flex; align-items: center; justify-content: center; margin-bottom: 3.5mm; }
  .vant h3 { font-size: 11.5pt; font-weight: 700; margin-bottom: 1.5mm; }
  .vant p { font-size: 9.5pt; color: var(--tinta2); line-height: 1.45; }

  .passos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; counter-reset: p; }
  .passo { counter-increment: p; padding-left: 12mm; position: relative; }
  .passo::before { content: counter(p); position: absolute; left: 0; top: -1mm; width: 9mm; height: 9mm; border-radius: 50%;
    background: var(--teal-claro); color: #fff; font-weight: 800; font-size: 11pt; display: flex; align-items: center; justify-content: center; }
  .passo h3 { font-size: 11pt; font-weight: 700; margin-bottom: 1mm; }
  .passo p { font-size: 9.5pt; color: var(--tinta2); line-height: 1.45; }

  /* ---------- Preços ---------- */
  table { width: 100%; border-collapse: collapse; margin: 7mm 0 4mm; font-size: 11pt; }
  thead th { background: var(--teal); color: var(--creme); font-size: 10pt; font-weight: 700; text-align: center; padding: 4mm 3mm; }
  thead th:first-child { text-align: left; border-radius: 3mm 0 0 0; }
  thead th:last-child { border-radius: 0 3mm 0 0; }
  tbody td { background: #fff; border-bottom: 1px solid var(--borda); padding: 5mm 3mm; text-align: center; font-weight: 700; font-size: 13pt; color: var(--teal); }
  tbody td:first-child { text-align: left; font-weight: 600; font-size: 10.5pt; color: var(--tinta); }
  tbody td small { display: block; font-weight: 400; font-size: 8.5pt; color: var(--tinta2); margin-top: .8mm; }
  .obs { font-size: 9pt; color: var(--tinta2); line-height: 1.5; }
  .incluso { background: #E8F3EC; border-left: 4px solid var(--teal-claro); border-radius: 0 3mm 3mm 0;
    padding: 3.5mm 5mm; font-size: 10.5pt; color: var(--tinta); margin-bottom: 3mm; }
  .incluso b { color: var(--teal); }

  .fatos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 8mm 0; }
  .fato { background: var(--teal); color: var(--creme); border-radius: 4mm; padding: 5mm; }
  .fato b { display: block; font-size: 17pt; font-weight: 800; margin-bottom: 1mm; }
  .fato span { font-size: 9.5pt; opacity: .9; line-height: 1.4; }

  .cta { background: var(--teal); color: var(--creme); border-radius: 5mm; padding: 7mm 8mm; display: flex; justify-content: space-between; align-items: center; gap: 6mm; }
  .cta h3 { font-size: 16pt; font-weight: 800; margin-bottom: 2mm; }
  .cta p { font-size: 10pt; opacity: .92; line-height: 1.5; }
  .cta__zap { background: var(--creme); color: var(--teal); border-radius: 999px; padding: 4mm 7mm; font-weight: 800; font-size: 12pt; white-space: nowrap; text-align: center; }
  .cta__zap small { display: block; font-size: 8pt; font-weight: 600; opacity: .75; }
  .ocas { margin-top: 6mm; }
  .ocas h3 { font-size: 11pt; font-weight: 700; color: var(--teal); margin-bottom: 3.5mm; }
  .ocas__lista { display: flex; flex-wrap: wrap; gap: 2.5mm; }
  .ocas__lista span { background: #fff; border: 1px solid var(--borda); border-radius: 999px; padding: 2.2mm 5mm; font-size: 9.5pt; font-weight: 600; color: var(--tinta2); }
  .chopp { margin-top: 6mm; border: 1px dashed var(--teal-claro); border-radius: 4mm; padding: 4.5mm 6mm; font-size: 10pt; color: var(--tinta2); }
  .chopp strong { color: var(--teal); }
  .miudo { margin-top: 4.5mm; font-size: 7.5pt; line-height: 1.45; color: #6E7E79; }
  .legal { position: absolute; left: 16mm; right: 16mm; bottom: 9mm; border-top: 1px solid var(--borda); padding-top: 3mm;
    display: flex; justify-content: space-between; font-size: 8.5pt; color: var(--tinta2); }
  .legal b { color: var(--tinta); text-transform: uppercase; letter-spacing: .05em; }
</style>
</head>
<body>

<!-- Capa -->
<section class="pag capa">
  <div class="capa__brilho"></div>
  <svg class="capa__bolhas" viewBox="0 0 210 297" preserveAspectRatio="none">
    ${bolha(22, 40, 7)}${bolha(30, 58, 3.2, 0.3)}${bolha(186, 32, 9)}${bolha(176, 52, 4, 0.3)}${bolha(196, 70, 2.6, 0.35)}${bolha(16, 120, 4.5, 0.18)}
  </svg>
  <div class="capa__in">
    <img class="capa__logo" src="${emb('logo-creme.png')}" alt="FrutVibes">
    <p class="olho">Drinks gaseificados · Proposta para eventos</p>
    <h1>O drink pronto que sai da chopeira e faz a fila do bar andar</h1>
    <p class="capa__lead">Vodka com fruta e caipirinha, gaseificados e servidos em barril.
      O mesmo sabor no primeiro e no último copo — sem cortar fruta, sem medir dose, sem gargalo no atendimento.</p>
    <div class="capa__selos">
      <span>Barris de 30 e 50 L</span>
      <span>5 sabores + caipirinha</span>
      <span>Chopeira inclusa</span>
    </div>
  </div>
  <div class="capa__foto"><img src="${emb('linha-frutvibes.webp')}" alt="Barril e latas FrutVibes"></div>
  <div class="capa__rodape">
    <span>${SITE.url.replace('https://', '')}</span>
    ${tel ? `<span>WhatsApp ${tel}</span>` : ''}
    ${SITE.instagram ? `<span>@${SITE.instagram}</span>` : ''}
  </div>
</section>

<!-- Sabores e operação -->
<section class="pag claro">
  <div class="cab">
    <div>
      <p class="olho">O que servimos</p>
      <h2 style="margin-top:2mm">Cinco sabores prontos para a chopeira</h2>
    </div>
    <img src="${emb('logo-preta.png')}" alt="FrutVibes">
  </div>

  <p class="sub">Drinks à base de vodka com sabor de fruta e a caipirinha gaseificada. Tudo chega pronto no barril, gelado e com gás na medida: é só engatar e servir.</p>

  <div class="sabores">
    ${SABORES.map(
      (s) => `<div class="sabor" style="--c:${s.cor}">
      <div class="sabor__foto"><img src="${emb(s.img)}" alt="${s.nome}"></div>
      <div class="sabor__nome">${s.nome}</div>
      <div class="sabor__nota">${s.nota}</div>
    </div>`,
    ).join('')}
  </div>

  <p class="extra"><strong>Também disponível:</strong> Vodka com Energético, no mesmo valor dos sabores de fruta.</p>

  <h2>Por que barril em vez de drink preparado na hora</h2>
  <div class="vantagens">
    <div class="vant">
      <div class="vant__ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 3h10c1.6 3 1.6 15 0 18H7C5.4 18 5.4 6 7 3z"/><path d="M5.9 8.5h12.2M5.9 15.5h12.2"/></svg></div>
      <h3>Fila que anda</h3>
      <p>O copo sai na velocidade do chopp. Nos horários de pico, isso vira faturamento em vez de reclamação.</p>
    </div>
    <div class="vant">
      <div class="vant__ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12l-1.6 17.2a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8z"/><path d="M6.6 9h10.8"/></svg></div>
      <h3>Padrão garantido</h3>
      <p>Sem dose no olho e sem variação de bartender: o sabor é idêntico do primeiro ao último convidado.</p>
    </div>
    <div class="vant">
      <div class="vant__ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="15" r="5"/><circle cx="17" cy="7" r="3"/><circle cx="18.5" cy="16" r="1.5"/></svg></div>
      <h3>Menos equipe e menos perda</h3>
      <p>Acaba o preparo copo a copo: nada de fruta cortada, gelo derretendo e insumo parado no fim da noite.</p>
    </div>
  </div>

  <h2>Como funciona</h2>
  <div class="passos">
    <div class="passo"><h3>Você conta o evento</h3><p>Data, local, público estimado e quais sabores quer servir.</p></div>
    <div class="passo"><h3>A gente monta o combo</h3><p>Quantidade de barris por sabor, de acordo com o tamanho e o perfil do público.</p></div>
    <div class="passo"><h3>Chega gelado e pronto</h3><p>Barril e chopeira entregues no local: é engatar e servir. O aluguel do maquinário já está no preço.</p></div>
  </div>
</section>

<!-- Preços e contato -->
<section class="pag claro">
  <div class="cab">
    <div>
      <p class="olho">Valores e logística</p>
      <h2 style="margin-top:2mm">Preço por barril</h2>
    </div>
    <img src="${emb('logo-preta.png')}" alt="FrutVibes">
  </div>

  <table>
    <thead>
      <tr><th>Bebida</th><th>Barril 30 litros</th><th>Barril 50 litros</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Drinks de vodka<small>Maçã verde, limão, abacaxi, frutas vermelhas e energético</small></td>
        <td>R$ 450</td><td>R$ 550</td>
      </tr>
      <tr>
        <td>Caipirinha gaseificada<small>O clássico brasileiro, pronto para servir</small></td>
        <td>R$ 499</td><td>R$ 599</td>
      </tr>
    </tbody>
  </table>
  <p class="incluso"><b>Aluguel do maquinário incluso, sem caução.</b> A chopeira vai junto com o barril, sem custo à parte.</p>
  <p class="obs">Valores por barril. Frete e condições de pagamento são combinados caso a caso com a equipe comercial.</p>

  <div class="fatos">
    <div class="fato"><b>30 e 50 L</b><span>Dois tamanhos de barril, misturando sabores como preferir</span></div>
    <div class="fato"><b>1.000 L</b><span>Capacidade de entrega por dia, somando todos os tamanhos</span></div>
    <div class="fato"><b>5 sabores</b><span>Mais a caipirinha gaseificada para montar o cardápio</span></div>
  </div>

  <div class="cta">
    <div>
      <h3>Vamos calcular o seu evento?</h3>
      <p>Mande a data, a cidade e o número de convidados que a gente retorna com a quantidade de barris e o orçamento fechado.</p>
    </div>
    ${tel ? `<div class="cta__zap">${tel}<small>WhatsApp comercial</small></div>` : ''}
  </div>

  <div class="ocas">
    <h3>Onde a FrutVibes costuma rodar</h3>
    <div class="ocas__lista">
      ${['Casamentos', 'Formaturas', 'Festas universitárias', 'Aniversários', 'Shows e festivais', 'Eventos corporativos', 'Festas juninas', 'Carnaval', 'Bares e restaurantes', 'Confraternizações']
        .map((o) => `<span>${o}</span>`)
        .join('')}
    </div>
  </div>

  <p class="chopp"><strong>Quer chopp também?</strong> A FrutVibes é da mesma casa da ${SITE.empresa}. Dá para somar barris de chopp ao pedido e fechar o bar inteiro com um fornecedor só.</p>

  <p class="miudo">Equipamentos cedidos sem caução; avarias durante o uso são de responsabilidade do contratante, conforme contrato.</p>

  <div class="legal">
    <span><b>Beba com moderação.</b> Venda proibida para menores de 18 anos.</span>
    <span>${SITE.email} · ${SITE.url.replace('https://', '')}</span>
  </div>
</section>

</body>
</html>`;

const htmlPath = join(SAIDA, 'proposta-frutvibes-eventos.html');
const pdfPath = join(SAIDA, 'proposta-frutvibes-eventos.pdf');
writeFileSync(htmlPath, html);

const navegador = NAVEGADORES.find((p) => existsSync(p));
if (!navegador) throw new Error('Chrome ou Edge não encontrado para gerar o PDF.');

execFileSync(navegador, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--virtual-time-budget=15000',
  `--print-to-pdf=${pdfPath}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`,
]);

console.log('PDF gerado:', pdfPath);
