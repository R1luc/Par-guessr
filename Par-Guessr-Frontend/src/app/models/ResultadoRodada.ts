export interface ResultadoRodada {
  rodadaId: number;
  numero: number;
  nomeLocal: string;
  imagemOriginalUrl: string;
  palpiteX: number;
  palpiteY: number;
  respostaX: number;
  respostaY: number;
  /** 0 a 100 */
  proximidadePct: number;
  /** Opcional: depende da escala da planta */
  distanciaM?: number;
  dicasUsadas: number;
  multiplicadorDicas: number;
  /** Pontos só pela proximidade */
  pontosBase: number;
  /** pontosBase × multiplicadorDicas */
  pontos: number;
  pontuacaoTotal: number;
  ultimaRodada: boolean;
}
 