const path = require('path');
const sharp = require('sharp');
const { imagensDir, jogo } = require('../config');
const { HttpError } = require('./erros');

// Fisher-Yates: sorteia a ordem em que os quadrados 0..8 serão revelados
function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Imagem inteira borrada + quadrados revelados (grade 3x3) nítidos
async function gerarImagemBorrada(imagemUrl, quadradosRevelados) {
  const caminho = path.join(imagensDir, path.basename(imagemUrl));
  try {
    const { data, info } = await sharp(caminho)
      .rotate() // respeita orientação EXIF de fotos de celular
      .resize({ width: 1280, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    const { width: w, height: h } = info;
    const fundo = await sharp(data).blur(jogo.blurSigma).toBuffer();

    const tw = Math.floor(w / 3);
    const th = Math.floor(h / 3);
    const camadas = [];

    for (const idx of quadradosRevelados) {
      const col = idx % 3;
      const lin = Math.floor(idx / 3);
      const left = col * tw;
      const top = lin * th;
      const width = col === 2 ? w - left : tw;
      const height = lin === 2 ? h - top : th;
      const recorte = await sharp(data).extract({ left, top, width, height }).toBuffer();
      camadas.push({ input: recorte, left, top });
    }

    return await sharp(fundo).composite(camadas).jpeg({ quality: 80 }).toBuffer();
  } catch (erro) {
    console.error('Erro ao gerar imagem:', erro.message);
    throw new HttpError(500, 'Não foi possível carregar a imagem do local.');
  }
}

module.exports = { embaralhar, gerarImagemBorrada };
