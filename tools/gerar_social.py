"""Gera as artes para Instagram e TikTok (perfil, posts e stories).
Uso: python tools/gerar_social.py   ->  arquivos em social/
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'social')
CONCEITO = os.path.join(ROOT, 'Imagem do Codex 14 de set. de 2026, 23_00_43.png')
LOGO = os.path.join(ROOT, 'marca', 'frut_vibes_logo_preta')
PREVIEW = os.environ.get('FV_PREVIEW')
os.makedirs(OUT, exist_ok=True)

TEAL = (14, 79, 69)
TEAL_CLARO = (47, 143, 124)
CREME = (255, 249, 232)
TINTA = (16, 35, 31)
MOLDURA = (214, 204, 182)
LEGAL = 'BEBA COM MODERAÇÃO · VENDA PROIBIDA PARA MENORES DE 18 ANOS'

SABORES = [
    ('maca-verde', 'MAÇÃ VERDE', (520, 456, 700, 922), (63, 154, 43), CREME, 'Azedinha na medida'),
    ('limao', 'LIMÃO', (709, 456, 889, 922), (180, 210, 54), TINTA, 'O clássico que todo mundo pede'),
    ('abacaxi', 'ABACAXI', (898, 456, 1078, 922), (242, 195, 28), TINTA, 'Tropical e refrescante'),
    ('frutas-vermelhas', 'FRUTAS VERMELHAS', (1085, 456, 1265, 922), (196, 23, 78), CREME, 'A cor mais bonita da festa'),
    ('caipirinha', 'CAIPIRINHA', (1282, 456, 1462, 922), (19, 92, 77), CREME, 'A brasileira, agora com gás'),
]
BARRIL = (51, 366, 486, 940)
LINHA = (0, 400, 1536, 945)

conceito = Image.open(CONCEITO).convert('RGB')


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


def centro(d, y, texto, f, cor, largura):
    x = (largura - d.textlength(texto, font=f)) / 2
    d.text((x, y), texto, font=f, fill=cor)


def bolhas(d, cor, pontos):
    for (x, y, r) in pontos:
        d.ellipse((x - r, y - r, x + r, y + r), outline=cor, width=6)


def rodape_legal(d, largura, y, cor, tam=22):
    centro(d, y, LEGAL, fonte(tam), cor, largura)


# ---------------------------------------------------------------- foto de perfil
def perfil():
    T = 1080
    im = Image.new('RGB', (T, T), TEAL)
    d = ImageDraw.Draw(im)
    d.ellipse((-160, -160, T + 160, T + 160), outline=TEAL_CLARO, width=0)
    bolhas(d, TEAL_CLARO, [(190, 210, 46), (890, 250, 34), (250, 880, 30), (860, 850, 52)])
    lg = logo(CREME, 740)  # dentro do recorte circular do TikTok/Instagram
    im.paste(lg, ((T - lg.width) // 2, (T - lg.height) // 2 - 20), lg)
    centro(d, T // 2 + lg.height // 2 + 10, 'D R I N K S   G A S E I F I C A D O S', fonte(30), CREME, T)
    im.save(os.path.join(OUT, 'perfil-frutvibes.png'), optimize=True)
    return im


# ---------------------------------------------------------------- posts de sabor
def post_sabor(slug, nome, box, cor, txt, frase):
    W, H = 1080, 1350
    im = Image.new('RGB', (W, H), cor)
    d = ImageDraw.Draw(im)
    claro = tuple(min(255, c + 45) for c in cor)
    bolhas(d, claro, [(120, 170, 40), (960, 210, 28), (100, 1180, 32), (980, 1120, 46), (880, 120, 16)])

    lata = conceito.crop(box)
    esc = 760 / lata.height
    lata = lata.resize((round(lata.width * esc), 760), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    card = Image.new('RGB', (lata.width + 90, lata.height + 90), MOLDURA)
    cantos = Image.new('L', card.size, 0)
    ImageDraw.Draw(cantos).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), radius=48, fill=255)
    card.paste(lata, (45, 45))
    im.paste(card, ((W - card.width) // 2, 300), cantos)

    lg = logo(txt, 520)
    im.paste(lg, ((W - lg.width) // 2, 90), lg)
    centro(d, 1130, nome, fonte(66 if len(nome) < 14 else 52), txt, W)
    centro(d, 1215, frase, fonte(34, bold=False), txt, W)
    rodape_legal(d, W, 1295, txt)
    im.save(os.path.join(OUT, f'post-{slug}.png'), optimize=True)
    return im


# ---------------------------------------------------------------- post de lançamento
def post_lancamento():
    W, H = 1080, 1350
    im = Image.new('RGB', (W, H), TEAL)
    d = ImageDraw.Draw(im)
    bolhas(d, TEAL_CLARO, [(120, 200, 44), (950, 260, 30), (120, 1150, 34), (960, 1080, 50)])
    lg = logo(CREME, 820)
    im.paste(lg, ((W - lg.width) // 2, 130), lg)
    centro(d, 130 + lg.height + 20, 'D R I N K S   G A S E I F I C A D O S', fonte(32), CREME, W)

    linha = conceito.crop(LINHA)
    linha = linha.resize((W - 80, round((W - 80) * linha.height / linha.width)), Image.LANCZOS)
    cantos = Image.new('L', linha.size, 0)
    ImageDraw.Draw(cantos).rounded_rectangle((0, 0, linha.size[0] - 1, linha.size[1] - 1), radius=40, fill=255)
    im.paste(linha, (40, 620), cantos)

    centro(d, 520, 'VODKA + FRUTA, DIRETO DO BARRIL', fonte(40), CREME, W)
    rodape_legal(d, W, 1290, CREME)
    im.save(os.path.join(OUT, 'post-lancamento.png'), optimize=True)
    return im


# ---------------------------------------------------------------- post para bares/eventos
def post_eventos():
    W, H = 1080, 1350
    im = Image.new('RGB', (W, H), TEAL)
    d = ImageDraw.Draw(im)
    bolhas(d, TEAL_CLARO, [(130, 220, 40), (930, 180, 26), (140, 1160, 30), (950, 1100, 46)])
    barril = conceito.crop(BARRIL)
    esc = 700 / barril.height
    barril = barril.resize((round(barril.width * esc), 700), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 50, 2))
    card = Image.new('RGB', (barril.width + 80, barril.height + 80), MOLDURA)
    cantos = Image.new('L', card.size, 0)
    ImageDraw.Draw(cantos).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), radius=44, fill=255)
    card.paste(barril, (40, 40))
    im.paste(card, ((W - card.width) // 2, 330), cantos)

    lg = logo(CREME, 460)
    im.paste(lg, ((W - lg.width) // 2, 120), lg)
    centro(d, 1110, 'SEU EVENTO COM DRINK DE BARRIL', fonte(48), CREME, W)
    centro(d, 1185, 'Bares · Festas · Casamentos · Formaturas', fonte(32, bold=False), CREME, W)
    centro(d, 1240, 'www.frutvibes.com', fonte(34), CREME, W)
    rodape_legal(d, W, 1300, CREME)
    im.save(os.path.join(OUT, 'post-eventos.png'), optimize=True)
    return im


# ---------------------------------------------------------------- stories / capa de vídeo
def story(nome_arq, titulo, sub, recorte, cor=TEAL, txt=CREME):
    W, H = 1080, 1920
    im = Image.new('RGB', (W, H), cor)
    d = ImageDraw.Draw(im)
    claro = tuple(min(255, c + 45) for c in cor)
    bolhas(d, claro, [(140, 300, 46), (940, 360, 30), (150, 1650, 36), (930, 1600, 52)])
    lg = logo(txt, 700)
    im.paste(lg, ((W - lg.width) // 2, 220), lg)

    img = conceito.crop(recorte)
    esc = min(820 / img.height, (W - 160) / img.width)
    img = img.resize((round(img.width * esc), round(img.height * esc)), Image.LANCZOS)
    card = Image.new('RGB', (img.width + 80, img.height + 80), MOLDURA)
    cantos = Image.new('L', card.size, 0)
    ImageDraw.Draw(cantos).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), radius=46, fill=255)
    card.paste(img, (40, 40))
    im.paste(card, ((W - card.width) // 2, 560), cantos)

    centro(d, 1520, titulo, fonte(64), txt, W)
    centro(d, 1610, sub, fonte(36, bold=False), txt, W)
    rodape_legal(d, W, 1800, txt, 24)
    im.save(os.path.join(OUT, nome_arq), optimize=True)
    return im


artes = [perfil(), post_lancamento(), post_eventos()]
artes += [post_sabor(*s) for s in SABORES]
artes.append(story('story-lancamento.png', 'CHEGOU FRUTVIBES', 'Drinks gaseificados direto do barril', LINHA))
artes.append(story('story-eventos.png', 'BARRIL PARA O SEU EVENTO', 'www.frutvibes.com', BARRIL))

if PREVIEW:
    col, lin = 5, 2
    cel = (360, 560)
    folha = Image.new('RGB', (col * cel[0], lin * cel[1]), (210, 210, 210))
    for i, a in enumerate(artes):
        t = a.copy()
        t.thumbnail((cel[0] - 20, cel[1] - 20))
        folha.paste(t, ((i % col) * cel[0] + 10, (i // col) * cel[1] + 10))
    folha.save(PREVIEW)

print('artes geradas:', len(artes))
