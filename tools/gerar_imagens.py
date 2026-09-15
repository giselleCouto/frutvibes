"""Gera as imagens otimizadas do site a partir do conceito visual e dos logos.
Uso: python tools/gerar_imagens.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'static', 'assets', 'img')
STATIC = os.path.join(ROOT, 'static')
CONCEITO = os.path.join(ROOT, 'Imagem do Codex 14 de set. de 2026, 23_00_43.png')
LOGO_PRETA = os.path.join(ROOT, 'marca', 'frut_vibes_logo_preta')
PREVIEW = os.environ.get('FV_PREVIEW')  # caminho opcional para uma prancha de conferência
os.makedirs(OUT, exist_ok=True)

TEAL = (14, 79, 69)
CREME = (255, 249, 232)
TINTA = (16, 35, 31)
MOLDURA = (214, 204, 182)  # tom da parede ao fundo das latas no conceito

SABORES = {
    'maca-verde':       {'box': (520, 456, 700, 922),   'cor': (63, 154, 43),  'txt': CREME, 'nome': 'Maçã Verde',       'base': 'VODKA + FRUTA'},
    'limao':            {'box': (709, 456, 889, 922),   'cor': (180, 210, 54), 'txt': TINTA, 'nome': 'Limão',            'base': 'VODKA + FRUTA'},
    'abacaxi':          {'box': (898, 456, 1078, 922),  'cor': (242, 195, 28), 'txt': TINTA, 'nome': 'Abacaxi',          'base': 'VODKA + FRUTA'},
    'frutas-vermelhas': {'box': (1085, 456, 1265, 922), 'cor': (196, 23, 78),  'txt': CREME, 'nome': 'Frutas Vermelhas', 'base': 'VODKA + FRUTA'},
    'caipirinha':       {'box': (1282, 456, 1462, 922), 'cor': (19, 92, 77),   'txt': CREME, 'nome': 'Caipirinha',       'base': 'CAIPIRINHA GASEIFICADA'},
}
BARRIL_BOX = (51, 366, 486, 940)
HERO_BOX = (0, 360, 1536, 950)


def fonte(tam, bold=True):
    for f in (['segoeuib.ttf', 'arialbd.ttf'] if bold else ['segoeui.ttf', 'arial.ttf']):
        try:
            return ImageFont.truetype(os.path.join(r'C:\Windows\Fonts', f), tam)
        except OSError:
            pass
    return ImageFont.load_default()


def logo(cor, largura):
    a = Image.open(LOGO_PRETA).getchannel('A')
    a = a.crop(a.getbbox())
    im = Image.new('RGBA', a.size, cor + (255,))
    im.putalpha(a)
    return im.resize((largura, round(largura * a.height / a.width)), Image.LANCZOS)


conceito = Image.open(CONCEITO).convert('RGB')
print('moldura (amostras):', [conceito.getpixel(p) for p in [(705, 700), (893, 700), (1081, 700), (1273, 700), (1500, 600)]])

# Logos
for nome, cor in (('creme', CREME), ('preta', TINTA)):
    logo(cor, 1000).save(os.path.join(OUT, f'logo-{nome}.webp'), quality=92, method=6)
    logo(cor, 600).save(os.path.join(OUT, f'logo-{nome}.png'), optimize=True)

# Hero (linha de produtos)
hero = conceito.crop(HERO_BOX)
hero.save(os.path.join(OUT, 'linha-frutvibes.webp'), quality=82, method=6)
hero.resize((768, round(768 * hero.height / hero.width)), Image.LANCZOS).save(os.path.join(OUT, 'linha-frutvibes-768.webp'), quality=82, method=6)

# Latas e barril
for slug, s in SABORES.items():
    lata = conceito.crop(s['box'])
    lata = lata.resize((lata.width * 2, lata.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    lata.save(os.path.join(OUT, f'lata-{slug}.webp'), quality=86, method=6)
barril = conceito.crop(BARRIL_BOX)
barril = barril.resize((round(barril.width * 1.5), round(barril.height * 1.5)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 50, 2))
barril.save(os.path.join(OUT, 'barril-frutvibes.webp'), quality=84, method=6)

# Favicon: a letra "F" do logo, em creme sobre verde-petróleo
alpha = Image.open(LOGO_PRETA).getchannel('A')
mask = alpha.point(lambda v: 255 if v > 128 else 0)
seed = next(((x, y) for y in range(300, 420, 3) for x in range(250, 380, 3) if mask.getpixel((x, y)) == 255))
ImageDraw.floodfill(mask, seed, 128)
f_mask = mask.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(7))
f_alpha = Image.composite(alpha, Image.new('L', alpha.size, 0), f_mask)
f_alpha = f_alpha.crop(f_alpha.getbbox())
print('letra F:', f_alpha.size)


def icone(tam, raio_frac=0.22, margem=0.14):
    base = Image.new('RGBA', (tam, tam), (0, 0, 0, 0))
    ImageDraw.Draw(base).rounded_rectangle((0, 0, tam - 1, tam - 1), radius=round(tam * raio_frac), fill=TEAL + (255,))
    area = round(tam * (1 - 2 * margem))
    esc = min(area / f_alpha.width, area / f_alpha.height)
    a = f_alpha.resize((round(f_alpha.width * esc), round(f_alpha.height * esc)), Image.LANCZOS)
    letra = Image.new('RGBA', a.size, CREME + (255,))
    letra.putalpha(a)
    base.alpha_composite(letra, ((tam - a.width) // 2, (tam - a.height) // 2))
    return base


icone(512).save(os.path.join(OUT, 'icon-512.png'), optimize=True)
icone(192).save(os.path.join(OUT, 'icon-192.png'), optimize=True)
icone(96).save(os.path.join(OUT, 'favicon-96.png'), optimize=True)
icone(180, raio_frac=0, margem=0.16).save(os.path.join(STATIC, 'apple-touch-icon.png'), optimize=True)
icone(256).save(os.path.join(STATIC, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# Imagens de compartilhamento (Open Graph 1200x630)
W, H = 1200, 630


def bolhas(d, cor):
    for (x, y, r) in [(1165, 60, 22), (1150, 118, 10), (40, 590, 28), (690, 70, 14), (720, 560, 20)]:
        d.ellipse((x - r, y - r, x + r, y + r), outline=cor, width=5)


def og_produto(nome_arq, cor, txt, titulo, sub, base, img):
    og = Image.new('RGB', (W, H), cor)
    d = ImageDraw.Draw(og)
    claro = tuple(min(255, c + 40) for c in cor)
    bolhas(d, claro)
    d.rounded_rectangle((770, 40, 1130, 590), radius=40, fill=MOLDURA)
    esc = min(500 / img.height, 320 / img.width)
    im = img.resize((round(img.width * esc), round(img.height * esc)), Image.LANCZOS)
    og.paste(im, (950 - im.width // 2, 315 - im.height // 2))
    lg = logo(txt, 600)
    og.paste(lg, (70, 95), lg)
    d.text((74, 300), titulo, font=fonte(76 if len(titulo) < 14 else 60), fill=txt)
    d.text((76, 400), sub, font=fonte(34, bold=False), fill=txt)
    d.text((76, 462), base, font=fonte(24), fill=txt)
    d.text((76, 560), 'Beba com moderação. Venda proibida para menores de 18 anos.', font=fonte(20, bold=False), fill=txt)
    og.save(os.path.join(OUT, nome_arq), quality=86, optimize=True, progressive=True)
    return og


ogs = []
for slug, s in SABORES.items():
    ogs.append(og_produto(f'og-{slug}.jpg', s['cor'], s['txt'], s['nome'], 'Drink gaseificado direto do barril', s['base'], conceito.crop(s['box'])))
ogs.append(og_produto('og-barril.jpg', TEAL, CREME, 'Barril para eventos', 'Drinks gaseificados para bares e festas', '5 SABORES · PRONTO PARA SERVIR', conceito.crop(BARRIL_BOX)))

# OG da home: conceito inteiro (sem a legenda de rodapé) sobre fundo desfocado
c = conceito.crop((0, 0, 1536, 935))
fundo = c.resize((W, round(W * c.height / c.width)), Image.LANCZOS)
topo = (fundo.height - H) // 2
fundo = fundo.crop((0, topo, W, topo + H)).filter(ImageFilter.GaussianBlur(28))
frente = c.resize((round(H * c.width / c.height), H), Image.LANCZOS)
fundo.paste(frente, ((W - frente.width) // 2, 0))
fundo.save(os.path.join(OUT, 'og-home.jpg'), quality=86, optimize=True, progressive=True)
ogs.insert(0, fundo)

if PREVIEW:
    folha = Image.new('RGB', (1830, 1700), (200, 200, 200))
    x = 10
    for slug in SABORES:
        im = Image.open(os.path.join(OUT, f'lata-{slug}.webp'))
        im.thumbnail((250, 650))
        folha.paste(im, (x, 10))
        x += 260
    b = Image.open(os.path.join(OUT, 'barril-frutvibes.webp'))
    b.thumbnail((450, 650))
    folha.paste(b, (x, 10))
    ic = Image.open(os.path.join(OUT, 'icon-192.png'))
    folha.paste(ic, (x + 460, 10), ic)
    for i, og in enumerate(ogs):
        t = og.copy()
        t.thumbnail((600, 315))
        folha.paste(t, (10 + (i % 3) * 605, 680 + (i // 3) * 325))
    folha.save(PREVIEW)
print('ok')
