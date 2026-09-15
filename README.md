# Site FrutVibes

Site estático e otimizado para o Google da FrutVibes, drinks gaseificados à base de vodka (Maçã Verde, Limão, Abacaxi, Frutas Vermelhas) e Caipirinha gaseificada, em barril.

## Estrutura

```
build.mjs              -> gerador do site: textos, sabores, FAQ e CONFIGURAÇÃO (domínio, WhatsApp, etc.)
static/                -> arquivos copiados como estão (CSS, JS, imagens, favicon)
tools/gerar_imagens.py -> recorta latas/barril do conceito visual e gera logos, favicon e imagens de compartilhamento
marca/                 -> logos originais
public/                -> SITE PRONTO (é esta pasta que vai para a hospedagem)
```

Páginas geradas:

| URL | Conteúdo |
| --- | --- |
| `/` | Início |
| `/sabores/` | Todos os sabores |
| `/sabores/maca-verde/`, `/limao/`, `/abacaxi/`, `/frutas-vermelhas/`, `/caipirinha/` | Uma página por sabor |
| `/barril-para-eventos/` | Barril para bares, festas e eventos |
| `/sobre/` · `/perguntas-frequentes/` · `/contato/` · `/privacidade/` | Institucionais |

Também são gerados `sitemap.xml`, `robots.txt`, `site.webmanifest` e `404.html`.

## Como editar e gerar

1. Abra `build.mjs` e preencha o bloco `SITE` (domínio, e-mail, WhatsApp, Instagram, cidade/estado).
2. Textos dos sabores, perguntas frequentes e ocasiões ficam logo abaixo, em `SABORES`, `FAQ` e `OCASIOES`.
3. Gere o site:

```bash
node build.mjs
```

Se trocar as imagens de origem (conceito ou logos), rode antes `python tools/gerar_imagens.py` (precisa do Pillow).

Para ver no computador: `python -m http.server 8080 --directory public` e abra http://localhost:8080.

## Publicar (GitHub Pages + domínio GoDaddy)

O site é publicado automaticamente em **https://www.frutvibes.com**. A cada `git push` na branch `main`, o GitHub Actions (`.github/workflows/publicar-site.yml`) roda `node build.mjs` e publica a pasta `public/` no GitHub Pages. Dá para acompanhar na aba **Actions** do repositório.

### Configuração única no GitHub

1. Repositório → **Settings → Pages** → em *Build and deployment*, *Source*: **GitHub Actions**.
2. Aba **Actions** → workflow **Publicar site** → **Run workflow** (ou faça qualquer push).
3. Volte em **Settings → Pages** → *Custom domain*: `www.frutvibes.com` → **Save**.
4. Depois que o DNS propagar e o certificado sair (até 24 h), marque **Enforce HTTPS**.

Recomendado: em **github.com/settings/pages** (configurações da sua conta), clique em *Add a domain* e verifique `frutvibes.com` com o registro TXT que o GitHub mostrar. Isso impede que outra conta use o seu domínio.

### DNS na GoDaddy

GoDaddy → **Meus produtos → frutvibes.com → DNS**. Apague os registros `A` com nome `@` e o `CNAME` com nome `www` que já existirem (normalmente apontam para a página de estacionamento da GoDaddy, "Parked") e crie:

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | gisellecouto.github.io |

Não mexa nos registros `NS`, `SOA` nem nos de e-mail (`MX`, `TXT`), se houver. Com isso, `frutvibes.com` redireciona para `www.frutvibes.com`.

> O site usa caminhos a partir da raiz (`/assets/...`), então ele só aparece corretamente no domínio próprio, não no endereço `gisellecouto.github.io/frutvibes`.

## Colocar no Google (passo a passo)

1. **Publique o site no domínio definitivo** e confira se `SITE.url` no `build.mjs` é exatamente esse endereço (com ou sem `www`, sempre `https`).
2. **Google Search Console** (search.google.com/search-console): adicione a propriedade do domínio.
   - Verificação por DNS (recomendado) ou copie o código da meta tag para `SITE.googleSiteVerification`, gere e publique de novo.
3. Em **Sitemaps**, envie `https://SEU-DOMINIO/sitemap.xml`.
4. Em **Inspeção de URL**, cole a página inicial e clique em **Solicitar indexação**. Repita para as páginas dos sabores e do barril.
5. Crie o **Perfil da Empresa no Google** (business.google.com) com o link do site. Isso ajuda muito nas buscas locais ("drink em barril perto de mim").
6. Coloque o link do site na bio do Instagram, no WhatsApp Business e em parceiros (bares, casas de evento, fornecedores). Links de outros sites aceleram a indexação.

A primeira indexação costuma levar de alguns dias a poucas semanas.

## O que já está pronto para SEO

- Título e descrição únicos por página, com termos de busca como "drink de vodka em barril", "caipirinha gaseificada", "chopp de drink".
- URLs amigáveis, `canonical`, `sitemap.xml` e `robots.txt`.
- Dados estruturados (schema.org): Organization, WebSite, Product (cada sabor), Service (barril), FAQPage e BreadcrumbList.
- Imagens de compartilhamento (WhatsApp, Instagram, Facebook) próprias para cada sabor.
- HTML semântico, textos alternativos nas imagens, site leve (sem frameworks) e responsivo.
- Confirmação de maioridade que não esconde o conteúdo dos buscadores.

Observação: o Search Console pode avisar que falta "offers" (preço) nos produtos. É esperado enquanto não houver venda online e não impede a indexação. Quando houver preço, dá para incluir.

## Obrigações legais já incluídas

- "Beba com moderação", "Venda proibida para menores de 18 anos" e "Se beber, não dirija" em todas as páginas.
- Confirmação de idade na entrada do site.
- Política de privacidade (LGPD).

Revise com o contador ou o jurídico as regras do CONAR para publicidade de bebidas alcoólicas antes de campanhas pagas.
