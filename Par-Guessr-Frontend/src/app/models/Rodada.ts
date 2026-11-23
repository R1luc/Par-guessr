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

export type PalpiteRequest = PontoMapa;