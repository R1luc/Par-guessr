import { Injectable } from '@angular/core';
import { Partida, ResumoPartida } from '../../models/Partida';
import { EstadoDicas, PontoMapa, Rodada } from '../../models/Rodada';
import { ResultadoRodada } from '../../models/ResultadoRodada';

/** Constantes que no back real ficam no servidor. */
export const NUM_RODADAS = 5;
export const MAX_DICAS = 3;
const DIST_MAX_NORM = 0.25;
const PASSO_MULTIPLICADOR = 0.2;

interface LocalFake {
  id: number;
  nome: string;
  x: number;
  y: number;
}

interface RodadaFake {
  id: number;
  numero: number;
  local: LocalFake;
  dicasUsadas: number;
  resultado: ResultadoRodada | null;
}

interface PartidaFake {
  partida: Partida;
  rodadas: RodadaFake[];
}

/** Erro no mesmo formato da API ({ erro, mensagem }). */
export interface ErroApi {
  erro: string;
  mensagem: string;
}

const LOCAIS: LocalFake[] = [
  { id: 1, nome: 'Biblioteca Central', x: 0.43, y: 0.64 },
  { id: 2, nome: 'Restaurante Universitário', x: 0.18, y: 0.3 },
  { id: 3, nome: 'Bloco A', x: 0.7, y: 0.22 },
  { id: 4, nome: 'Quadra Poliesportiva', x: 0.85, y: 0.78 },
  { id: 5, nome: 'Auditório', x: 0.55, y: 0.4 },
  { id: 6, nome: 'Laboratório de Informática', x: 0.3, y: 0.8 },
  { id: 7, nome: 'Cantina', x: 0.12, y: 0.6 },
  { id: 8, nome: 'Portaria Principal', x: 0.5, y: 0.93 },
];

/**
 * Backend simulado em memória. Enquanto o back real não existe, PartidaService e
 * RodadaService usam esta classe. Os dados ficam no localStorage do navegador.
 */
@Injectable({ providedIn: 'root' })
export class JogoFakeStore {
  private readonly chave = 'par-guessr-fake-jogo';
  private readonly partidas = new Map<number, PartidaFake>();
  private proximoId = 1;

  constructor() {
    this.carregar();
  }

  criarPartida(): Partida {
    const id = this.proximoId++;
    const sorteados = [...LOCAIS].sort(() => Math.random() - 0.5).slice(0, NUM_RODADAS);
    const partida: Partida = {
      id,
      qtdRodadas: NUM_RODADAS,
      status: 'EM_ANDAMENTO',
      pontuacaoTotal: 0,
      iniciadaEm: new Date().toISOString(),
    };
    const rodadas: RodadaFake[] = sorteados.map((local, i) => ({
      id: id * 100 + (i + 1),
      numero: i + 1,
      local,
      dicasUsadas: 0,
      resultado: null,
    }));
    this.partidas.set(id, { partida, rodadas });
    this.salvar();
    return { ...partida };
  }

  rodadaAtual(partidaId: number): Rodada {
    const p = this.obterPartida(partidaId);
    const rodada = p.rodadas.find((r) => r.resultado === null);
    if (!rodada) {
      throw this.erro('PARTIDA_FINALIZADA', 'Não há mais rodadas nesta partida.');
    }
    return {
      rodadaId: rodada.id,
      numero: rodada.numero,
      totalRodadas: p.partida.qtdRodadas,
      ...this.estadoDicas(rodada),
    };
  }

  pedirDica(rodadaId: number): EstadoDicas {
    const rodada = this.obterRodada(rodadaId);
    if (rodada.resultado) {
      throw this.erro('RODADA_JA_FINALIZADA', 'A rodada já foi respondida.');
    }
    if (rodada.dicasUsadas >= MAX_DICAS) {
      throw this.erro('SEM_DICAS_RESTANTES', 'Não há mais dicas nesta rodada.');
    }
    rodada.dicasUsadas++;
    this.salvar();
    return this.estadoDicas(rodada);
  }

  enviarPalpite(rodadaId: number, ponto: PontoMapa): ResultadoRodada {
    const rodada = this.obterRodada(rodadaId);
    if (rodada.resultado) {
      throw this.erro('RODADA_JA_FINALIZADA', 'A rodada já foi respondida.');
    }
    const p = this.obterPartida(Math.floor(rodadaId / 100));

    const distancia = Math.hypot(ponto.x - rodada.local.x, ponto.y - rodada.local.y);
    const proximidade = Math.max(0, 1 - distancia / DIST_MAX_NORM);
    const pontosBase = Math.round(1000 * proximidade);
    const multiplicador = this.multiplicador(rodada.dicasUsadas);
    const pontos = Math.round(pontosBase * multiplicador);

    p.partida.pontuacaoTotal += pontos;
    const ultimaRodada = rodada.numero === p.partida.qtdRodadas;
    if (ultimaRodada) {
      p.partida.status = 'FINALIZADA';
    }

    const resultado: ResultadoRodada = {
      rodadaId: rodada.id,
      numero: rodada.numero,
      nomeLocal: rodada.local.nome,
      imagemOriginalUrl: this.imagemUrl(rodada.local, MAX_DICAS + 1),
      palpiteX: ponto.x,
      palpiteY: ponto.y,
      respostaX: rodada.local.x,
      respostaY: rodada.local.y,
      proximidadePct: Math.round(proximidade * 1000) / 10,
      dicasUsadas: rodada.dicasUsadas,
      multiplicadorDicas: multiplicador,
      pontosBase,
      pontos,
      pontuacaoTotal: p.partida.pontuacaoTotal,
      ultimaRodada,
    };
    rodada.resultado = resultado;
    this.salvar();
    return resultado;
  }

  resumo(partidaId: number): ResumoPartida {
    const p = this.obterPartida(partidaId);
    return {
      partidaId,
      status: p.partida.status,
      pontuacaoTotal: p.partida.pontuacaoTotal,
      posicaoRanking: null,
      rodadas: p.rodadas
        .filter((r) => r.resultado !== null)
        .map((r) => ({
          numero: r.numero,
          nomeLocal: r.local.nome,
          proximidadePct: r.resultado!.proximidadePct,
          dicasUsadas: r.dicasUsadas,
          pontos: r.resultado!.pontos,
        })),
    };
  }

  /** Guarda o estado no navegador para sobreviver a recarregamentos (só no fake). */
  private salvar(): void {
    try {
      const dados = { proximoId: this.proximoId, partidas: [...this.partidas.values()] };
      localStorage.setItem(this.chave, JSON.stringify(dados));
    } catch {
      // armazenamento indisponível ou cheio: segue só em memória
    }
  }

  private carregar(): void {
    try {
      const bruto = localStorage.getItem(this.chave);
      if (!bruto) {
        return;
      }
      const dados = JSON.parse(bruto) as { proximoId: number; partidas: PartidaFake[] };
      this.proximoId = dados.proximoId;
      for (const p of dados.partidas) {
        this.partidas.set(p.partida.id, p);
      }
    } catch {
      // dado corrompido: começa vazio
    }
  }

  private estadoDicas(rodada: RodadaFake): EstadoDicas {
    return {
      imagemUrl: this.imagemUrl(rodada.local, rodada.dicasUsadas),
      nivelRevelacao: rodada.dicasUsadas,
      dicasUsadas: rodada.dicasUsadas,
      maxDicas: MAX_DICAS,
      multiplicadorAtual: this.multiplicador(rodada.dicasUsadas),
      multiplicadorProximaDica:
        rodada.dicasUsadas < MAX_DICAS ? this.multiplicador(rodada.dicasUsadas + 1) : null,
    };
  }

  private multiplicador(dicasUsadas: number): number {
    return Math.max(0, Math.round((1 - PASSO_MULTIPLICADOR * dicasUsadas) * 100) / 100);
  }

  /** Imagem de mentira: um SVG que mostra o nível. Troque por imagens reais quando houver. */
  private imagemUrl(local: LocalFake, nivel: number): string {
    const tamanho = Math.max(1, 28 - nivel * 8); // quanto maior o nível, menos "pixelado"
    const rotulo = nivel > MAX_DICAS ? 'Imagem original' : `Nível ${nivel} (pixelação ${tamanho})`;
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
      `<rect width='640' height='480' fill='hsl(${local.id * 40},50%,60%)'/>` +
      `<text x='320' y='240' font-size='28' text-anchor='middle' fill='white'>${rotulo}</text>` +
      `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  private obterPartida(id: number): PartidaFake {
    const p = this.partidas.get(id);
    if (!p) {
      throw this.erro('NAO_ENCONTRADO', 'Partida não encontrada.');
    }
    return p;
  }

  private obterRodada(rodadaId: number): RodadaFake {
    const p = this.obterPartida(Math.floor(rodadaId / 100));
    const rodada = p.rodadas.find((r) => r.id === rodadaId);
    if (!rodada) {
      throw this.erro('NAO_ENCONTRADO', 'Rodada não encontrada.');
    }
    return rodada;
  }

  private erro(erro: string, mensagem: string): ErroApi {
    return { erro, mensagem };
  }
}