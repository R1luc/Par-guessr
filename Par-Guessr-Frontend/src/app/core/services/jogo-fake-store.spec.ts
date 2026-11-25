import { calcularProximidade } from './jogo-fake-store';
import { distanciaMapa, DIMENSOES_PLANTA } from '../../models/Rodada';

describe('calcularProximidade', () => {
  it('mantém a pontuação máxima dentro da margem definida', () => {
    expect(calcularProximidade(0)).toBe(1);
    expect(calcularProximidade(0.013)).toBe(1);
  });

  it('reduz a proximidade de forma suave entre a margem máxima e o limite parcial', () => {
    expect(calcularProximidade(0.104)).toBeCloseTo(0.75);
  });

  it('zera a proximidade no limite parcial e além dele', () => {
    expect(calcularProximidade(0.195)).toBe(0);
    expect(calcularProximidade(0.4)).toBe(0);
  });
});

describe('distanciaMapa', () => {
  it('mede deslocamentos iguais em pixels com a mesma distância', () => {
    const distanciaHorizontal = distanciaMapa({ x: 0, y: 0 }, { x: 0.1, y: 0 });
    const distanciaVertical = distanciaMapa(
      { x: 0, y: 0 },
      { x: 0, y: (0.1 * DIMENSOES_PLANTA.largura) / DIMENSOES_PLANTA.altura },
    );

    expect(distanciaHorizontal).toBeCloseTo(distanciaVertical);
    expect(distanciaVertical).toBeCloseTo(
      (0.1 * DIMENSOES_PLANTA.largura) / DIMENSOES_PLANTA.altura,
    );
  });
});
