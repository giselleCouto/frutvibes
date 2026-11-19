// Gera os textos de prospecção (primeiro contato e follow-up) a partir da lista de contatos.
// Uso: node tools/gerar_prospeccao.mjs
// Entrada:  comercial/contatos-bh-eventos.csv   (nome,cargo,empresa,email,observacao)
// Saída:    comercial/emails-prontos.md e comercial/followup-prontos.md
// Os dois arquivos de saída e a lista ficam fora do Git: têm dados pessoais de terceiros.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = JSON.parse(readFileSync(join(ROOT, 'conteudo', 'config.json'), 'utf8'));

const VENDEDOR = 'Higor Gama';
const TELEFONE = SITE.whatsapp
  ? `(${SITE.whatsapp.slice(2, 4)}) ${SITE.whatsapp.slice(4, 9)}-${SITE.whatsapp.slice(9)}`
  : '';
const ASSINATURA = `${VENDEDOR} — FrutVibes\n${TELEFONE} · ${SITE.email} · ${SITE.url.replace('https://', '')}`;
const PROPOSTA = `${SITE.url}/proposta.pdf`;

const entrada = join(ROOT, 'comercial', 'contatos-bh-eventos.csv');
if (!existsSync(entrada)) throw new Error(`Lista não encontrada: ${entrada}`);

const contatos = readFileSync(entrada, 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((linha) => {
    const [nome, cargo, empresa, email, observacao] = linha.split(',');
    return { nome, cargo, empresa, email, observacao };
  });

const primeiroNome = (nome) => nome.split(' ')[0];

const primeiroContato = (c) => `Olá, ${primeiroNome(c.nome)}, tudo bem?

Sou o ${VENDEDOR}, da FrutVibes, marca de drinks em barril da ${SITE.empresa}, aqui de ${SITE.cidade}. Procuro a ${c.empresa} porque o nosso produto resolve um gargalo clássico de evento grande: a fila do bar. São drinks de vodka com fruta e caipirinha, gaseificados, servidos direto da chopeira — o copo sai na velocidade do chopp, com o mesmo sabor do primeiro ao último convidado.

Três pontos que costumam pesar na decisão:
- Barris de 30 e 50 litros, misturando sabores como preferir
- Aluguel da chopeira incluso no valor, sem caução
- Entrega de até 1.000 litros por dia em ${SITE.cidade} e região

A proposta com os valores por barril está aqui: ${PROPOSTA}

Se fizer sentido, me diga a data e o tamanho do próximo evento que eu volto com a quantidade de barris e o orçamento fechado.

Abraço,
${ASSINATURA}

Se preferir não receber mais contatos nossos, responda este e-mail com "remover".`;

const followUp = (c) => `Oi, ${primeiroNome(c.nome)}, tudo bem?

Passando rapidinho para saber se a proposta da FrutVibes chegou até você.
Se quiser, eu calculo quantos barris o próximo evento da ${c.empresa} pede — é só me dizer o público estimado.

A proposta completa também está aqui: ${PROPOSTA}

Abraço,
${ASSINATURA}`;

const cabecalho = (titulo, aviso) => `# ${titulo}

${contatos.length} contatos de produtoras de eventos em ${SITE.cidade} e região metropolitana.
Vendedor: **${VENDEDOR}** · Proposta: ${PROPOSTA}

${aviso}

---

`;

writeFileSync(
  join(ROOT, 'comercial', 'emails-prontos.md'),
  cabecalho(
    'E-mails prontos para envio — produtoras de eventos',
    `**Ritmo sugerido:** 20 a 30 por dia. O domínio frutvibes.com é novo e disparar tudo de uma vez
pode marcar a marca como spam. Mande o link da proposta em vez de anexar o PDF: é mais leve e entrega melhor.`,
  ) +
    contatos
      .map(
        (c, i) => `## ${i + 1}. ${c.nome} — ${c.empresa}${c.observacao ? `\n\n> ⚠ ${c.observacao}` : ''}

**Para:** ${c.email}
**Assunto:** Drink em barril para os eventos da ${c.empresa}

${primeiroContato(c)}

---
`,
      )
      .join('\n'),
);

writeFileSync(
  join(ROOT, 'comercial', 'followup-prontos.md'),
  cabecalho(
    'Follow-up — quem não respondeu o primeiro e-mail',
    `Envie **4 ou 5 dias depois** do primeiro contato, e **só uma vez**. Quem não responder ao follow-up
sai da lista: insistir uma terceira vez queima a marca e aumenta a chance de cair em spam.
Responda no mesmo e-mail, para manter o histórico da conversa.`,
  ) +
    contatos
      .map(
        (c, i) => `## ${i + 1}. ${c.nome} — ${c.empresa}

**Para:** ${c.email}
**Assunto:** Re: Drink em barril para os eventos da ${c.empresa}

${followUp(c)}

---
`,
      )
      .join('\n'),
);

console.log(`ok — ${contatos.length} contatos, vendedor: ${VENDEDOR}`);
