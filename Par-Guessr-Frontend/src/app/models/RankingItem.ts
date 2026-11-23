export type PeriodoRanking = 'geral' | 'semana';
 
export interface RankingItem {
  posicao: number;
  usuarioId: number;
  nome: string;
  fotoUrl: string | null;
  melhorPontuacao: number;
  partidas: number;
}
 