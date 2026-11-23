export type StatusPartida = 'EM_ANDAMENTO' | 'FINALIZADA';

export interface Partida {
  id: number;
  /** Fixo para todas as partidas; definido pelo back */
  qtdRodadas: number;
  status: StatusPartida;
  pontuacaoTotal: number;
  iniciadaEm: string;
}

export interface ResumoRodada {
  numero: number;
  nomeLocal: string;
  proximidadePct: number;
  dicasUsadas: number;
  pontos: number;
}

export interface ResumoPartida {
  partidaId: number;
  status: StatusPartida;
  pontuacaoTotal: number;
  posicaoRanking: number | null;
  rodadas: ResumoRodada[];
}

export interface HistoricoItem {
  partidaId: number;
  iniciadaEm: string;
  qtdRodadas: number;
  pontuacaoTotal: number;
  status: StatusPartida;
}

export interface Historico {
  total: number;
  itens: HistoricoItem[];
}