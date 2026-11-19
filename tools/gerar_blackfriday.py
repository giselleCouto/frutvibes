"""Arte de Black Friday da FrutVibes para status do WhatsApp (1080x1920).
Usa a mesma linguagem das outras artes: logo, bolhas, moldura e aviso legal.
Uso: python tools/gerar_blackfriday.py   ->  social/story-blackfriday.png
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'social')
CONCEITO = os.path.join(ROOT, 'Imagem do Codex 14 de set. de 2026, 23_00_43.png')
LOGO = os.path.join(ROOT, 'marca', 'frut_vibes_logo_preta')
os.makedirs(OUT, exist_ok=True)

PRETO = (10, 18, 16)        # fundo de Black Friday, puxando para o verde da marca
TEAL_CLARO = (47, 143, 124)
CREME = (255, 249, 232)
MOLDURA = (214, 204, 182)
DESTAQUE = (242, 195, 28)   # o amarelo do abacaxi, para o número saltar
LEGAL = 'BEBA COM MODERAÇÃO · VENDA PROIBIDA PARA MENORES DE 18 ANOS'
SO_PROMO = (700, 440, 1086, 940)  # só as latas de limão e abacaxi, que são as da promoção

W, H = 1080, 1920


def fonte(tam, bold=True):
    for f in (['segoeuib.ttf', 'arialbd.ttf'] if bold else ['segoeui.ttf', 'arial.ttf']):
        try:
            return ImageFont.truetype(os.path.join(r'C:\Windows\Fonts', f), tam)
        except OSError:
            pass
    return ImageFont.load_default()


def logo(cor, largura):
    a = Image.open(LOGO).getchannel('A')
    a = a.crop(a.getbbox())
    im = Image.new('RGBA', a.size, cor + (255,))
    im.putalpha(a)
    return im.resize((largura, round(largura * a.height / a.width)), Image.LANCZOS)


def centro(d, y, texto, f, cor):
    d.text(((W - d.textlength(texto, font=f)) / 2, y), texto, font=f, fill=cor)


def gerar():
    im = Image.new('RGB', (W, H), PRETO)
    d = ImageDraw.Draw(im)
    for (x, y, r) in [(140, 300, 46), (940, 360, 30), (150, 1680, 36), (930, 1620, 52)]:
        d.ellipse((x - r, y - r, x + r, y + r), outline=TEAL_CLARO, width=6)

    lg = logo(CREME, 620)
    im.paste(lg, ((W - lg.width) // 2, 150), lg)

    # Faixa "BLACK FRIDAY"
    f_faixa = fonte(54)
    larg = d.textlength('B L A C K   F R I D A Y', font=f_faixa)
    d.rounded_rectangle(((W - larg) / 2 - 46, 400, (W + larg) / 2 + 46, 490), radius=45, fill=CREME)
    centro(d, 414, 'B L A C K   F R I D A Y', f_faixa, PRETO)

    # O número, que é o que para o dedo
    centro(d, 540, 'ATÉ', fonte(52), CREME)
    centro(d, 600, '15% OFF', fonte(190), DESTAQUE)
    centro(d, 830, 'NOS BARRIS DE LIMÃO E ABACAXI', fonte(40), CREME)

    # A foto do produto
    img = Image.open(CONCEITO).convert('RGB').crop(SO_PROMO)
    esc = min(410 / img.height, (W - 560) / img.width)
    img = img.resize((round(img.width * esc), round(img.height * esc)), Image.LANCZOS)
    card = Image.new('RGB', (img.width + 70, img.height + 70), MOLDURA)
    cantos = Image.new('L', card.size, 0)
    ImageDraw.Draw(cantos).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), radius=44, fill=255)
    card.paste(img, (35, 35))
    im.paste(card, ((W - card.width) // 2, 930), cantos)

    centro(d, 1430, 'Quanto mais barris, maior o desconto', fonte(38, bold=False), CREME)
    centro(d, 1490, 'Até 27 de novembro · Entrega na Grande BH', fonte(34, bold=False), TEAL_CLARO)

    centro(d, 1580, 'CHAMA NO WHATSAPP', fonte(46), DESTAQUE)
    centro(d, 1645, '31 98227-5760', fonte(62), CREME)
    centro(d, 1730, 'www.frutvibes.com', fonte(34, bold=False), TEAL_CLARO)

    centro(d, 1840, LEGAL, fonte(24), CREME)

    caminho = os.path.join(OUT, 'story-blackfriday.png')
    im.save(caminho, optimize=True)
    print('gerado:', caminho, im.size)


if __name__ == '__main__':
    gerar()
