// Servidor de login do painel (/admin) — ponte OAuth entre o Decap CMS e o GitHub.
// Sem dependências: só Node. Variáveis necessárias no Railway:
//   GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET (do OAuth App do GitHub)
//   GITHUB_SCOPE       opcional: "repo" para repositório privado (padrão: public_repo,user)
//   ORIGEM_PERMITIDA   opcional: site que pode usar este login (padrão: https://www.frutvibes.com)
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const PORTA = process.env.PORT || 3000;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const SCOPE = process.env.GITHUB_SCOPE || 'public_repo,user';
const ORIGEM = (process.env.ORIGEM_PERMITIDA || 'https://www.frutvibes.com').replace(/\/$/, '');
const COOKIE = 'fv_oauth_state';

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const baseDe = (req) => {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return `${proto}://${host}`;
};

const pagina = (titulo, corpo, status = 200, res) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>body{font-family:system-ui,sans-serif;background:#0E4F45;color:#FFF9E8;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:1.5rem}p{max-width:34rem;line-height:1.6}</style>
</head><body><div>${corpo}</div></body></html>`);
};

// Página do popup: devolve o token para o painel pelo protocolo do Decap CMS
const paginaRetorno = (resultado, carga, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Entrando no painel…</title>
<style>body{font-family:system-ui,sans-serif;background:#0E4F45;color:#FFF9E8;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}</style>
<script>
  (function () {
    var mensagem = 'authorization:github:${resultado}:' + ${JSON.stringify(JSON.stringify(carga))};
    var destino = ${JSON.stringify(ORIGEM)};
    function responder() {
      if (!window.opener) { document.body.textContent = 'Abra o painel em ${esc(ORIGEM)}/admin/ e tente de novo.'; return; }
      window.opener.postMessage(mensagem, destino);
    }
    window.addEventListener('message', function ouvir() {
      window.removeEventListener('message', ouvir, false);
      responder();
    }, false);
    if (window.opener) window.opener.postMessage('authorizing:github', destino);
    // Rede lenta ou mensagem perdida: tenta de novo uma vez
    setTimeout(responder, 1500);
  })();
</script></head><body><p>Entrando no painel…</p></body></html>`);
};

const trocarCodigoPorToken = async (code, redirect_uri) => {
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri }),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok || !dados.access_token) {
    throw new Error(dados.error_description || dados.error || `GitHub respondeu ${r.status}`);
  }
  return dados.access_token;
};

createServer(async (req, res) => {
  const url = new URL(req.url, baseDe(req));
  // Sem parâmetros extras: o GitHub exige que seja idêntico ao endereço cadastrado no app
  const redirect_uri = `${baseDe(req)}/callback`;

  if (url.pathname === '/saude') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end(CLIENT_ID && CLIENT_SECRET ? 'ok' : 'faltam GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET');
  }

  if (url.pathname === '/auth') {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return pagina('Login não configurado', '<p>Faltam as variáveis <code>GITHUB_CLIENT_ID</code> e <code>GITHUB_CLIENT_SECRET</code> neste serviço do Railway.</p>', 500, res);
    }
    const state = randomBytes(16).toString('hex');
    const destino = new URL('https://github.com/login/oauth/authorize');
    destino.searchParams.set('response_type', 'code');
    destino.searchParams.set('client_id', CLIENT_ID);
    destino.searchParams.set('redirect_uri', redirect_uri);
    destino.searchParams.set('scope', SCOPE);
    destino.searchParams.set('state', state);
    res.writeHead(302, {
      location: destino.toString(),
      'set-cookie': `${COOKIE}=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'cache-control': 'no-store',
    });
    return res.end();
  }

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const salvo = (req.headers.cookie || '').match(new RegExp(`${COOKIE}=([a-f0-9]+)`))?.[1];
    res.setHeader('set-cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);

    if (!code) return paginaRetorno('error', { message: 'O GitHub não enviou o código de autorização.' }, res);
    if (!state || state !== salvo) return paginaRetorno('error', { message: 'Sessão de login expirada. Feche a janela e tente de novo.' }, res);
    try {
      const token = await trocarCodigoPorToken(code, redirect_uri);
      return paginaRetorno('success', { token, provider: 'github' }, res);
    } catch (e) {
      return paginaRetorno('error', { message: `Falha ao autenticar no GitHub: ${e.message}` }, res);
    }
  }

  return pagina('Login do painel FrutVibes', `<p>Este endereço só serve para o login do painel.<br>O painel fica em <a style="color:#F2C31C" href="${esc(ORIGEM)}/admin/">${esc(ORIGEM)}/admin/</a>.</p>`, 404, res);
}).listen(PORTA, () => console.log(`login do painel ouvindo na porta ${PORTA}`));
