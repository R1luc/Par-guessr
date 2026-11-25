/** Estado da imagem e das dicas em uma rodada. Nunca contém a resposta. */
export interface EstadoDicas {
  /** Imagem no nível de revelação atual */
  imagemUrl: string;
  nivelRevelacao: number;
  dicasUsadas: number;
  maxDicas: number;
  /** 1.0 sem dicas; diminui a cada dica */
  multiplicadorAtual: number;
  /** null quando não há mais dicas */
  multiplicadorProximaDica: number | null;
}

export interface Rodada extends EstadoDicas {
  rodadaId: number;
  numero: number;
  totalRodadas: number;
}

/** Posição na planta, normalizada de 0 a 1 (origem: canto superior esquerdo). */
export interface PontoMapa {
  x: number;
  y: number;
}

export const DIMENSOES_PLANTA = { largura: 2198, altura: 3569 } as const;

/** Distância em frações da altura da planta, preservando sua proporção original. */
export function distanciaMapa(a: PontoMapa, b: PontoMapa): number {
  const deltaX = ((a.x - b.x) * DIMENSOES_PLANTA.largura) / DIMENSOES_PLANTA.altura;
  const deltaY = a.y - b.y;
  return Math.hypot(deltaX, deltaY);
}

export type PalpiteRequest = PontoMapa;